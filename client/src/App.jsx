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
    <div className="flex items-center gap-2.5">
      <div className="bg-white/95 p-1 rounded-lg border border-zinc-700/50 shadow flex items-center justify-center h-9">
        <img 
          src="/acg_logo.png" 
          alt="ACG Logo" 
          className="h-6 w-auto object-contain"
        />
      </div>
      <div>
        <h1 className="text-base font-bold tracking-tight text-white font-sans">
          ACG Smart Buy
        </h1>
        <p className="text-[11px] text-gray-400">Raw Material Intelligence & Procurement System</p>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: '1. Executive Overview', icon: BarChart3 },
    { id: 'procurement', label: '2. Smart Procurement & S&OP', icon: Factory },
    { id: 'backtest', label: '3. Walk-Forward Backtest', icon: ShieldCheck },
    { id: 'causality', label: '4. Indicator Lead-Lag', icon: Network },
    { id: 'explainer', label: '5. AI Architecture & XAI', icon: Cpu },
    { id: 'provenance', label: '6. Data Provenance & Upload', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-gray-100 flex flex-col font-sans selection:bg-red-800 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0E]/95 backdrop-blur-md border-b border-red-950 px-4 lg:px-6 py-2.5 flex justify-between items-center shadow-lg shadow-black">
        <ACGLogo />
      </header>

      {/* Main Layout */}
      <div className="flex-1 w-full px-4 lg:px-6 py-4 space-y-4">
        {/* Navigation Bar */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-900 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-red-900/90 to-rose-950 text-white shadow-md border border-red-800/60'
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
          {activeTab === 'procurement' && <ProcurementSimulator />}
          {activeTab === 'backtest' && <BacktestSuite />}
          {activeTab === 'causality' && <CausalityMatrix />}
          {activeTab === 'explainer' && <ModelExplainer />}
          {activeTab === 'provenance' && <DataMethodology />}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#0A0A0E] border-t border-red-950/60 py-4 px-4 lg:px-8 text-center text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-2 w-full">
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
