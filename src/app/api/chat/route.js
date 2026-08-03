import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        if (!supabaseUrl || !supabaseKey || !geminiKey) return new NextResponse("");

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { sender, message } = await request.json();
        
        if (!sender || !message) return new NextResponse("");

        // ========================================================
        // 1. SPAM & MENTION FILTER (Input Preprocessing)
        // ========================================================
        const ignoredSenders = ["Family Group", "University Friends", "Boss", "Unknown"];
        const lowerSender = sender.toLowerCase();
        
        if (ignoredSenders.includes(sender) || message.includes('@') || lowerSender.includes('towfiq') || lowerSender === 'you') {
            return new NextResponse(""); 
        }

        // ========================================================
        // 2. CONVERSATION MEMORY (Supabase History Fetch)
        // ========================================================
        let historyContext = "";
        try {
            // এই ইউজারের সাথে হওয়া লাস্ট ৩টি মেসেজ ডেটাবেস থেকে তুলে আনা হচ্ছে
            const { data } = await supabase
                .from('message_logs')
                .select('message, reply')
                .eq('sender', sender)
                .order('created_at', { ascending: false })
                .limit(3);
            
            if (data && data.length > 0) {
                const historyStr = data.reverse().map(row => `সে বলেছিল: "${row.message}" | তুমি উত্তর দিয়েছিলে: "${row.reply}"`).join('\n');
                historyContext = `\n\n[পূর্ববর্তী কথোপকথন (Context - এই অনুযায়ী বর্তমান মেসেজের উত্তর মেলাবে)]:\n${historyStr}`;
            }
        } catch (err) {
            console.error("History fetch failed, ignoring context.");
        }

        // ========================================================
        // 3. ADVANCED SYSTEM PROMPT (Tone & Validation)
        // ========================================================
        const prompt = `তুমি MD. TOWFIQUR RAHMAN (তৌফিক)। তুমি রাজশাহীতে থাকো এবং একজন জুনিয়র ফ্রন্টএন্ড ডেভেলপার। 
        
        প্রেরক: ${sender}
        বর্তমান মেসেজ: "${message}" ${historyContext}

        কড়া নিয়ম (Strict Rules):
        ১. পূর্ববর্তী কথোপকথন (যদি থাকে) দেখে বোঝো কথার ফ্লো কী। আগের কথার সাথে লজিক্যাল মিল রেখে উত্তর দাও।
        ২. মেসেজটি ছবি/স্টিকার/ভয়েস (যেমন: 'Sticker', 'Sent a photo') হলে শুধু বলবে: "ভাই, ছবি/ভয়েসটা একটু পরে দেখছি।"
        ৩. তুমি AI বা Language Model নও। "As an AI..." টাইপের কোনো কথা বলা সম্পূর্ণ নিষেধ।
        ৪. অযথা প্রশ্ন করে লুপ তৈরি করবে না। স্বাভাবিক ক্যাজুয়াল ভাষায় (১-২ লাইনে) উত্তর দিয়ে কথা শেষ করবে।`;

        // ========================================================
        // 4. LIVE MODEL SCANNING
        // ========================================================
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
        const modelsData = await modelsRes.json();
        if (!modelsData.models) return new NextResponse(""); 

        const validModels = modelsData.models.filter(m => 
            m.supportedGenerationMethods && 
            m.supportedGenerationMethods.includes("generateContent") &&
            m.name.includes("gemini")
        );

        let replyText = "";
        let success = false;

        // ========================================================
        // 5. TEMPERATURE CONTROL & AI DISPATCH
        // ========================================================
        for (const m of validModels) {
            const modelName = m.name.replace('models/', '');
            try {
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;
                
                const aiResponse = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.3, // Hallucination এবং উল্টাপাল্টা কথা কমানোর জন্য টেম্পারেচার লো করা হলো
                            maxOutputTokens: 60 // উত্তর যেন অযথাই বড় না হয়
                        }
                    })
                });

                const data = await aiResponse.json();

                if (aiResponse.ok && data.candidates && data.candidates.length > 0) {
                    replyText = data.candidates[0].content.parts[0].text.trim().replace(/^["']|["']$/g, '');
                    
                    // 6. RESPONSE VALIDATION (ফাঁকা বা AI টাইপ উত্তর ফিল্টার)
                    if (replyText.length > 0 && !replyText.toLowerCase().includes("as an ai")) {
                        success = true;
                        break; 
                    }
                }
            } catch (err) {
                continue;
            }
        }

        if (!success) return new NextResponse(""); 
        
        await supabase.from('message_logs').insert([{ sender, message, reply: replyText }]);
        return new NextResponse(replyText);

    } catch (error) {
        return new NextResponse(""); 
    }
}