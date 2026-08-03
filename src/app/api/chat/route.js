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
        // STAGE 1: লাইভ মডেল লিস্ট নিয়ে আসা (No SDK Needed)
        // ========================================================
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
        const modelsData = await modelsRes.json();
        
        if (!modelsData.models) {
            return new NextResponse(`SYSTEM ERROR: Cannot fetch model list from Google.`);
        }

        // শুধু ভ্যালিড মডেলগুলো ফিল্টার করা
        const validModels = modelsData.models.filter(m => 
            m.supportedGenerationMethods && 
            m.supportedGenerationMethods.includes("generateContent") &&
            m.name.includes("gemini")
        );

        let replyText = "";
        let success = false;
        let lastError = "";
        let testedModels = [];

        // ========================================================
        // STAGE 2: অটো-টেস্টিং লুপ (যেটা কাজ করবে, সেটা থেকেই রিপ্লাই নেবে)
        // ========================================================
        for (const m of validModels) {
            const modelName = m.name.replace('models/', '');
            testedModels.push(modelName);
            
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

                // যদি রেসপন্স সাকসেসফুল হয়
                if (aiResponse.ok && data.candidates && data.candidates.length > 0) {
                    replyText = data.candidates[0].content.parts[0].text.trim();
                    replyText = replyText.replace(/^["']|["']$/g, '');
                    success = true;
                    break; // কাজ হলে লুপ থেকে সঙ্গে সঙ্গে বের হয়ে যাবে
                } else {
                    lastError = data.error?.message || 'Unknown API Error';
                }
            } catch (err) {
                lastError = err.message;
            }
        }

        // যদি গুগলের সব মডেল ফেইল করে
        if (!success) {
            return new NextResponse(`SYSTEM ERROR: Tested all available models [${testedModels.join(', ')}]. Last Error: ${lastError}`);
        }
        // ========================================================
        
        await supabase.from('message_logs').insert([{ sender, message, reply: replyText }]);
        
        return new NextResponse(replyText);

    } catch (error) {
        return new NextResponse(`SYSTEM ERROR: ${error.message}`); 
    }
}