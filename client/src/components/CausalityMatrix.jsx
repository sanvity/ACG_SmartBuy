import React, { useState } from 'react';
import { Network, Activity, Sliders, Info } from 'lucide-react';
import forecastData from '../data/forecast_data.json';

export default function CausalityMatrix() {
  const [activeTab, setActiveTab] = useState('pvc_resin');
  const [selectedLag, setSelectedLag] = useState(1);

  const correlations = forecastData.correlations || {};
  const currentCorrMap = correlations[activeTab] || {};

  const indicatorInfo = {
    pvc_resin: [
      { name: "VCM (Vinyl Chloride Monomer)", key: "vcm", leadTime: "1 Month Lead", category: "Direct Feedstock" },
      { name: "Ethylene Spot Index", key: "ethylene", leadTime: "2 Month Lead", category: "Upstream Petrochem" },
      { name: "Brent Crude Oil", key: "brent_crude", leadTime: "3 Month Lead", category: "Energy Benchmark" },
      { name: "Naphtha Price Index", key: "naphtha", leadTime: "2 Month Lead", category: "Refinery Crack Spread" },
      { name: "Freight Rates (FBX Index)", key: "freight_index", leadTime: "1 Month Lead", category: "Logistics Multiplier" },
      { name: "USD/INR Exchange Rate", key: "usd_inr", leadTime: "Direct Impact", category: "Macro Currency" }
    ],
    aluminium: [
      { name: "Alumina PAX Index", key: "alumina_pax", leadTime: "1 Month Lead", category: "Intermediate Raw Material" },
      { name: "Energy Cost Index", key: "energy_cost_index", leadTime: "2 Month Lead", category: "Power & Smelting Cost" },
      { name: "Global Manufacturing PMI", key: "global_pmi", leadTime: "1 Month Lead", category: "Industrial Demand" },
      { name: "Bauxite Import Index", key: "bauxite_index", leadTime: "3 Month Lead", category: "Base Ore Supply" },
      { name: "LME Inventory ('000 MT)", key: "lme_inventory", leadTime: "1 Month Lead (-ve)", category: "Exchange Stock Supply" },
      { name: "Freight Rates (FBX Index)", key: "freight_index", leadTime: "1 Month Lead", category: "Logistics Multiplier" }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="glass-panel p-6 border-l-4 border-red-800">
        <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-1">
          <Network className="w-4 h-4" /> External Market Indicators & Lead-Lag Correlations
        </div>
        <h1 className="text-2xl font-bold text-white">Macroeconomic Drivers & Cross-Correlation Matrix</h1>
        <p className="text-gray-400 text-sm mt-1">
          Pearson cross-correlations evaluated across aligned monthly log-returns ($\Delta \ln P$) for lags 0 to -6 months.
        </p>
      </div>

      {/* Selector & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0A0A0E] p-4 rounded-xl border border-zinc-800">
        {/* Material Tab */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pvc_resin')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'pvc_resin' 
                ? 'bg-red-800 text-white shadow' 
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            PVC Resin Drivers (GoI DPIIT WPI)
          </button>
          <button
            onClick={() => setActiveTab('aluminium')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'aluminium' 
                ? 'bg-rose-900 text-white shadow' 
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            Aluminium Drivers (World Bank Spot)
          </button>
        </div>

        {/* Lag Slider */}
        <div className="flex items-center gap-3 bg-[#121218] px-4 py-2 rounded-lg border border-red-900/40 w-full md:w-auto">
          <Sliders className="w-4 h-4 text-red-400" />
          <span className="text-xs text-gray-300 font-medium">Lag Horizon:</span>
          <input 
            type="range" 
            min="0" 
            max="6" 
            value={selectedLag} 
            onChange={(e) => setSelectedLag(parseInt(e.target.value))}
            className="w-28 accent-red-500 cursor-pointer"
          />
          <span className="text-xs font-bold text-red-400 font-mono w-14">
            {selectedLag === 0 ? 'Lag 0' : `Lag -${selectedLag} Mo`}
          </span>
        </div>
      </div>

      {/* Leading Indicators Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {indicatorInfo[activeTab].slice(0, 3).map((item) => {
          const lagVal = currentCorrMap[item.key] ? currentCorrMap[item.key][`lag_${selectedLag}`] : 0;

          return (
            <div key={item.key} className="glass-card p-5 border border-red-950 hover:border-red-800 transition">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-400 uppercase">{item.category}</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-red-950 text-red-300 font-medium border border-red-800/40">
                  {item.leadTime}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-2">{item.name}</h3>
              
              <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-3">
                <span className="text-xs text-gray-400">Lag -{selectedLag} Return Corr:</span>
                <span className={`text-sm font-bold font-mono ${Math.abs(lagVal) >= 0.5 ? 'text-red-400' : Math.abs(lagVal) >= 0.25 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {lagVal !== undefined ? lagVal : '-'}
                </span>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-gray-900 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-gradient-to-r from-red-600 to-rose-600 h-1.5 rounded-full" 
                  style={{ width: `${Math.min(100, Math.abs(lagVal || 0) * 100)}%` }}
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
              <Activity className="w-4 h-4 text-red-500" /> Log-Return Cross-Correlation Matrix (Lags 0 to -6 Months)
            </h3>
            <p className="text-xs text-gray-400">
              Correlations calculated on time-aligned monthly log returns ($\Delta \ln P$). Higher magnitude indicates statistical co-movement.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-red-950 text-gray-400 bg-[#0E0E14]">
                <th className="p-3">External Indicator</th>
                <th className="p-3">Category</th>
                {[0, 1, 2, 3, 4, 5, 6].map((lag) => (
                  <th 
                    key={lag} 
                    className={`p-3 text-center transition ${
                      selectedLag === lag 
                        ? 'bg-red-900 text-white font-extrabold shadow border-b-2 border-red-500' 
                        : ''
                    }`}
                  >
                    {lag === 0 ? 'Lag 0' : `Lag -${lag} Mo`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-red-950 text-gray-300 font-mono">
              {indicatorInfo[activeTab].map((ind) => {
                const corrData = currentCorrMap[ind.key] || {};
                
                return (
                  <tr key={ind.key} className="hover:bg-red-950/20 transition">
                    <td className="p-3 font-semibold text-white font-sans">{ind.name}</td>
                    <td className="p-3 text-gray-400 font-sans">{ind.category}</td>
                    {[0, 1, 2, 3, 4, 5, 6].map((lag) => {
                      const val = corrData[`lag_${lag}`];
                      const isSelected = selectedLag === lag;
                      return (
                        <td 
                          key={lag} 
                          className={`p-3 text-center transition ${
                            isSelected 
                              ? 'bg-red-950/80 text-red-300 font-bold border-x border-red-800/40' 
                              : ''
                          }`}
                        >
                          {val ?? '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanatory Disclaimer */}
      <div className="glass-panel p-6 border-l-4 border-amber-600">
        <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400" /> Statistical Association & Causality Disclaimer
        </h4>
        <p className="text-xs text-gray-300 leading-relaxed">
          Cross-correlation quantifies linear statistical association between historical monthly return series. High correlation in historical data indicates predictive co-movement for ML feature selection, but does not constitute physical causality or guarantee future market transmission.
        </p>
      </div>
    </div>
  );
}
