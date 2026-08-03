"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase Initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hydration & Real-time Fetching
  useEffect(() => {
    setMounted(true);
    fetchLogs();

    // প্রতি ৫ সেকেন্ড পর পর নতুন মেসেজ চেক করবে
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('message_logs')
        .select('*')
        .order('created_at', { ascending: false }) // id এর বদলে created_at দিয়ে ফিল্টার
        .limit(15); 

      if (error) {
        console.error("Supabase Error:", error.message);
      } else if (data) {
        setLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen font-sans relative flex flex-col transition-colors duration-700 overflow-hidden ${isDarkMode ? 'bg-[#000000] text-gray-200' : 'bg-[#f8fafc] text-gray-800'}`}>
      
      {/* Dynamic Background Glow Effects */}
      <div className={`fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000 ${isDarkMode ? 'bg-indigo-900/40' : 'bg-indigo-300/30'}`}></div>
      <div className={`fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000 ${isDarkMode ? 'bg-emerald-900/30' : 'bg-blue-300/30'}`}></div>

      {/* Premium Glassmorphism Navbar */}
      <nav className={`sticky top-0 z-50 w-full backdrop-blur-2xl border-b transition-colors duration-700 ${isDarkMode ? 'bg-[#0a0a0a]/70 border-white/[0.08]' : 'bg-white/70 border-gray-200/80 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30' : 'bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-200'}`}>
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <h1 className={`font-black text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AutoReply<span className="text-indigo-500">.AI</span></h1>
              <p className={`text-[10px] uppercase tracking-widest font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Enterprise Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold shadow-inner ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              System Live
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-full transition-all duration-300 shadow-md ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-yellow-400' : 'bg-white hover:bg-gray-50 text-indigo-600 border border-gray-200'}`}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-10 relative z-10 flex flex-col lg:flex-row gap-10">
        
        {/* Left Side: Stats & Info */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className={`p-8 rounded-3xl border backdrop-blur-xl ${isDarkMode ? 'bg-[#111111]/80 border-white/[0.05]' : 'bg-white border-gray-200/80 shadow-xl shadow-indigo-100/40'}`}>
            <h2 className={`text-4xl font-extrabold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 animate-gradient-x">
                Gemini AI
              </span><br/> Interceptor
            </h2>
            <p className={`text-sm mt-4 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              System is actively monitoring incoming notifications and utilizing Google Generative AI to dispatch human-like intelligent responses in real-time.
            </p>

            <div className="mt-8 space-y-4">
              <div className={`p-4 rounded-2xl flex items-center justify-between border ${isDarkMode ? 'bg-black/50 border-white/[0.05]' : 'bg-gray-50 border-gray-100'}`}>
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Handled</span>
                <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-indigo-600'}`}>{logs.length > 0 ? logs.length : '0'}</span>
              </div>
              <div className={`p-4 rounded-2xl flex items-center justify-between border ${isDarkMode ? 'bg-black/50 border-white/[0.05]' : 'bg-gray-50 border-gray-100'}`}>
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Database Link</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Connected
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chat Interface Log */}
        <div className="w-full lg:w-2/3">
          <div className={`h-[650px] rounded-3xl border backdrop-blur-xl flex flex-col overflow-hidden ${isDarkMode ? 'bg-[#111111]/80 border-white/[0.05]' : 'bg-white border-gray-200/80 shadow-2xl shadow-indigo-100/50'}`}>
            
            {/* Log Header */}
            <div className={`px-6 py-5 border-b flex items-center justify-between backdrop-blur-md ${isDarkMode ? 'border-white/[0.05] bg-black/20' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <h3 className={`font-semibold ml-2 text-sm tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Live Terminal Feed
                </h3>
              </div>
              <button onClick={fetchLogs} className={`text-xs px-4 py-1.5 rounded-full font-medium transition-all ${isDarkMode ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'}`}>
                Force Sync
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-grow p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <span className="text-6xl mb-4">📭</span>
                  <p className="text-lg font-medium">No messages intercepted yet.</p>
                  <p className="text-sm mt-1">Waiting for MacroDroid triggers...</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex flex-col gap-2 w-full animate-fade-in">
                    
                    {/* Timestamp & Sender Badge */}
                    <div className="flex justify-center my-2">
                      <span className={`text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full ${isDarkMode ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                        {log.created_at ? new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'} • {log.sender}
                      </span>
                    </div>

                    {/* Incoming Message Bubble (Left) */}
                    <div className="flex w-full justify-start">
                      <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl rounded-tl-sm shadow-sm ${isDarkMode ? 'bg-[#1e1e1e] text-gray-200 border border-white/[0.05]' : 'bg-gray-100 text-gray-800 border border-gray-200/50'}`}>
                        <p className="text-sm leading-relaxed">{log.message}</p>
                      </div>
                    </div>

                    {/* AI Reply Bubble (Right) */}
                    <div className="flex w-full justify-end mt-1">
                      <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl rounded-tr-sm shadow-md bg-gradient-to-br ${isDarkMode ? 'from-indigo-600 to-purple-600 text-white' : 'from-indigo-500 to-purple-500 text-white'}`}>
                        <div className="flex items-center gap-2 mb-1.5 opacity-80">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          <span className="text-[10px] uppercase tracking-wider font-bold">AI Response</span>
                        </div>
                        <p className="text-sm leading-relaxed">{log.reply}</p>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`w-full mt-auto border-t py-6 z-10 relative ${isDarkMode ? 'bg-[#0a0a0a] border-white/[0.05]' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-60">
            <span className="text-lg">🤖</span>
            <span className={`text-xs font-bold tracking-widest uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>NeuralReply Engine</span>
          </div>
          
          <div className={`text-xs font-medium tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Architected by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 font-black ml-1">MD. TOWFIQUR RAHMAN</span>
          </div>
        </div>
      </footer>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 6s ease infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.6); }
      `}</style>
    </div>
  );
}