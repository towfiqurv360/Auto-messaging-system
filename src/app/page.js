"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hydration error 
  useEffect(() => {
    setMounted(true);
    fetchLogs();

   
    const interval = setInterval(fetchLogs, 10000);
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
        .order('id', { ascending: false })
        .limit(10); 

      if (!error && data) {
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
    <div className={`min-h-screen font-sans relative flex flex-col transition-colors duration-700 ${isDarkMode ? 'bg-[#050505] text-gray-200 selection:bg-indigo-500/30' : 'bg-[#f0f4f8] text-gray-800 selection:bg-indigo-500/20'}`}>
      
      {/* Background Glow Effects */}
      <div className={`fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 ${isDarkMode ? 'bg-indigo-600/20' : 'bg-indigo-400/10'}`}></div>
      <div className={`fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 ${isDarkMode ? 'bg-purple-600/20' : 'bg-purple-300/20'}`}></div>

      {/* Enterprise Navbar */}
      <nav className={`sticky top-0 z-50 w-full backdrop-blur-xl border-b transition-colors duration-700 ${isDarkMode ? 'bg-[#050505]/70 border-white/[0.05]' : 'bg-white/70 border-gray-200 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isDarkMode ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-indigo-100 border-indigo-200'}`}>
              <span className="text-lg">🤖</span>
            </div>
            <span className={`font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>NeuralReply</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              System Active
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-indigo-600'}`}
              title="Toggle Theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Hero & Stats (Spans 5 columns on large screens) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <h1 className={`text-4xl md:text-6xl font-extrabold mb-4 tracking-tight transition-colors duration-700 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Autopilot <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 animate-gradient-x">
              Engaged.
            </span>
          </h1>
          <p className={`text-base mb-10 leading-relaxed transition-colors duration-700 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Your background daemon is currently intercepting notifications, analyzing context via Gemini LLM, and dispatching human-like responses seamlessly.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${isDarkMode ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-white border-gray-200 shadow-sm'}`}>
              <p className={`text-xs uppercase tracking-wider mb-1 font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Engine Status</p>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Operational</p>
            </div>
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${isDarkMode ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-white border-gray-200 shadow-sm'}`}>
              <p className={`text-xs uppercase tracking-wider mb-1 font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Responses Sent</p>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{logs.length > 0 ? logs.length + '+' : '0'}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Activity Feed (Spans 7 columns on large screens) */}
        <div className="lg:col-span-7">
          <div className={`h-full min-h-[500px] rounded-3xl border backdrop-blur-xl flex flex-col overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-white/80 border-gray-200 shadow-xl shadow-indigo-100/40'}`}>
            
            {/* Feed Header */}
            <div className={`px-6 py-5 border-b flex items-center justify-between ${isDarkMode ? 'border-white/[0.05]' : 'border-gray-100'}`}>
              <h3 className={`font-semibold text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Live Execution Logs
              </h3>
              <button onClick={fetchLogs} className={`text-xs px-3 py-1.5 rounded-full transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                Refresh
              </button>
            </div>

            {/* Feed Content */}
            <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                // Loading Skeleton
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`p-4 rounded-2xl animate-pulse ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                      <div className={`h-4 w-1/4 rounded mb-3 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                      <div className={`h-3 w-3/4 rounded mb-2 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                      <div className={`h-3 w-1/2 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                    </div>
                  ))}
                </div>
              ) : logs.length === 0 ? (
                // Empty State
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  <p className="text-lg font-medium">No replies dispatched yet.</p>
                  <p className="text-sm mt-1">Waiting for incoming events...</p>
                </div>
              ) : (
                // Data List
                <div className="space-y-4">
                  {logs.map((log, index) => (
                    <div key={index} className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] duration-200 ${isDarkMode ? 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.06]' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`font-semibold text-sm px-2.5 py-1 rounded-md ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>
                          @{log.sender || "Unknown User"}
                        </span>
                        <span className={`text-xs font-mono opacity-60`}>
                          {log.created_at ? new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-black/20 border-white/5 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                          <p className="text-xs font-semibold opacity-50 mb-1 uppercase tracking-wider">Received</p>
                          <p className="text-sm">{log.message}</p>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 mt-1 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                          <div className={`flex-1 p-3 rounded-xl border ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-gray-200' : 'bg-emerald-50 border-emerald-100 text-gray-800'}`}>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">AI Dispatched</p>
                            <p className="text-sm">{log.reply}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </main>

      {/* Premium Dark-Themed Footer */}
      <footer className={`w-full mt-auto border-t backdrop-blur-lg py-6 z-10 relative transition-colors duration-700 ${isDarkMode ? 'bg-[#050505]/80 border-white/[0.05]' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
            <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className={`text-sm font-medium tracking-wider uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Engineered for Excellence</span>
          </div>
          
          <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            Architected by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 font-bold tracking-widest ml-1">MD. TOWFIQUR RAHMAN</span>
          </div>
        </div>
      </footer>

      {/* Global CSS */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 6s ease infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </div>
  );
}