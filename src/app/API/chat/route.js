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
        
        // ১. ইগনোর লিস্ট (যাদের মেসেজের রিপ্লাই যাবে না)
        const ignoredSenders = ["Family Group", "University Friends", "Boss", "Unknown"];
        if (ignoredSenders.includes(sender)) {
            return new NextResponse(""); // MacroDroid-এর জন্য ব্ল্যাংক টেক্সট (রিপ্লাই যাবে না)
        }

        // ২. গ্রুপ মেনশন চেক (মেসেজে '@' থাকলে ইগনোর করবে)
        if (message.includes('@')) {
            return new NextResponse(""); 
        }

        // ৩. ইমোজি চেক (যদি মেসেজে শুধুমাত্র ইমোজি থাকে, তবে সেটাই ব্যাক করবে)
        // Regex ব্যবহার করে চেক করা হচ্ছে মেসেজটি পুরোটাই ইমোজি কি না
        const isOnlyEmoji = /^[\p{Emoji}\s]+$/u.test(message) && message.trim().length > 0;
        
        if (isOnlyEmoji) {
            // ডেটাবেসে লগ সেভ করা
            await supabase.from('message_logs').insert([{ sender, message, reply: message }]);
            return new NextResponse(message.trim()); // সেম ইমোজি ব্যাক করবে
        }

        // ৪. Gemini AI সেটআপ
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // ৫. প্রম্পট আপডেট (স্মার্ট রিপ্লাই এবং রিফিউজালের লজিক)
        const prompt = `তুমি MD. TOWFIQUR RAHMAN-এর হয়ে মেসেঞ্জারে রিপ্লাই দিচ্ছ। 
        মেসেজটি পাঠিয়েছে ${sender}, সে লিখেছে: "${message}"। 
        
        নির্দেশনা:
        ১. উত্তরটি খুব ছোট, স্বাভাবিক এবং বন্ধুসুলভ হবে। 
        ২. তুমি যদি মনে করো এই মেসেজের উত্তর তোমার (AI) দেওয়া উচিত নয়, অথবা এমন কোনো সংবেদনশীল/অজানা প্রশ্ন, তাহলে তুমি বলবে: "আমি এখন একটু ব্যস্ত আছি, পরে কথা বলছি।" বা "আমি এখন লাইনে নেই, ফ্রি হয়ে রিপ্লাই দিচ্ছি।"
        ৩. কোনোভাবেই উল্লেখ করবে না যে তুমি একজন এআই।`;
        
        const result = await model.generateContent(prompt);
        const replyText = result.response.text().trim();
        
        // ৬. ডেটাবেসে লগ সেভ করা
        const { error } = await supabase
            .from('message_logs')
            .insert([
                { sender: sender, message: message, reply: replyText }
            ]);
            
        if (error) {
            console.error("Database saving error:", error);
        }
        
        // ৭. MacroDroid-এর জন্য প্লেইন টেক্সট রিটার্ন করা (JSON নয়)
        return new NextResponse(replyText);

    } catch (error) {
        console.error(error);
        return new NextResponse("আমি এখন একটু ব্যস্ত আছি, পরে কথা বলছি।");
    }
}