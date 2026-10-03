import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Code, 
  Copy, 
  Check, 
  ShieldCheck, 
  Lightbulb, 
  Activity, 
  Layers,
  ArrowRight,
  Gauge
} from 'lucide-react';

export default function FailureAnalyzer({ selectedProvider }) {
  const [errorLog, setErrorLog] = useState(`Error: Timed out 10000ms waiting for expect(locator).toBeVisible()\nLocator: locator('button[data-testid="checkout-submit"]')\nExpected: visible\nReceived: hidden\nCall log:\n  - locator.waitFor resolving to <button disabled data-testid="checkout-submit">...</button>\n  - at checkout.spec.ts:48:32\n  - async testFunction (checkout.spec.ts:35:1)`);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [presets, setPresets] = useState([]);
  const [copiedPatch, setCopiedPatch] = useState(false);

  useEffect(() => {
    fetch('/api/failure/presets')
      .then(res => res.json())
      .then(json => {
        if (json.data && Array.isArray(json.data)) {
          setPresets(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectPreset = (preset) => {
    setErrorLog(preset.log || '');
  };

  const handleDiagnose = async () => {
    if (errorLog.trim().length < 10) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/failure/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_log: errorLog,
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

  const copyPatch = () => {
    if (!result?.patch_code_snippet) return;
    navigator.clipboard.writeText(result.patch_code_snippet);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  const getErrorTypeBadge = (type) => {
    switch (type) {
      case 'ElementNotFound':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'AssertionFailure':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'NetworkTimeout':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'ServerError500':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'SchemaMismatch':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Header & Box */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bug className="w-5 h-5 text-amber-400" />
              Test Failure & Stack Trace Root-Cause Diagnostician
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Feed raw test failure logs, Playwright/Cypress timeouts, or CI/CD crash dumps. The AI isolates the exact broken line, root cause, and provides a direct code fix.
            </p>
          </div>

          {/* Quick Presets */}
          {presets.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Sample Errors:</span>
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition-all cursor-pointer"
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Trace Input Box */}
        <div className="mt-5 space-y-4">
          <div className="relative">
            <textarea
              value={errorLog}
              onChange={(e) => setErrorLog(e.target.value)}
              rows={7}
              placeholder="Paste stack trace or CI error output here..."
              className="w-full p-4 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all resize-y placeholder:text-slate-600 leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleDiagnose}
              disabled={isLoading || errorLog.trim().length < 10}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-semibold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Diagnosing Trace...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Diagnose Failure
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results View */}
      {result && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-6">
          {/* Header Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded border ${getErrorTypeBadge(result.error_type)}`}>
                  {result.error_type}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Component: <strong className="text-slate-200">{result.affected_component}</strong>
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{result.failure_summary}</h3>
            </div>

            {/* Confidence Gauge */}
            <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
              <Gauge className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Diagnosis Confidence</div>
                <div className="text-base font-bold text-amber-300 font-mono">{result.confidence_score}%</div>
              </div>
            </div>
          </div>

          {/* Root Cause & Recommended Fix in 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Root Cause */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <AlertCircle className="w-4 h-4" />
                Root Cause Analysis
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {result.root_cause}
              </p>
            </div>

            {/* Recommended Fix */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Lightbulb className="w-4 h-4" />
                Recommended Resolution
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {result.recommended_fix}
              </p>
            </div>
          </div>

          {/* Code Patch Snippet */}
          {result.patch_code_snippet && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Code className="w-4 h-4 text-cyan-400" />
                  Suggested Code Patch / Fix
                </span>
                <button
                  onClick={copyPatch}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                >
                  {copiedPatch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPatch ? 'Copied!' : 'Copy Patch'}
                </button>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs overflow-x-auto text-cyan-300/90 leading-relaxed">
                <pre>{result.patch_code_snippet}</pre>
              </div>
            </div>
          )}

          {/* Prevention Tips */}
          {result.prevention_tips && result.prevention_tips.length > 0 && (
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                Flakiness & Regression Prevention Guidelines
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {result.prevention_tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
