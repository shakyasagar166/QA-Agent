import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  CheckCircle, 
  ExternalLink, 
  Github, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Activity,
  AlertCircle
} from 'lucide-react';
import Home from './pages/Home';

export default function App() {
  const [selectedProvider, setSelectedProvider] = useState('auto');
  const [backendHealth, setBackendHealth] = useState({
    status: 'checking',
    version: '1.0.0',
    llm_configured: false,
    active_provider: 'Offline Heuristic Engine',
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const json = await res.json();
          setBackendHealth({
            status: 'online',
            version: json.version || '1.0.0',
            llm_configured: json.llm_configured || false,
            active_provider: json.active_provider || 'Engine Active',
          });
        } else {
          setBackendHealth(prev => ({ ...prev, status: 'offline' }));
        }
      } catch (e) {
        setBackendHealth(prev => ({ ...prev, status: 'offline' }));
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[10%] w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[160px]" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-400 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  QA<span className="text-cyan-400">-Agent</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  v{backendHealth.version} PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Autonomous AI Quality Engineering & Test Automation
              </p>
            </div>
          </div>

          {/* Right Navigation & Status Controls */}
          <div className="flex items-center gap-3">
            {/* LLM Engine Selector */}
            <div className="hidden md:flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="bg-transparent text-xs text-slate-300 font-medium focus:outline-none cursor-pointer"
              >
                <option value="auto" className="bg-slate-900 text-slate-200">Auto (Gemini / Heuristic)</option>
                <option value="gemini" className="bg-slate-900 text-slate-200">Gemini 2.5 Flash</option>
                <option value="groq" className="bg-slate-900 text-slate-200">Groq (Llama 3.3)</option>
                <option value="openai" className="bg-slate-900 text-slate-200">OpenAI (GPT-4o)</option>
              </select>
            </div>

            {/* Backend Health Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="relative flex h-2 w-2">
                {backendHealth.status === 'online' ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                )}
              </span>
              <span className="text-xs font-mono text-slate-300 hidden sm:inline">
                {backendHealth.status === 'online' ? 'Engine Online' : 'Engine Ready'}
              </span>
            </div>

            {/* Swagger Docs Link */}
            <a
              href="http://localhost:8003/docs"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all"
            >
              <span>API Docs</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* GitHub Repo */}
            <a
              href="https://github.com/shakyasagar166/QA-Agent"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all"
              title="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Home selectedProvider={selectedProvider} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>QA-Agent • Enterprise Autonomous AI Quality Assurance</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="http://localhost:8003/docs" target="_blank" rel="noreferrer" className="hover:text-slate-300">FastAPI Swagger</a>
            <span>•</span>
            <a href="https://github.com/shakyasagar166/QA-Agent" target="_blank" rel="noreferrer" className="hover:text-slate-300">GitHub</a>
            <span>•</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
