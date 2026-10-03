import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  FileCode, 
  Play,
  ArrowRight,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export default function ScenarioBuilder({ selectedProvider }) {
  const [story, setStory] = useState('As an authenticated shopper, when I add items to my cart and apply a 20% discount coupon code "SUMMER20", the cart total should update automatically. When I proceed to payment with a valid credit card, the order should complete, redirect to confirmation page with an order ID, and trigger an email confirmation.');
  const [framework, setFramework] = useState('Playwright');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [presets, setPresets] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('scenarios'); // 'scenarios' | 'code'

  useEffect(() => {
    fetch('/api/scenarios/presets')
      .then(res => res.json())
      .then(json => {
        if (json.data && Array.isArray(json.data)) {
          setPresets(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!story.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/scenarios/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_story: story,
          framework: framework,
          provider: selectedProvider,
        }),
      });
      const json = await res.json();
      if (json.data) {
        setResult(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!result?.executable_test_code) return;
    navigator.clipboard.writeText(result.executable_test_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="glass-panel-qa rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>BDD User Story & E2E Scenario Builder</span>
            </h2>
            <p className="text-xs text-slate-400">
              Converts natural language user journeys into Gherkin specifications and automated Playwright/Cypress scripts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Framework:</span>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="bg-slate-900 border border-white/10 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="Playwright">Playwright</option>
              <option value="Cypress">Cypress</option>
              <option value="Cucumber">Cucumber / Gherkin</option>
            </select>
          </div>
        </div>

        {/* Presets */}
        {presets.length > 0 && (
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              1-Click Sample User Stories:
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setStory(p.story)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/40 transition-all flex items-center gap-1.5"
                >
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{p.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Story Textarea */}
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={5}
          placeholder="Describe your user story or feature acceptance criteria..."
          className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 resize-none font-sans leading-relaxed"
        />

        {/* Run Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !story.trim()}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg ${
              isLoading || !story.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-600/30 hover:scale-[1.01]'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Scenarios & E2E Code...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate BDD & {framework} Tests</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Card */}
      {result && (
        <div className="glass-panel-qa rounded-2xl p-6 sm:p-7 space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {result.target_framework} Acceptance Suite
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                {result.feature_title}
              </h3>
            </div>

            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('scenarios')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'scenarios' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Gherkin Scenarios ({result.gherkin_scenarios.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'code' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Executable Script
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-white/5">
            {result.summary}
          </p>

          {/* Tab 1: Gherkin Scenarios */}
          {activeTab === 'scenarios' && (
            <div className="space-y-3">
              {result.gherkin_scenarios.map((scen, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Scenario: {scen.scenario_name}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                      {scen.scenario_type}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] text-slate-300 pt-1">
                    {scen.steps.map((st, sIdx) => {
                      const firstWord = st.split(' ')[0];
                      return (
                        <div key={sIdx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold min-w-[42px]">{firstWord}</span>
                          <span className="text-slate-200">{st.slice(firstWord.length + 1)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Executable Code */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-emerald-300 overflow-x-auto max-h-[450px] leading-relaxed">
                  {result.executable_test_code}
                </pre>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Test Code'}</span>
                </button>
              </div>

              {result.setup_instructions && (
                <div className="p-3 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Run Command:</span>
                  <span className="text-emerald-300 bg-slate-950 px-2 py-1 rounded border border-white/5">
                    {result.setup_instructions}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
