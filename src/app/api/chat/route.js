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

        // ========================================================
        // LOOP PREVENTION & SPAM FILTER
        // ========================================================
        const ignoredSenders = ["Family Group", "University Friends", "Boss", "Unknown"];
        const lowerSender = sender.toLowerCase();
        
        if (ignoredSenders.includes(sender) || message.includes('@') || lowerSender.includes('towfiq') || lowerSender === 'you') {
            return new NextResponse(""); 
        }

        // ========================================================
        // ULTIMATE LOGICAL PROMPT (NO EXAMPLES, NO PARROTING)
        // ========================================================
        const prompt = `তুমি MD. TOWFIQUR RAHMAN (তৌফিক)। তুমি একজন স্বাভাবিক মানুষ এবং ফ্রন্টএন্ড ডেভেলপার। 
        
        প্রেরক: ${sender}
        মেসেজ: "${message}"

        নির্দেশনা (Strict Rules):
        ১. সবার আগে প্রেরকের মেসেজটি ভালোভাবে পড়ো। সে কী জানতে চেয়েছে বা কী বলেছে, ঠিক সেই অনুযায়ী প্রাসঙ্গিক ও সঠিক উত্তর দাও।
        ২. কোনো মুখস্থ উত্তর দেবে না। সবাইকে একই কথা বলবে না। মেসেজ অনুযায়ী লজিক্যাল উত্তর তৈরি করো।
        ৩. তুমি নিজে থেকে কোনো প্রশ্ন করবে না (যেমন: "কী খবর?", "কেমন আছো?")। শুধু উত্তর দিয়ে কথা শেষ করবে।
        ৪. যদি মেসেজে 'Sticker', 'Sent a photo', বা 'Voice message' লেখা থাকে, শুধু তখনই বলবে "ছবি/ভয়েসটা একটু পরে দেখছি ভাই।" এছাড়া অন্য কোনো স্বাভাবিক মেসেজে এই কথা বলবে না।
        ৫. উত্তর একদম ছোট (১-২ লাইন) এবং বন্ধুদের মতো স্বাভাবিক হবে।`;

        // ========================================================
        // LIVE MODEL SCANNING ENGINE
        // ========================================================
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
        const modelsData = await modelsRes.json();
        
        if (!modelsData.models) {
            return new NextResponse(""); 
        }

        const validModels = modelsData.models.filter(m => 
            m.supportedGenerationMethods && 
            m.supportedGenerationMethods.includes("generateContent") &&
            m.name.includes("gemini")
        );

        let replyText = "";
        let success = false;

        for (const m of validModels) {
            const modelName = m.name.replace('models/', '');
            
            try {
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;
                
                const aiResponse = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });

                const data = await aiResponse.json();

                if (aiResponse.ok && data.candidates && data.candidates.length > 0) {
                    replyText = data.candidates[0].content.parts[0].text.trim();
                    replyText = replyText.replace(/^["']|["']$/g, '');
                    success = true;
                    break; 
                }
            } catch (err) {
                continue;
            }
        }

        if (!success) {
            return new NextResponse(""); 
        }
        
        await supabase.from('message_logs').insert([{ sender, message, reply: replyText }]);
        
        return new NextResponse(replyText);

    } catch (error) {
        return new NextResponse(""); 
    }
}