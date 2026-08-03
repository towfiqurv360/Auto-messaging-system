import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        if (!supabaseUrl || !supabaseKey || !geminiKey) {
            return new NextResponse("DEBUG ERROR: Environment Variables Missing"); 
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { sender, message } = await request.json();
        
        if (!sender || !message) {
            return new NextResponse(""); 
        }

        const ignoredSenders = ["Family Group", "University Friends", "Boss", "Unknown"];
        if (ignoredSenders.includes(sender) || message.includes('@')) {
            return new NextResponse(""); 
        }

        // গুগল থেকে লাইভ মডেলের লিস্ট আনা
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
        const modelsData = await modelsRes.json();
        
        if (!modelsData.models) {
            return new NextResponse(`SYSTEM ERROR: Google API Error`);
        }

        // ব্লক করা মডেলগুলো (যেমন: 2.5-flash) বাদ দিয়ে শুধু ভ্যালিড মডেল ফিল্টার করা
        const validModels = modelsData.models.filter(m => 
            m.supportedGenerationMethods && 
            m.supportedGenerationMethods.includes("generateContent") &&
            m.name.includes("gemini") &&
            !m.name.includes("2.5-flash") // এই মডেলটি নতুন ইউজারদের জন্য ব্লকড, তাই বাদ
        );
        
        if (validModels.length === 0) {
             return new NextResponse(`SYSTEM ERROR: No valid models found for your API Key.`);
        }

        // লিস্টের একেবারে শেষের (সবচেয়ে নতুন ও অ্যাক্টিভ) মডেলটি সিলেক্ট করা
        const latestModel = validModels[validModels.length - 1];
        const activeModelName = latestModel.name.replace('models/', '');

        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: activeModelName });
        
        const prompt = `তুমি MD. TOWFIQUR RAHMAN-এর পার্সোনাল স্মার্ট অ্যাসিস্ট্যান্ট হিসেবে মেসেঞ্জারে রিপ্লাই দিচ্ছ। 
        প্রেরক: ${sender}
        মেসেজ: "${message}"

        নির্দেশনা:
        ১. প্রেরক ঠিক যে ভাষায় মেসেজ দিয়েছে, ঠিক সেই ভাষাতেই মার্জিত ও বন্ধুসুলভ উত্তর দাও।
        ২. কোনোভাবেই উল্লেখ করবে না যে তুমি একজন এআই। সরাসরি উত্তর দাও।`;
        
        const result = await model.generateContent(prompt);
        let replyText = result.response.text().trim();
        replyText = replyText.replace(/^["']|["']$/g, '');
        
        await supabase.from('message_logs').insert([{ sender, message, reply: replyText }]);
        
        return new NextResponse(replyText);

    } catch (error) {
        return new NextResponse(`SYSTEM ERROR: ${error.message}`); 
    }
}