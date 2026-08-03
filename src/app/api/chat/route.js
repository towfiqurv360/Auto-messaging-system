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

        const lowerSender = sender.toLowerCase();
        const lowerMessage = message.toLowerCase();

        // ========================================================
        // 1. SPAM & SYSTEM VARIABLE INTERCEPTOR (The Bug Fix)
        // ========================================================
        const ignoredSenders = ["Family Group", "University Friends", "Boss", "Unknown"];
        if (ignoredSenders.includes(sender) || message.includes('@') || lowerSender.includes('towfiq') || lowerSender === 'you') {
            return new NextResponse(""); 
        }

        // যদি MacroDroid থেকে ভুল করে সিস্টেম ভেরিয়েবল বা টিকার টেক্সট চলে আসে, তবে সাইলেন্টলি ড্রপ করবে
        if (lowerMessage.includes('notification_ticker') || lowerMessage.includes('notification') || lowerMessage.includes('ticker')) {
            return new NextResponse("");
        }

        // মিডিয়া বা ফাঁকা টেক্সট ফিল্টার
        const systemKeywords = ["sticker", "স্টিকার", "sent a photo", "photo", "ছবি", "attachment", "gif"];
        if (systemKeywords.some(keyword => lowerMessage.includes(keyword)) || message.trim().length <= 1) {
            return new NextResponse(""); 
        }

        // ========================================================
        // 2. CONVERSATION MEMORY (Supabase History Fetch)
        // ========================================================
        let historyContext = "";
        try {
            const { data } = await supabase
                .from('message_logs')
                .select('message, reply')
                .eq('sender', sender)
                .order('created_at', { ascending: false })
                .limit(3);
            
            if (data && data.length > 0) {
                const historyStr = data.reverse().map(row => `সে বলেছিল: "${row.message}" | তুমি উত্তর দিয়েছিলে: "${row.reply}"`).join('\n');
                historyContext = `\n\n[পূর্ববর্তী কথোপকথন (Context)]:\n${historyStr}`;
            }
        } catch (err) {
            console.error("History fetch failed");
        }

        // ========================================================
        // 3. ADVANCED SYSTEM PROMPT
        // ========================================================
        const prompt = `তুমি MD. TOWFIQUR RAHMAN (তৌফিক)। তুমি রাজশাহীতে থাকো এবং একজন জুনিয়র ফ্রন্টএন্ড ডেভেলপার। 
        
        প্রেরক: ${sender}
        বর্তমান মেসেজ: "${message}" ${historyContext}

        কড়া নিয়ম (Strict Rules):
        ১. প্রেরকের মেসেজটি মনোযোগ দিয়ে পড়ো এবং তার সাথে লজিক্যাল মিল রেখে উত্তর দাও। যেমন সে "Khabe?" বা "Ki koro" বললে সেটার স্বাভাবিক ক্যাজুয়াল উত্তর দাও।
        ২. তুমি AI নও। "As an AI..." টাইপের কোনো কথা বলা সম্পূর্ণ নিষেধ।
        ৩. অযথা প্রশ্ন করে লুপ তৈরি করবে না। স্বাভাবিক ক্যাজুয়াল ভাষায় (১-২ লাইনে) উত্তর দিয়ে কথা শেষ করবে।`;

        // ========================================================
        // 4. LIVE MODEL SCANNING & DISPATCH
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
                            temperature: 0.3,
                            maxOutputTokens: 60
                        }
                    })
                });

                const data = await aiResponse.json();

                if (aiResponse.ok && data.candidates && data.candidates.length > 0) {
                    replyText = data.candidates[0].content.parts[0].text.trim().replace(/^["']|["']$/g, '');
                    
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