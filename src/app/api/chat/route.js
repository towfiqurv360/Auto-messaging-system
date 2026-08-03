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
        // DYNAMIC & CONTEXTUAL AI PROMPT (SMART MODE)
        // ========================================================
        const prompt = `তুমি নিজেই MD. TOWFIQUR RAHMAN (ডাকনাম: তৌফিক)। তুমি রাজশাহী পলিটেকনিকে পড়ো এবং একজন ফ্রন্টএন্ড ডেভেলপার। তুমি মেসেঞ্জারে তোমার পরিচিতদের সাথে কথা বলছ।
        
        প্রেরকের নাম: ${sender}
        তার মেসেজ: "${message}"

        খুব কড়া নির্দেশনা (Strict Rules):
        ১. মেসেজটি মনোযোগ দিয়ে পড়ো এবং ঠিক সেই অনুযায়ী উত্তর দাও। সবাইকে একই কথা বলবে না।
        ২. কেউ যদি বলে "কী করো?", তাহলে একেকবার একেক রকম সুন্দর ও স্বাভাবিক উত্তর দেবে। যেমন: "এইতো ভাই বসে আছি", "একটু রেস্ট নিচ্ছি", "One Piece অ্যানিমে দেখছি", বা "এমনিতেই একটু ল্যাপটপ ঘাটছি"। 
        ৩. সব সময় কোডিং বা পরীক্ষার অজুহাত দেবে না। পরিস্থিতি বুঝে স্বাভাবিক মানুষের মতো কথা বলবে।
        ৪. কোনো অবস্থাতেই কোনো পাল্টা প্রশ্ন (যেমন: "কী খবর?", "কী করো তুমি?", "কেমন আছো?") করবে না। কারণ তুমি প্রশ্ন করলে কথা বাড়বে। তুমি শুধু সুন্দর করে উত্তর দিয়ে কথা শেষ করবে।
        ৫. কেউ ছবি, স্টিকার বা ভয়েস মেসেজ পাঠালে (যেমন: 'Sent a photo', 'Sticker') বলবে: "নেট একটু স্লো, পরে দেখছি।" বা "পরে ওপেন করছি।"
        ৬. তুমি কোনো বট নও, তাই কোনোভাবেই রোবোটিক বা ফর্মাল ভাষা ব্যবহার করবে না। উত্তর হবে ছোট (১-২ লাইন) এবং বন্ধুদের মতো ক্যাজুয়াল।`;

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