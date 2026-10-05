import React, { useState } from 'react';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import CausalityMatrix from './components/CausalityMatrix';
import ModelExplainer from './components/ModelExplainer';
import BacktestSuite from './components/BacktestSuite';
import ProcurementSimulator from './components/ProcurementSimulator';
import DataMethodology from './components/DataMethodology';

import { 
  BarChart3, 
  Network, 
  Cpu, 
  ShieldCheck, 
  Factory,
  Database
} from 'lucide-react';

function ACGLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-white/95 p-1.5 rounded-xl border border-red-500/40 shadow-lg shadow-red-600/20 flex items-center justify-center h-11">
        <img 
          src="/acg_logo.png" 
          alt="ACG Group Logo" 
          className="h-7 w-auto object-contain"
        />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-black tracking-wider text-white uppercase font-sans">
            ACG <span className="text-red-500 font-light text-sm tracking-normal capitalize">Films & Foils</span>
          </h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800/60 font-mono">
            MVP v2.0 FINALS
          </span>
        </div>
        <p className="text-[11px] text-gray-400">Raw Material Intelligence & AI Procurement System</p>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Executive Overview', icon: BarChart3 },
    { id: 'causality', label: 'Indicator Lead-Lag', icon: Network },
    { id: 'explainer', label: 'AI Architecture & SHAP', icon: Cpu },
    { id: 'backtest', label: 'Walk-Forward Backtest', icon: ShieldCheck },
    { id: 'procurement', label: 'Smart Procurement & BoM', icon: Factory },
    { id: 'provenance', label: 'Data Provenance & Upload', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-gray-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0E]/95 backdrop-blur-md border-b border-red-900/40 px-4 lg:px-8 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-lg shadow-black">
        <ACGLogo />

        <div className="flex items-center gap-3">
          <div className="bg-[#121218] px-3 py-1.5 rounded-lg border border-red-900/50 flex items-center gap-2 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-gray-200 font-medium">Walk-Forward Validated MVP Active</span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Navigation Bar */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-red-950/80 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/30 scale-[1.02] border border-red-500/50'
                    : 'bg-[#0E0E14] text-gray-400 hover:text-white hover:bg-[#161620] border border-gray-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* View Component Rendering */}
        <main className="transition-all duration-300">
          {activeTab === 'dashboard' && <ExecutiveDashboard />}
          {activeTab === 'causality' && <CausalityMatrix />}
          {activeTab === 'explainer' && <ModelExplainer />}
          {activeTab === 'backtest' && <BacktestSuite />}
          {activeTab === 'procurement' && <ProcurementSimulator />}
          {activeTab === 'provenance' && <DataMethodology />}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#0A0A0E] border-t border-red-950/60 py-4 px-8 text-center text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-2 max-w-7xl mx-auto w-full">
        <span>© 2026 ACG Group — Films & Foils Strategic AI Procurement Suite</span>
        <div className="flex items-center gap-4 text-[11px] text-gray-400">
          <span>Walk-Forward Out-of-Sample Validated</span>
          <span>•</span>
          <span>LME / World Bank / BLS Provenance</span>
        </div>
      </footer>
    </div>
  );
}
