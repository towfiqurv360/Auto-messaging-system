import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        if (!supabaseUrl || !supabaseKey || !geminiKey) {
            console.error("Critical: API Keys are missing in Vercel Environment Variables.");
            return new NextResponse(""); 
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

        
        const isOnlyEmoji = /^[\p{Emoji}\s]+$/u.test(message) && message.trim().length > 0;
        if (isOnlyEmoji) {
            await supabase.from('message_logs').insert([{ sender, message, reply: message.trim() }]);
            return new NextResponse(message.trim()); 
        }

        
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `তুমি MD. TOWFIQUR RAHMAN-এর পার্সোনাল স্মার্ট অ্যাসিস্ট্যান্ট হিসেবে মেসেঞ্জারে রিপ্লাই দিচ্ছ। 
        প্রেরক: ${sender}
        মেসেজ: "${message}"

        নির্দেশনা:
        ১. প্রেরক ঠিক যে ভাষায় মেসেজ দিয়েছে (বাংলা, ইংরেজি, বাংলিশ, বা অন্য কোনো ভাষা), ঠিক সেই ভাষাতেই মার্জিত, সুন্দর এবং বন্ধুসুলভ উত্তর দাও।
        ২. উত্তরের টোন হবে অত্যন্ত স্মার্ট, প্রফেশনাল এবং স্বাভাবিক (মানুষের মতো)। কোনো রোবটিক বা সস্তা ভাষা ব্যবহার করা যাবে না।
        ৩. যদি কেউ শুধু "Hi", "Hello" বা "কী অবস্থা" লেখে, তবে সুন্দর করে কুশল বিনিময় করে জানতে চাও সে কেমন আছে বা কী কাজে নক দিয়েছে।
        ৪. তুমি যে একজন এআই (AI) বা বট, তা কোনোভাবেই উল্লেখ করবে না। সরাসরি সাধারণ মানুষের মতো উত্তর দাও।`;
        
        
        const result = await model.generateContent(prompt);
        let replyText = result.response.text().trim();
        replyText = replyText.replace(/^["']|["']$/g, ''); 
        
        
        const { error: dbError } = await supabase
            .from('message_logs')
            .insert([{ sender, message, reply: replyText }]);
            
        if (dbError) {
            console.error("Database Insert Error:", dbError.message);
        }
        
        return new NextResponse(replyText);

    } catch (error) {
        
        console.error("System Error:", error.message || error);
        return new NextResponse(""); 
    }
}