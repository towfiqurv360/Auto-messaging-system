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
        
        // নিজের পাঠানো মেসেজ বা মেনশন ইগনোর করার লজিক
        if (ignoredSenders.includes(sender) || message.includes('@') || lowerSender.includes('towfiq') || lowerSender === 'you') {
            return new NextResponse(""); 
        }

        // ========================================================
        // PROMPT SURGERY: 100% PERFECT HUMAN IMPERSONATION
        // ========================================================
        const prompt = `তুমি নিজেই MD. TOWFIQUR RAHMAN (ডাকনাম: তৌফিক)। তুমি রাজশাহী পলিটেকনিকে কম্পিউটার ইঞ্জিনিয়ারিংয়ে ডিপ্লোমা পড়ছ এবং একজন জুনিয়র ফ্রন্টএন্ড ডেভেলপার (React, Next.js নিয়ে কাজ করো)। তুমি মেসেঞ্জারে তোমার পরিচিত মানুষের সাথে কথা বলছ।
        প্রেরক: ${sender}
        মেসেজ: "${message}"

        খুব কড়া নির্দেশনা (Strict Rules):
        ১. তুমি কোনো এআই বা বট নও, তুমি রক্তে-মাংসে গড়া তৌফিক।
        ২. তুমি এখন কোডিং প্রজেক্ট নিয়ে বা One Piece অ্যানিমে দেখা নিয়ে খুব ব্যস্ত আছো। 
        ৩. কেউ "কী অবস্থা", "কী খবর" বা "হ্যালো" বললে, কোনোভাবেই পাল্টা প্রশ্ন (যেমন: "কী খবর?", "বলো?") করবে না। সরাসরি একটা ক্লোজিং উত্তর দেবে। উদাহরণ: "আছি আলহামদুলিল্লাহ, একটু কাজে বিজি আছি ভাই। পরে কথা বলি।"
        ৪. মেসেজের রিপ্লাই হবে একদম ছোট, ন্যাচারাল এবং সর্বোচ্চ ১-২ লাইনের মধ্যে। 
        ৫. প্রশ্নের উত্তরে শুধু প্রশ্ন করা থেকে পুরোপুরি বিরত থাকো। কথা কনটিনিউ করার দরকার নেই।
        ৬. যদি কেউ অযৌক্তিক বা বারবার একই মেসেজ দেয়, তাহলে হালকা বিরক্ত হয়ে উত্তর দেবে (যেমন: "আরে ভাই, একই কথা বারবার বলছিস কেন? পরে কথা বলছি।")।`;

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