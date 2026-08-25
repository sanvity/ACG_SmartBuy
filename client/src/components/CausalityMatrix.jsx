import React, { useState } from 'react';
import { Network, Activity, Sliders, Info, Flame } from 'lucide-react';
import forecastData from '../data/forecast_data.json';

export default function CausalityMatrix() {
  const [activeTab, setActiveTab] = useState('pvc');
  const [selectedLag, setSelectedLag] = useState(1);

  const correlations = forecastData.correlations;
  const currentCorrMap = activeTab === 'pvc' ? correlations.pvc : correlations.aluminium;

  const indicatorInfo = {
    pvc: [
      { name: "VCM (Vinyl Chloride Monomer)", key: "vcm", leadTime: "1 Month Lead", strength: "High (0.89)", category: "Direct Feedstock" },
      { name: "Ethylene Spot & Futures", key: "ethylene", leadTime: "2 Month Lead", strength: "High (0.84)", category: "Upstream Petrochem" },
      { name: "Brent Crude Oil", key: "brent_crude", leadTime: "3 Month Lead", strength: "Medium (0.76)", category: "Energy Benchmark" },
      { name: "Naphtha Price Index", key: "naphtha", leadTime: "2 Month Lead", strength: "High (0.81)", category: "Refinery Crack Spread" },
      { name: "Freight Rates (FBX Index)", key: "freight_index", leadTime: "1 Month Lead", strength: "Moderate (0.64)", category: "Logistics Multiplier" },
      { name: "USD/INR Exchange Rate", key: "usd_inr", leadTime: "Direct Impact", strength: "Moderate (0.58)", category: "Macro Currency" }
    ],
    aluminium: [
      { name: "Alumina PAX Index", key: "alumina_pax", leadTime: "1 Month Lead", strength: "Very High (0.91)", category: "Intermediate Raw Material" },
      { name: "EU/US Energy Cost Index", key: "energy_cost_index", leadTime: "2 Month Lead", strength: "High (0.82)", category: "Power & Smelting Cost" },
      { name: "Global Manufacturing PMI", key: "global_pmi", leadTime: "1 Month Lead", strength: "High (0.78)", category: "Industrial Demand" },
      { name: "Bauxite Import Price Index", key: "bauxite_index", leadTime: "3 Month Lead", strength: "Medium (0.71)", category: "Base Ore Supply" },
      { name: "LME Inventory (kMT)", key: "lme_inventory", leadTime: "1 Month Lead (-ve)", strength: "Strong Negative (-0.73)", category: "Exchange Stock Supply" },
      { name: "Container Freight Rates", key: "freight_index", leadTime: "1 Month Lead", strength: "Moderate (0.59)", category: "Logistics Multiplier" }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="glass-panel p-6 border-l-4 border-red-600">
        <div className="flex items-center gap-2 text-red-500 font-semibold text-sm mb-1">
          <Network className="w-4 h-4" /> External Market Indicators & Lead-Lag Causality
        </div>
        <h1 className="text-2xl font-bold text-white">Macroeconomic Drivers & Cross-Correlation Matrix</h1>
        <p className="text-gray-400 text-sm mt-1">
          Quantitative assessment of external market signals that lead or explain raw material price movements across -1 to -6 month lags.
        </p>
      </div>

      {/* Selector & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
        {/* Material Tab */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pvc')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'pvc' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            PVC Resin Price Drivers
          </button>
          <button
            onClick={() => setActiveTab('aluminium')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'aluminium' 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' 
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            LME Aluminium Drivers
          </button>
        </div>

        {/* Lag Slider */}
        <div className="flex items-center gap-3 bg-[#121218] px-4 py-2 rounded-lg border border-red-900/40 w-full md:w-auto">
          <Sliders className="w-4 h-4 text-red-400" />
          <span className="text-xs text-gray-300 font-medium">Correlation Lag:</span>
          <input 
            type="range" 
            min="0" 
            max="6" 
            value={selectedLag} 
            onChange={(e) => setSelectedLag(parseInt(e.target.value))}
            className="w-28 accent-red-500 cursor-pointer"
          />
          <span className="text-xs font-bold text-red-400 font-mono w-14">
            {selectedLag === 0 ? 'Lag 0 (Current)' : `Lag -${selectedLag} Mo`}
          </span>
        </div>
      </div>

      {/* Leading Indicators Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {indicatorInfo[activeTab].slice(0, 3).map((item) => {
          const lagVal = currentCorrMap[item.key] ? currentCorrMap[item.key][`lag_${selectedLag}`] : 0;

          return (
            <div key={item.key} className="glass-card p-5 border border-red-950/60 hover:border-red-800 transition">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-400 uppercase">{item.category}</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-red-950 text-red-300 font-medium border border-red-800/40">
                  {item.leadTime}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-2">{item.name}</h3>
              
              <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-3">
                <span className="text-xs text-gray-400">Lag -{selectedLag} Correlation:</span>
                <span className={`text-sm font-bold font-mono ${lagVal >= 0.7 ? 'text-red-400' : lagVal >= 0.4 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {lagVal}
                </span>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-gray-900 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-gradient-to-r from-red-600 to-rose-600 h-1.5 rounded-full" 
                  style={{ width: `${Math.abs(lagVal) * 100}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-Correlation Heatmap Table */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500" /> Full Lead-Lag Cross-Correlation Table (Lags 0 to -6 Months)
            </h3>
            <p className="text-xs text-gray-400">
              Higher values (closer to +1.0) indicate that changes in the indicator strongly predict target raw material price changes after $N$ months.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-red-950 text-gray-400 bg-[#0E0E14]">
                <th className="p-3">External Indicator</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-center">Lag 0 (Same Mo)</th>
                <th className="p-3 text-center bg-red-950/40 text-red-300 font-bold">Lag -1 Mo</th>
                <th className="p-3 text-center bg-red-950/40 text-red-300 font-bold">Lag -2 Mo</th>
                <th className="p-3 text-center">Lag -3 Mo</th>
                <th className="p-3 text-center">Lag -4 Mo</th>
                <th className="p-3 text-center">Lag -5 Mo</th>
                <th className="p-3 text-center">Lag -6 Mo</th>
                <th className="p-3">Primary Lead Window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-950 text-gray-300 font-mono">
              {indicatorInfo[activeTab].map((ind) => {
                const corrData = currentCorrMap[ind.key] || {};
                
                return (
                  <tr key={ind.key} className="hover:bg-red-950/20 transition">
                    <td className="p-3 font-semibold text-white font-sans">{ind.name}</td>
                    <td className="p-3 text-gray-400 font-sans">{ind.category}</td>
                    <td className="p-3 text-center">{corrData['lag_0'] ?? '-'}</td>
                    <td className="p-3 text-center bg-red-950/40 text-red-300 font-bold">{corrData['lag_1'] ?? '-'}</td>
                    <td className="p-3 text-center bg-red-950/40 text-red-300 font-bold">{corrData['lag_2'] ?? '-'}</td>
                    <td className="p-3 text-center">{corrData['lag_3'] ?? '-'}</td>
                    <td className="p-3 text-center">{corrData['lag_4'] ?? '-'}</td>
                    <td className="p-3 text-center">{corrData['lag_5'] ?? '-'}</td>
                    <td className="p-3 text-center">{corrData['lag_6'] ?? '-'}</td>
                    <td className="p-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-red-950 text-red-300 font-semibold border border-red-800/40">
                        {ind.leadTime}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mechanism & Explanatory Insights */}
      <div className="glass-panel p-6 border-l-4 border-rose-600">
        <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-rose-400" /> Economic Mechanism & Price Surge Drivers
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300">
          <div className="bg-[#0A0A0E] p-4 rounded-lg border border-red-950">
            <h5 className="font-bold text-red-400 mb-1">PVC Resin Price Transmission Chain</h5>
            <p className="leading-relaxed">
              Brent Crude → Naphtha (lag ~1 mo) → Ethylene (lag ~2 mo) → VCM (lag ~1 mo) → PVC Resin. 
              Ethylene spot prices and VCM export tariffs act as early-warning indicators 45–60 days before domestic PVC price shifts occur.
            </p>
          </div>
          <div className="bg-[#0A0A0E] p-4 rounded-lg border border-red-950">
            <h5 className="font-bold text-rose-400 mb-1">Aluminium Price Transmission Chain</h5>
            <p className="leading-relaxed">
              Bauxite Ore → Alumina PAX Index (lag ~1 mo) + Smelting Electricity Index (lag ~2 mo) → LME Aluminium. 
              Aluminium smelting is energy-intensive (~14 MWh/ton); spikes in European natural gas / coal indices feed into LME prices with a 60-day lag.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
