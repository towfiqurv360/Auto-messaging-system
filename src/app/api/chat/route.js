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

        const prompt = `তুমি MD. TOWFIQUR RAHMAN-এর পার্সোনাল স্মার্ট অ্যাসিস্ট্যান্ট হিসেবে মেসেঞ্জারে রিপ্লাই দিচ্ছ। 
        প্রেরক: ${sender}
        মেসেজ: "${message}"

        নির্দেশনা:
        ১. প্রেরক ঠিক যে ভাষায় মেসেজ দিয়েছে, ঠিক সেই ভাষাতেই মার্জিত ও বন্ধুসুলভ উত্তর দাও।
        ২. কোনোভাবেই উল্লেখ করবে না যে তুমি একজন এআই। সরাসরি উত্তর দাও।`;

        // ========================================================
        // THE ULTIMATE BYPASS: Native Fetch (No Google SDK Needed)
        // প্যাকেজের ঝামেলা ছাড়াই সরাসরি API কল করা হচ্ছে
        // ========================================================
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        
        const aiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await aiResponse.json();

        // যদি API থেকে কোনো এরর আসে
        if (!aiResponse.ok) {
            return new NextResponse(`SYSTEM ERROR: ${data.error?.message || 'Unknown API Error'}`);
        }

        // রেসপন্স থেকে টেক্সট বের করা
        let replyText = data.candidates[0].content.parts[0].text.trim();
        replyText = replyText.replace(/^["']|["']$/g, '');
        // ========================================================
        
        await supabase.from('message_logs').insert([{ sender, message, reply: replyText }]);
        
        return new NextResponse(replyText);

    } catch (error) {
        return new NextResponse(`SYSTEM ERROR: ${error.message}`); 
    }
}