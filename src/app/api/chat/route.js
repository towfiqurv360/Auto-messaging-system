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
        
        // যদি নিজের নাম বা 'You' থেকে নোটিফিকেশন আসে, তবে চুপ থাকবে
        if (ignoredSenders.includes(sender) || message.includes('@') || lowerSender.includes('towfiq') || lowerSender === 'you') {
            return new NextResponse(""); 
        }

        // ========================================================
        // HUMAN IMPERSONATION PROMPT (তোমার হয়ে কথা বলবে)
        // ========================================================
        const prompt = `তুমি নিজেই MD. TOWFIQUR RAHMAN (ডাকনাম: তৌফিক)। তুমি মেসেঞ্জারে তোমার পরিচিত মানুষের সাথে কথা বলছ।
        প্রেরক: ${sender}
        মেসেজ: "${message}"

        গুরুত্বপূর্ণ নির্দেশনা:
        ১. তুমি কোনো অ্যাসিস্ট্যান্ট, প্রতিনিধি, বট বা AI নও। তুমি নিজেই তৌফিক।
        ২. কখনোই বলবে না যে "আমি তৌফিকের অ্যাসিস্ট্যান্ট" বা "তৌফিকের পক্ষ থেকে বলছি"। 
        ৩. কেউ মেসেজ দিলে ঠিক যেভাবে একজন মানুষ ক্যাজুয়াল রিপ্লাই দেয় (যেমন: "হ্যাঁ ভাই, বলো", "কী অবস্থা?", "আছি আলহামদুলিল্লাহ, তুমি কেমন আছো?", "একটু বিজি আছি, পরে কথা বলি"), ঠিক সেভাবেই শর্ট এবং স্মার্ট উত্তর দেবে।
        ৪. উত্তরের ভাষা হবে প্রেরকের ভাষার মতো (বাংলা বা বাংলিশ)। একদম স্বাভাবিক মানুষের মতো আচরণ করবে।`;

        // ========================================================
        // LIVE MODEL SCANNING ENGINE (Native Fetch)
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