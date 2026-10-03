import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  ShieldAlert, 
  Code, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  ChevronRight, 
  FileJson,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Zap
} from 'lucide-react';

export default function ApiTester({ selectedProvider }) {
  const [method, setMethod] = useState('POST');
  const [endpoint, setEndpoint] = useState('/api/v1/auth/login');
  const [requestBody, setRequestBody] = useState('{\n  "email": "user@example.com",\n  "password": "SecurePassword123!"\n}');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [presets, setPresets] = useState([]);
  const [activeTab, setActiveTab] = useState('cases'); // 'cases' | 'script' | 'curl'
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCurlIndex, setCopiedCurlIndex] = useState(null);

  useEffect(() => {
    fetch('/api/api-testing/presets')
      .then(res => res.json())
      .then(json => {
        if (json.data && Array.isArray(json.data)) {
          setPresets(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectPreset = (preset) => {
    setMethod(preset.method || 'POST');
    setEndpoint(preset.endpoint || '');
    setRequestBody(preset.body || '');
  };

  const handleGenerate = async () => {
    if (!endpoint.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/api-testing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: endpoint,
          method: method,
          request_body: requestBody,
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

  const copyToClipboard = (text, isCurl = false, index = null) => {
    navigator.clipboard.writeText(text);
    if (isCurl) {
      setCopiedCurlIndex(index);
      setTimeout(() => setCopiedCurlIndex(null), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMethodBadge = (m) => {
    switch (m.toUpperCase()) {
      case 'GET': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'POST': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'PUT': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'DELETE': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default: return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat.toLowerCase()) {
      case 'security_fuzz':
        return { label: 'Security Fuzz', icon: ShieldAlert, color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
      case 'negative':
        return { label: 'Negative / Error', icon: AlertTriangle, color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      case 'auth':
        return { label: 'Auth & Perms', icon: Lock, color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' };
      default:
        return { label: 'Contract Valid', icon: CheckCircle2, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Intro */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              API Contract & Security Fuzz Tester
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Synthesizes boundary validation tests, SQLi/XSS injection payloads, negative contract checks, and ready-to-run Python test scripts.
            </p>
          </div>

          {/* Quick Presets */}
          {presets.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Presets:</span>
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

        {/* Input Form */}
        <div className="mt-6 space-y-4">
          {/* Method and Endpoint Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white font-mono font-semibold text-sm focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 transition-all cursor-pointer"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>

            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-sm">
                https://api.domain.com
              </span>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="/api/v1/resource"
                className="w-full pl-52 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Request Body JSON */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <FileJson className="w-3.5 h-3.5 text-slate-500" />
                Sample Request Payload (JSON or schema)
              </label>
              <span className="text-xs text-slate-500 font-mono">Accepts JSON object or parameters</span>
            </div>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              rows={4}
              placeholder="{\n  &quot;key&quot;: &quot;value&quot;\n}"
              className="w-full p-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 transition-all resize-y placeholder:text-slate-600"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !endpoint.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Generating Fuzz Matrix...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate API Test Suite
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl">
          {/* Header Bar */}
          <div className="border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded border ${getMethodBadge(result.method)}`}>
                {result.method}
              </span>
              <div>
                <h3 className="text-base font-bold text-white font-mono">{result.endpoint}</h3>
                <p className="text-xs text-slate-400">
                  {result.test_cases?.length || 0} Test vectors generated • Contract, Security Fuzz & Error paths
                </p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('cases')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === 'cases' ? 'bg-emerald-500 text-slate-950 font-semibold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Test Cases ({result.test_cases?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('script')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === 'script' ? 'bg-emerald-500 text-slate-950 font-semibold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Python Script
              </button>
              <button
                onClick={() => setActiveTab('curl')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === 'curl' ? 'bg-emerald-500 text-slate-950 font-semibold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                cURL Commands ({result.curl_commands?.length || 0})
              </button>
            </div>
          </div>

          {/* Tab 1: Test Cases Grid */}
          {activeTab === 'cases' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.test_cases?.map((tc, idx) => {
                  const badge = getCategoryBadge(tc.category);
                  const Icon = badge.icon;
                  return (
                    <div
                      key={tc.id || idx}
                      className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4.5 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header Badge & Code */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
                            <Icon className="w-3 h-3" />
                            {badge.label}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            Expected: <span className={tc.expected_status < 400 ? 'text-emerald-400' : 'text-rose-400'}>{tc.expected_status}</span>
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h4 className="text-sm font-semibold text-white mb-1">{tc.name}</h4>
                        <p className="text-xs text-slate-400 mb-3">{tc.description}</p>

                        {/* Expected Assertion */}
                        <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800/80 mb-3 font-mono text-xs text-slate-300">
                          <span className="text-slate-500 select-none mr-2">assert:</span>
                          <span className="text-emerald-300">{tc.expected_assertion}</span>
                        </div>
                      </div>

                      {/* Payload preview if present */}
                      {tc.payload !== undefined && tc.payload !== null && (
                        <div className="pt-2 border-t border-slate-800/60 mt-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                            <span>Payload:</span>
                            <button
                              onClick={() => copyToClipboard(typeof tc.payload === 'object' ? JSON.stringify(tc.payload, null, 2) : String(tc.payload))}
                              className="hover:text-slate-300 cursor-pointer flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <pre className="bg-slate-900/60 p-2 rounded text-[11px] font-mono text-slate-300 overflow-x-auto max-h-24">
                            {typeof tc.payload === 'object' ? JSON.stringify(tc.payload, null, 2) : String(tc.payload)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Python Script */}
          {activeTab === 'script' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-400" />
                  test_api_contract.py (executable with pytest)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(result.python_requests_script)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? 'Copied!' : 'Copy Code'}
                  </button>
                  <button
                    onClick={() => downloadFile(result.python_requests_script, 'test_api_contract.py', 'text/x-python')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .py
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-300/90 leading-relaxed max-h-[500px]">
                <pre>{result.python_requests_script}</pre>
              </div>
            </div>
          )}

          {/* Tab 3: cURL Commands */}
          {activeTab === 'curl' && (
            <div className="p-6 space-y-3">
              <div className="text-xs text-slate-400 mb-2">
                Execute any test scenario directly from your terminal:
              </div>
              {result.curl_commands?.map((cmd, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 font-mono text-xs text-slate-300 flex items-start justify-between gap-4 group hover:border-slate-700 transition-all"
                >
                  <pre className="overflow-x-auto flex-1 text-slate-200 whitespace-pre-wrap break-all">
                    {cmd}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(cmd, true, idx)}
                    className="px-2.5 py-1 text-xs rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    {copiedCurlIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
