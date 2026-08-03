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
        
        // ========================================================
        // PERMANENT SOLUTION: Fallback Array
        // গুগল যেকোনো মডেল ব্লক করলেও, এই লিস্টের কোনো না কোনোটা কাজ করবেই।
        // ========================================================
        const safeModels = [
            "gemini-1.5-flash",       // ফার্স্ট চয়েস (সবচেয়ে ফাস্ট)
            "gemini-1.5-flash-8b",    // সেকেন্ড চয়েস (লাইটওয়েট ও ফ্রি)
            "gemini-1.5-flash-001",   // থার্ড চয়েস (পুরোনো কিন্তু স্টেবল)
            "gemini-1.5-flash-002",   // ফোর্থ চয়েস
            "gemini-1.0-pro"          // আল্টিমেট ফলব্যাক (কখনো ফেল করে না)
        ];

        const prompt = `তুমি MD. TOWFIQUR RAHMAN-এর পার্সোনাল স্মার্ট অ্যাসিস্ট্যান্ট হিসেবে মেসেঞ্জারে রিপ্লাই দিচ্ছ। 
        প্রেরক: ${sender}
        মেসেজ: "${message}"

        নির্দেশনা:
        ১. প্রেরক ঠিক যে ভাষায় মেসেজ দিয়েছে, ঠিক সেই ভাষাতেই মার্জিত ও বন্ধুসুলভ উত্তর দাও।
        ২. কোনোভাবেই উল্লেখ করবে না যে তুমি একজন এআই। সরাসরি উত্তর দাও।`;

        let replyText = "";
        let success = false;
        let lastError = "";

        // লুপ চালিয়ে একটার পর একটা মডেল ট্রাই করবে
        for (const modelName of safeModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                
                replyText = result.response.text().trim().replace(/^["']|["']$/g, '');
                success = true;
                break; // সফল হলে লুপ থেকে বের হয়ে যাবে
                
            } catch (err) {
                lastError = err.message;
                // ফেইল করলে নীরবে পরের মডেলে চলে যাবে
                continue; 
            }
        }

        // যদি লিস্টের ৫টি মডেলই ফেইল করে (যেটা অসম্ভব)
        if (!success) {
             return new NextResponse(`SYSTEM ERROR: All fallback models failed. Last Error: ${lastError}`);
        }
        // ========================================================
        
        await supabase.from('message_logs').insert([{ sender, message, reply: replyText }]);
        
        return new NextResponse(replyText);

    } catch (error) {
        return new NextResponse(`SYSTEM ERROR: ${error.message}`); 
    }
}