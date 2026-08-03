import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        // Verify Environment Variables
        if (!supabaseUrl || !supabaseKey || !geminiKey) {
            console.error("Critical Error: Missing Environment Variables");
            return new NextResponse(""); 
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { sender, message } = await request.json();
        
        // Validate payload from webhook
        if (!sender || !message) {
            return new NextResponse(""); 
        }

        // Filter ignored senders and group mentions
        const ignoredSenders = ["Family Group", "University Friends", "Boss", "Unknown"];
        if (ignoredSenders.includes(sender) || message.includes('@')) {
            return new NextResponse(""); 
        }

        // Initialize Google Generative AI with updated model
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
        // AI Prompt (Kept in Bengali as per instruction logic)
        const prompt = `তুমি MD. TOWFIQUR RAHMAN-এর পার্সোনাল স্মার্ট অ্যাসিস্ট্যান্ট হিসেবে মেসেঞ্জারে রিপ্লাই দিচ্ছ। 
        প্রেরক: ${sender}
        মেসেজ: "${message}"

        নির্দেশনা:
        ১. প্রেরক ঠিক যে ভাষায় মেসেজ দিয়েছে, ঠিক সেই ভাষাতেই মার্জিত ও বন্ধুসুলভ উত্তর দাও।
        ২. কোনোভাবেই উল্লেখ করবে না যে তুমি একজন এআই। সরাসরি উত্তর দাও।`;
        
        // Generate AI response
        const result = await model.generateContent(prompt);
        let replyText = result.response.text().trim();
        
        // Sanitize output by removing unwanted quotes
        replyText = replyText.replace(/^["']|["']$/g, '');
        
        // Log transaction to Supabase Database
        const { error: dbError } = await supabase
            .from('message_logs')
            .insert([{ sender, message, reply: replyText }]);
            
        if (dbError) {
            console.error("Database Insert Error:", dbError.message);
        }
        
        return new NextResponse(replyText);

    } catch (error) {
        // Fail silently to prevent unwanted automated replies
        console.error("System Error:", error.message || error);
        return new NextResponse(""); 
    }
}