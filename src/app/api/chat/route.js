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
        if (message && message.includes('@')) {
            return new NextResponse(""); 
        }

        // ৩. ইমোজি চেক (যদি মেসেজে শুধুমাত্র ইমোজি থাকে, তবে সেটাই ব্যাক করবে)
        const isOnlyEmoji = message && /^[\p{Emoji}\s]+$/u.test(message) && message.trim().length > 0;
        
        if (isOnlyEmoji) {
            // ডেটাবেসে লগ সেভ করা
            await supabase.from('message_logs').insert([{ sender, message, reply: message }]);
            return new NextResponse(message.trim()); // সেম ইমোজি ব্যাক করবে
        }

        // ৪. Gemini AI সেটআপ
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // ৫. প্রম্পট আপডেট (স্মার্ট ও স্বাভাবিক কথোপকথনের জন্য ফিক্সড)
        const prompt = `তুমি MD. TOWFIQUR RAHMAN-এর হয়ে মেসেঞ্জারে চ্যাট করছ। 
        তোমার বন্ধু বা পরিচিত ${sender} তোমাকে এই মেসেজটি পাঠিয়েছে: "${message}"। 
        
        নির্দেশনা:
        ১. উত্তরটি একদম সংক্ষিপ্ত, মানুষের মতো স্বাভাবিক, ক্যাজুয়াল এবং বন্ধুসুলভ হবে (যেমনটা মেসেঞ্জারে চ্যাট করার সময় মানুষ লেখে)। 
        ২. কোনো কৃত্রিম বা ফরমাল ভাষা ব্যবহার করবে না। উত্তর যেন মুখস্থ বা রোবটিক না লাগে।
        ৩. কোনোভাবেই উল্লেখ করবে না যে তুমি একজন এআই বা বট। সরাসরি সাধারণ মানুষের মতো উত্তর দাও।`;
        
        const result = await model.generateContent(prompt);
        let replyText = result.response.text().trim();
        
        // জেমিনি অনেক সময় উত্তরে অতিরিক্ত কোটেশন মার্ক (" ") জুড়ে দেয়, সেটা পরিষ্কার করা
        replyText = replyText.replace(/^["']|["']$/g, '');
        
        // ৬. ডেটাবেসে লগ সেভ করা
        const { error } = await supabase
            .from('message_logs')
            .insert([
                { sender: sender, message: message, reply: replyText }
            ]);
            
        if (error) {
            console.error("Database saving error:", error);
        }
        
        // ৭. MacroDroid-এর জন্য প্লেইন টেক্সট রিটার্ন করা
        return new NextResponse(replyText);

    } catch (error) {
        console.error("API Error:", error);
        // জরুরি প্রয়োজনে ফলব্যাক টেক্সট, যা এখন আর অযথা আসবে না
        return new NextResponse("হুম, বলো?"); 
    }
}