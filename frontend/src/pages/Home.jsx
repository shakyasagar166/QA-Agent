import React, { useState } from 'react';
import { Layers, Zap, Bug, Sparkles, CheckCircle2, Shield, Cpu } from 'lucide-react';
import ScenarioBuilder from '../components/ScenarioBuilder';
import ApiTester from '../components/ApiTester';
import FailureAnalyzer from '../components/FailureAnalyzer';

export default function Home({ selectedProvider }) {
  const [activeTab, setActiveTab] = useState('scenarios'); // 'scenarios' | 'api' | 'failure'

  const tabs = [
    {
      id: 'scenarios',
      name: 'E2E Scenario Agent',
      desc: 'BDD Gherkin & Playwright / Cypress Code',
      icon: Layers,
      color: 'from-cyan-500 to-blue-500',
      activeText: 'text-cyan-400',
      activeBorder: 'border-cyan-500/80',
    },
    {
      id: 'api',
      name: 'API Contract & Fuzzing',
      desc: 'Boundary Tests, Security Payloads & cURL',
      icon: Zap,
      color: 'from-emerald-500 to-teal-500',
      activeText: 'text-emerald-400',
      activeBorder: 'border-emerald-500/80',
    },
    {
      id: 'failure',
      name: 'Root-Cause Diagnostician',
      desc: 'Stack Trace Isolation & Flakiness Patching',
      icon: Bug,
      color: 'from-amber-500 to-orange-500',
      activeText: 'text-amber-400',
      activeBorder: 'border-amber-500/80',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Studio Tab Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden backdrop-blur-xl ${
                isActive
                  ? `bg-slate-900/90 ${tab.activeBorder} shadow-lg shadow-cyan-500/5`
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
              }`}
            >
              {isActive && (
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tab.color}`}
                />
              )}
              <div className="flex items-center gap-3.5">
                <div
                  className={`p-2.5 rounded-xl border ${
                    isActive
                      ? `bg-slate-950 border-slate-700 ${tab.activeText}`
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className={`text-sm font-bold ${
                      isActive ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {tab.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{tab.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div className="transition-all duration-300">
        {activeTab === 'scenarios' && (
          <ScenarioBuilder selectedProvider={selectedProvider} />
        )}
        {activeTab === 'api' && (
          <ApiTester selectedProvider={selectedProvider} />
        )}
        {activeTab === 'failure' && (
          <FailureAnalyzer selectedProvider={selectedProvider} />
        )}
      </div>

      {/* Capabilities Feature Bar */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Autonomous QA Capabilities & Architecture
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200">
                BDD to Production E2E
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Converts product requirement stories into structured Gherkin syntax and executable Playwright / Cypress automation code.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200">
                Contract & Security Fuzzing
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Synthesizes boundary edge-cases, SQL injection payloads, authorization checks, and ready-to-run Pytest scripts.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200">
                Zero-Downtime Offline Fallback
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Integrated with Gemini 2.5 Flash, Groq, and OpenAI, backed by heuristic offline QA synthesis when keys are absent.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
