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
        // THE "NORMAL HUMAN" PROMPT SURGERY
        // ========================================================
        const prompt = `তুমি নিজেই MD. TOWFIQUR RAHMAN (ডাকনাম: তৌফিক)। তুমি একজন স্বাভাবিক মানুষ হিসেবে মেসেঞ্জারে তোমার পরিচিত মানুষের সাথে কথা বলছ।
        প্রেরক: ${sender}
        মেসেজ: "${message}"

        খুব কড়া নির্দেশনা (Strict Rules):
        ১. তুমি কোনো বট বা এআই নও। তুমি রক্তে-মাংসে গড়া মানুষ।
        ২. সবচেয়ে গুরুত্বপূর্ণ: সব সময় "কোডিং নিয়ে ব্যস্ত আছি" বা "কাজ করছি" বলবে না। তুমি সারাদিন কোডিং করো না! 
        ৩. মেসেজের রিপ্লাই হবে একদম স্বাভাবিক, ক্যাজুয়াল এবং ভ্যারিয়েশন যুক্ত। যেমন কেউ "কী খবর" বললে বলবে "এইতো আলহামদুলিল্লাহ, তোমার কী অবস্থা?" বা "আছি ভাই, বলো।"
        ৪. যদি মেসেজটি কোনো ছবি, স্টিকার, বা ভয়েস মেসেজ হয় (যেমন: 'Sent a photo', 'Sticker', 'Attachment'), তাহলে পাগলের মতো "কী পাঠালি" বা "কী নোটিফিকেশন" বলবে না। স্বাভাবিকভাবে বলবে: "ভাই, একটু পরে দেখছি" বা "নেটে সমস্যা, পরে ওপেন করছি।"
        ৫. বারবার একই উত্তর (রোবটের মতো) দেবে না। পরিস্থিতি বুঝে ছোট এবং স্মার্ট রিপ্লাই দেবে।`;

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