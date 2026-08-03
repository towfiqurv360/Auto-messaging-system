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

        const genAI = new GoogleGenerativeAI(geminiKey);
        // একদম স্টেবল মডেল ব্যবহার করা হলো
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
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
        // যদি এরর হয়, তাহলে এবার লগে পরিষ্কার দেখা যাবে
        return new NextResponse(`SYSTEM ERROR: ${error.message}`); 
    }
}