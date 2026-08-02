import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
    try {

        const { sender, message } = await request.json();
        
       
        const ignoredSenders = ["Family Group", "University Friends", "Boss", "Unknown"];
        
        
        if (ignoredSenders.includes(sender)) {
            return NextResponse.json({ reply: "" }, { status: 200 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `তুমি একজন সাধারণ মানুষের মতো মেসেঞ্জারে রিপ্লাই দেবে। মেসেজটি পাঠিয়েছে ${sender}, সে লিখেছে: "${message}"। উত্তরটি ছোট, সুন্দর এবং প্রাসঙ্গিক হবে।`;
        
        const result = await model.generateContent(prompt);
        const replyText = result.response.text().trim();
        
        const { error } = await supabase
            .from('message_logs')
            .insert([
                { sender: sender, message: message, reply: replyText }
            ]);
            
        if (error) {
            console.error("Database saving error:", error);
        }
        
        return NextResponse.json({ reply: replyText });

    } catch (error) {
        return NextResponse.json({ reply: "Sorry, an error occurred in the system." }, { status: 500 });
    }
}