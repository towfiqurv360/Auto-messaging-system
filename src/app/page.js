"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Hydration error এড়ানোর জন্য
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`min-h-screen font-sans relative overflow-hidden flex flex-col transition-colors duration-700 ${isDarkMode ? 'bg-[#050505] text-gray-200 selection:bg-indigo-500/30' : 'bg-[#f8fafc] text-gray-800 selection:bg-indigo-500/20'}`}>
      
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 shadow-lg flex items-center gap-2 backdrop-blur-md ${isDarkMode ? 'bg-white/10 text-yellow-400 hover:bg-white/20 border border-white/10' : 'bg-white/80 text-indigo-600 hover:bg-white border border-gray-200 shadow-indigo-100/50'}`}
        >
          {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Background Glow Effects */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 ${isDarkMode ? 'bg-indigo-600/20' : 'bg-indigo-400/20'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 ${isDarkMode ? 'bg-purple-600/20' : 'bg-purple-300/30'}`}></div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 relative z-10 w-full max-w-7xl mx-auto mt-12 md:mt-0">
        
        {/* Top Badge */}
        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-md mb-12 border transition-colors duration-700 shadow-sm ${isDarkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white/60 border-gray-200'}`}>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className={`text-sm font-medium tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>System Online & Intercepting</span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-20 max-w-3xl">
          <h1 className={`text-5xl md:text-7xl font-extrabold mb-6 tracking-tight transition-colors duration-700 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Autonomous <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 animate-gradient-x">
              Neural Reply Engine
            </span>
          </h1>
          <p className={`text-lg leading-relaxed max-w-2xl mx-auto transition-colors duration-700 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            A high-performance background daemon that intercepts notifications, processes context via LLM, and dispatches human-like responses seamlessly.
          </p>
        </div>

        {/* Enterprise Bento Grid Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-20">
          
          {/* Card 1: Interceptor */}
          <div className={`border rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 group ${isDarkMode ? 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]' : 'bg-white/70 border-gray-100 hover:bg-white shadow-xl shadow-indigo-100/40'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border group-hover:scale-110 transition-transform duration-300 ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
              <svg className={`w-6 h-6 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-3 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Event Interceptor</h3>
            <p className={`text-sm leading-relaxed transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Silently monitors device notifications in the background, capturing incoming message payloads without waking the UI.
            </p>
          </div>

          {/* Card 2: AI Core */}
          <div className={`border rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 group md:transform md:-translate-y-4 ${isDarkMode ? 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] shadow-[0_0_40px_rgba(99,102,241,0.05)]' : 'bg-white/70 border-gray-100 hover:bg-white shadow-xl shadow-purple-100/40'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border group-hover:scale-110 transition-transform duration-300 ${isDarkMode ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-100'}`}>
              <svg className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-3 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Gemini Processing</h3>
            <p className={`text-sm leading-relaxed transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Transforms raw text into contextual, highly accurate, and empathetic responses using advanced generative models.
            </p>
          </div>

          {/* Card 3: Dispatcher */}
          <div className={`border rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 group ${isDarkMode ? 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]' : 'bg-white/70 border-gray-100 hover:bg-white shadow-xl shadow-cyan-100/40'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border group-hover:scale-110 transition-transform duration-300 ${isDarkMode ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-50 border-cyan-100'}`}>
              <svg className={`w-6 h-6 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-3 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Silent Dispatch</h3>
            <p className={`text-sm leading-relaxed transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Executes the HTTP response directly into the notification action intent, firing the reply instantly without app interruption.
            </p>
          </div>

        </div>
      </main>

      {/* Premium Dark-Themed Footer */}
      <footer className={`w-full border-t backdrop-blur-lg py-8 z-10 relative transition-colors duration-700 ${isDarkMode ? 'bg-black/40 border-white/[0.05]' : 'bg-white/50 border-gray-200'}`}>
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

      {/* Global CSS for custom animations */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 6s ease infinite;
        }
      `}</style>
    </div>
  );
}