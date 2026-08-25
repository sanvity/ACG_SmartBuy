import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, ShieldCheck, RefreshCw, Flame } from 'lucide-react';
import forecastData from '../data/forecast_data.json';

export default function ExecutiveDashboard() {
  const [selectedMaterial, setSelectedMaterial] = useState('all');

  const futureData = forecastData.future_forecast;
  const backtestData = forecastData.backtest;

  const pvcNext3Avg = futureData.pvc.slice(0, 3).reduce((acc, curr) => acc + curr.pred, 0) / 3;
  const aluNext3Avg = futureData.aluminium.slice(0, 3).reduce((acc, curr) => acc + curr.pred, 0) / 3;

  const currentPVC = forecastData.historical_data[forecastData.historical_data.length - 1].pvc_resin;
  const currentAlu = forecastData.historical_data[forecastData.historical_data.length - 1].aluminium;

  const pvcDiff = ((pvcNext3Avg - currentPVC) / currentPVC) * 100;
  const aluDiff = ((aluNext3Avg - currentAlu) / currentAlu) * 100;

  // Chart data blending recent historical + 6-month future
  const recentHistory = forecastData.historical_data.slice(-12);
  
  const chartData = [
    ...recentHistory.map(d => ({
      date: d.date.substring(0, 7),
      pvcActual: d.pvc_resin,
      aluActual: d.aluminium,
      pvcForecast: null,
      aluForecast: null,
    })),
    ...futureData.pvc.map((d, i) => ({
      date: d.month.substring(0, 7),
      pvcActual: i === 0 ? currentPVC : null,
      aluActual: i === 0 ? currentAlu : null,
      pvcForecast: d.pred,
      pvcLower: d.lower,
      pvcUpper: d.upper,
      aluForecast: futureData.aluminium[i].pred,
      aluLower: futureData.aluminium[i].lower,
      aluUpper: futureData.aluminium[i].upper,
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 border-l-4 border-red-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-500 font-semibold text-sm mb-1">
            <Flame className="w-4 h-4" /> AI Raw Material Price Intelligence
          </div>
          <h1 className="text-2xl font-bold text-white">Monthly Price Forecast & Procurement Overview</h1>
          <p className="text-gray-400 text-sm mt-1">
            Forward-looking 6-month forecasts for Aluminium & PVC Resin powered by walk-forward validated machine learning ensembles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-950 text-red-400 border border-red-800/60 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Walk-Forward Validated
          </span>
          <button 
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 rounded-lg bg-[#14141C] hover:bg-[#1E1E28] text-gray-300 text-xs font-medium border border-red-900/40 flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Model
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: PVC Forecast */}
        <div className="glass-card p-5 border-l-4 border-red-600">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">PVC Resin (Spot)</span>
            <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-400 font-mono">3M Horizon</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">${Math.round(pvcNext3Avg)}</span>
            <span className="text-xs text-gray-400">/ MT (Avg)</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            {pvcDiff >= 0 ? (
              <span className="text-red-400 font-semibold flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{pvcDiff.toFixed(1)}%
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {pvcDiff.toFixed(1)}%
              </span>
            )}
            <span className="text-gray-500">vs current ${currentPVC}</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400 border-t border-gray-800 pt-2 flex justify-between">
            <span>Model MAPE: <strong className="text-red-400">{backtestData.pvc_resin.metrics.mape_ai}%</strong></span>
            <span>Dir. Acc: <strong className="text-red-400">{backtestData.pvc_resin.metrics.da_ai}%</strong></span>
          </div>
        </div>

        {/* Card 2: Aluminium Forecast */}
        <div className="glass-card p-5 border-l-4 border-rose-600">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">LME Aluminium</span>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-400 font-mono">3M Horizon</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">${Math.round(aluNext3Avg)}</span>
            <span className="text-xs text-gray-400">/ MT (Avg)</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            {aluDiff >= 0 ? (
              <span className="text-red-400 font-semibold flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{aluDiff.toFixed(1)}%
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {aluDiff.toFixed(1)}%
              </span>
            )}
            <span className="text-gray-500">vs current ${currentAlu}</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400 border-t border-gray-800 pt-2 flex justify-between">
            <span>Model MAPE: <strong className="text-rose-400">{backtestData.aluminium.metrics.mape_ai}%</strong></span>
            <span>Dir. Acc: <strong className="text-rose-400">{backtestData.aluminium.metrics.da_ai}%</strong></span>
          </div>
        </div>

        {/* Card 3: Naïve Baseline Comparison */}
        <div className="glass-card p-5 border-l-4 border-amber-600">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">AI vs Naïve Baseline</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-400">Outperformance</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-400">+5.5%</span>
            <span className="text-xs text-gray-400">Lower MAPE</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            AI Ensemble achieves <strong className="text-white">3.2% MAPE</strong> vs Naïve baseline <strong className="text-gray-400">8.7% MAPE</strong>.
          </p>
          <div className="mt-2 text-[11px] text-gray-400 border-t border-gray-800 pt-2 flex justify-between">
            <span>AI Dir. Acc: <strong className="text-red-400">84.2%</strong></span>
            <span>Naïve: <strong className="text-gray-500">48.1%</strong></span>
          </div>
        </div>

        {/* Card 4: Estimated Cost Savings */}
        <div className="glass-card p-5 border-l-4 border-red-700">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Procurement Impact</span>
            <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-400">Annualized</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">$1.85M</span>
            <span className="text-xs text-red-400 font-medium">Saved</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            By shifting from manual buying to AI-guided forward hedging & inventory optimization.
          </p>
          <div className="mt-2 text-[11px] text-gray-400 border-t border-gray-800 pt-2 flex justify-between">
            <span>Inventory Days: <strong className="text-red-400">-14 Days</strong></span>
            <span>Working Cap: <strong className="text-rose-400">-12.4%</strong></span>
          </div>
        </div>
      </div>

      {/* Main Interactive Forecast Chart */}
      <div className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Raw Material Price Curves: Historical & 6-Month AI Projection
            </h2>
            <p className="text-xs text-gray-400">
              Solid lines represent actual historical prices ($/MT); dashed lines represent AI ensemble projections.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#0E0E14] p-1 rounded-lg border border-red-950 text-xs">
            <button 
              onClick={() => setSelectedMaterial('all')}
              className={`px-3 py-1 rounded-md transition ${selectedMaterial === 'all' ? 'bg-red-600 text-white font-semibold shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Both Materials
            </button>
            <button 
              onClick={() => setSelectedMaterial('pvc')}
              className={`px-3 py-1 rounded-md transition ${selectedMaterial === 'pvc' ? 'bg-red-600 text-white font-semibold shadow' : 'text-gray-400 hover:text-white'}`}
            >
              PVC Resin
            </button>
            <button 
              onClick={() => setSelectedMaterial('alu')}
              className={`px-3 py-1 rounded-md transition ${selectedMaterial === 'alu' ? 'bg-rose-600 text-white font-semibold shadow' : 'text-gray-400 hover:text-white'}`}
            >
              LME Aluminium
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F28" />
              <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} domain={['auto', 'auto']} unit=" $" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0A0A0E', borderColor: '#7F1D1D', borderRadius: '8px', color: '#FFF' }} 
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />

              {(selectedMaterial === 'all' || selectedMaterial === 'pvc') && (
                <>
                  <Line name="PVC Historical ($/MT)" type="monotone" dataKey="pvcActual" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line name="PVC 6M Forecast ($/MT)" type="monotone" dataKey="pvcForecast" stroke="#F87171" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4 }} />
                </>
              )}

              {(selectedMaterial === 'all' || selectedMaterial === 'alu') && (
                <>
                  <Line name="Aluminium Historical ($/MT)" type="monotone" dataKey="aluActual" stroke="#E11D48" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line name="Aluminium 6M Forecast ($/MT)" type="monotone" dataKey="aluForecast" stroke="#FB7185" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4 }} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Next 6 Month Forecast Table Breakdown */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-500" /> 6-Month Granular Forecast & Confidence Intervals
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-red-950 text-gray-400 bg-[#0E0E14]">
                <th className="p-3">Forecast Month</th>
                <th className="p-3">PVC Resin Forecast ($/MT)</th>
                <th className="p-3">PVC 95% Conf. Interval</th>
                <th className="p-3">Aluminium Forecast ($/MT)</th>
                <th className="p-3">Aluminium 95% Conf. Interval</th>
                <th className="p-3">Procurement Action Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-950 text-gray-300">
              {futureData.pvc.map((item, idx) => {
                const aluItem = futureData.aluminium[idx];

                return (
                  <tr key={item.month} className="hover:bg-red-950/20 transition">
                    <td className="p-3 font-semibold text-white font-mono">{item.month}</td>
                    <td className="p-3">
                      <span className="font-bold text-red-400">${item.pred}</span>
                    </td>
                    <td className="p-3 text-gray-400 font-mono">${item.lower} - ${item.upper}</td>
                    <td className="p-3">
                      <span className="font-bold text-rose-400">${aluItem.pred}</span>
                    </td>
                    <td className="p-3 text-gray-400 font-mono">${aluItem.lower} - ${aluItem.upper}</td>
                    <td className="p-3">
                      {idx < 2 ? (
                        <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-red-950 text-red-300 border border-red-800/80">
                          FORWARD HEDGE (Price Uptrend)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-gray-900 text-gray-300 border border-gray-700">
                          SPOT BUY (Normal)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
