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

        // ========================================================
        // STRICT FREE-TIER FILTERING
        // ========================================================
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
        const modelsData = await modelsRes.json();
        
        if (!modelsData.models) {
            return new NextResponse(`SYSTEM ERROR: Google API Error`);
        }

        // কড়া ফিল্টার: Preview, Experimental এবং ব্লকড মডেলগুলো বাদ দেওয়া হচ্ছে
        const validModels = modelsData.models.filter(m => 
            m.supportedGenerationMethods && 
            m.supportedGenerationMethods.includes("generateContent") &&
            m.name.includes("gemini") &&
            !m.name.includes("preview") &&      // প্রিভিউ মডেল বাদ
            !m.name.includes("experimental") && // এক্সপেরিমেন্টাল বাদ
            !m.name.includes("2.5-flash")       // ব্লকড মডেল বাদ
        );
        
        if (validModels.length === 0) {
             return new NextResponse(`SYSTEM ERROR: No valid free-tier models found.`);
        }

        // সবচেয়ে স্টেবল 1.5-flash (যেমন: 001, 002 বা 8b) ভার্সন খোঁজা হচ্ছে
        let selectedModel = validModels.find(m => m.name.includes("gemini-1.5-flash"));
        
        // যদি নির্দিষ্ট flash মডেল না পায়, তবে লিস্টের প্রথম স্টেবল মডেলটি নেবে
        if (!selectedModel) {
            selectedModel = validModels[0];
        }

        const activeModelName = selectedModel.name.replace('models/', '');
        // ========================================================

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