import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, ShieldCheck, RefreshCw, Flame, AlertTriangle, Download, CheckCircle } from 'lucide-react';
import forecastData from '../data/forecast_data.json';

export default function ExecutiveDashboard({ onDataRefresh }) {
  const [selectedHorizon, setSelectedHorizon] = useState('3'); // 1 to 6 months
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState(null);

  const metadata = forecastData.metadata || {};
  const futureData = forecastData.future_forecast;
  const backtestData = forecastData.backtest;
  const histData = forecastData.historical_data;

  const currentPVC = histData[histData.length - 1].pvc_resin;
  const currentAlu = histData[histData.length - 1].aluminium;

  const horizonIdx = parseInt(selectedHorizon) - 1;
  
  const pvcHorizonPred = futureData.pvc_resin[horizonIdx]?.pred_ensemble || currentPVC;
  const aluHorizonPred = futureData.aluminium[horizonIdx]?.pred_ensemble || currentAlu;

  const pvcDiff = ((pvcHorizonPred - currentPVC) / currentPVC) * 100;
  const aluDiff = ((aluHorizonPred - currentAlu) / currentAlu) * 100;

  const pvcMetrics = backtestData.pvc_resin[selectedHorizon]?.metrics.ensemble || {};
  const pvcNaiveMetrics = backtestData.pvc_resin[selectedHorizon]?.metrics.naive || {};
  
  const aluMetrics = backtestData.aluminium[selectedHorizon]?.metrics.ensemble || {};
  const aluNaiveMetrics = backtestData.aluminium[selectedHorizon]?.metrics.naive || {};

  const handleRefreshModel = async () => {
    setIsRefreshing(true);
    setRefreshStatus(null);
    try {
      const response = await fetch('/api/refresh-model', { method: 'POST' });
      if (!response.ok) throw new Error('API refresh failed');
      const updated = await response.json();
      setRefreshStatus({ type: 'success', message: 'ML Pipeline retrained successfully!' });
      if (onDataRefresh) onDataRefresh(updated);
    } catch (err) {
      setRefreshStatus({ type: 'error', message: `Refresh failed: ${err.message}` });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownloadForecastCSV = () => {
    const headers = "Horizon,Month,Aluminium_Pred,Alu_Lower_95,Alu_Upper_95,PVC_Pred,PVC_Lower_95,PVC_Upper_95\n";
    const rows = futureData.aluminium.map((item, idx) => {
      const pvcItem = futureData.pvc_resin[idx];
      return `${item.horizon},${item.target_date},${item.pred_ensemble},${item.lower_95},${item.upper_95},${pvcItem.pred_ensemble},${pvcItem.lower_95},${pvcItem.upper_95}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ACG_SmartBuy_6M_Forecast_${metadata.forecast_origin_date}.csv`;
    a.click();
  };

  // Recent 12 months history + 6-month future
  const recentHistory = histData.slice(-12);
  const chartData = [
    ...recentHistory.map(d => ({
      date: d.date.substring(0, 7),
      pvcActual: d.pvc_resin,
      aluActual: d.aluminium,
      pvcForecast: null,
      aluForecast: null,
    })),
    ...futureData.aluminium.map((d, i) => {
      const pvcItem = futureData.pvc_resin[i];
      return {
        date: d.target_date.substring(0, 7),
        pvcActual: i === 0 ? currentPVC : null,
        aluActual: i === 0 ? currentAlu : null,
        pvcForecast: pvcItem.pred_ensemble,
        pvcLower: pvcItem.lower_95,
        pvcUpper: pvcItem.upper_95,
        aluForecast: d.pred_ensemble,
        aluLower: d.lower_95,
        aluUpper: d.upper_95,
      };
    })
  ];

  const hasPvcSurge = pvcDiff > 2.0;
  const hasAluSurge = aluDiff > 2.0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 border-l-4 border-red-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-1">
            <Flame className="w-4 h-4" /> AI Raw Material Price Intelligence
          </div>
          <h1 className="text-2xl font-bold text-white">Monthly Price Forecast & Executive Overview</h1>
          <p className="text-gray-400 text-sm mt-1">
            Origin Date: <strong className="text-white font-mono">{metadata.forecast_origin_date}</strong> | 
            Aluminium: <strong className="text-emerald-400">Observed (World Bank Spot)</strong> | 
            PVC Resin: <strong className="text-emerald-400">Observed (GoI DPIIT WPI)</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleDownloadForecastCSV}
            className="px-3.5 py-2 rounded-xl bg-[#14141C] hover:bg-[#1E1E28] text-gray-200 text-xs font-semibold border border-zinc-800 flex items-center gap-1.5 transition shadow"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" /> Export Forecast CSV
          </button>
          <button 
            onClick={handleRefreshModel}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-800 to-rose-900 hover:from-red-700 hover:to-rose-800 text-white text-xs font-bold shadow flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> 
            {isRefreshing ? 'Retraining ML...' : 'Refresh Pipeline'}
          </button>
        </div>
      </div>

      {refreshStatus && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${refreshStatus.type === 'success' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-red-950 text-red-300 border-red-800'}`}>
          {refreshStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {refreshStatus.message}
        </div>
      )}

      {/* Horizon Selector Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
          <ShieldCheck className="w-4 h-4 text-red-500" /> Target Forecast Horizon:
        </div>
        <div className="flex items-center gap-2 bg-[#121218] p-1 rounded-lg border border-red-900/50 text-xs overflow-x-auto">
          {[1, 2, 3, 4, 5, 6].map(h => (
            <button
              key={h}
              onClick={() => setSelectedHorizon(String(h))}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                selectedHorizon === String(h) ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              {h}-Month Horizon
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Surge Alert Banner */}
      {(hasPvcSurge || hasAluSurge) && (
        <div className="bg-red-950/80 border border-red-600 p-4 rounded-xl flex items-center gap-3 text-red-200 text-xs">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 animate-bounce" />
          <div>
            <strong className="font-bold text-white text-sm">PRICE SURGE ALERT ({selectedHorizon}M Horizon):</strong>
            <p className="mt-0.5">
              {hasPvcSurge && `PVC Resin projected to surge by +${pvcDiff.toFixed(1)}% to $${Math.round(pvcHorizonPred)}/MT. `}
              {hasAluSurge && `Aluminium projected to surge by +${aluDiff.toFixed(1)}% to $${Math.round(aluHorizonPred)}/MT. `}
              Consider forward contract lock or early purchasing.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid (Dynamic Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: PVC Resin Forecast */}
        <div className="glass-card p-5 border-l-4 border-red-600">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-400 uppercase">PVC Resin (Observed WPI)</span>
            <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-400 font-mono">{selectedHorizon}M Horizon</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">${Math.round(pvcHorizonPred)}</span>
            <span className="text-xs text-gray-400">/ MT</span>
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
            <span className="text-gray-500">vs origin ${currentPVC}</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400 border-t border-gray-800 pt-2 flex justify-between">
            <span>Model MAPE: <strong className="text-red-400">{pvcMetrics.mape}%</strong></span>
            <span>Naïve: <strong className="text-gray-400">{pvcNaiveMetrics.mape}%</strong></span>
          </div>
        </div>

        {/* Card 2: LME Aluminium Forecast */}
        <div className="glass-card p-5 border-l-4 border-rose-600">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-400 uppercase">LME Aluminium (Observed)</span>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-400 font-mono">{selectedHorizon}M Horizon</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">${Math.round(aluHorizonPred)}</span>
            <span className="text-xs text-gray-400">/ MT</span>
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
            <span className="text-gray-500">vs origin ${currentAlu}</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400 border-t border-gray-800 pt-2 flex justify-between">
            <span>Model MAPE: <strong className="text-rose-400">{aluMetrics.mape}%</strong></span>
            <span>Naïve: <strong className="text-gray-400">{aluNaiveMetrics.mape}%</strong></span>
          </div>
        </div>

        {/* Card 3: Outperformance vs Baseline */}
        <div className="glass-card p-5 border-l-4 border-amber-600">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-400 uppercase">Alu Model vs Naïve</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-400">Outperformance</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-400">
              -{(aluNaiveMetrics.mape - aluMetrics.mape).toFixed(2)}%
            </span>
            <span className="text-xs text-gray-400">Error Margin Delta</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Ensemble achieves <strong className="text-white">{aluMetrics.mape}% MAPE</strong> vs Naïve <strong className="text-gray-400">{aluNaiveMetrics.mape}% MAPE</strong>.
          </p>
          <div className="mt-2 text-[11px] text-gray-400 border-t border-gray-800 pt-2 flex justify-between">
            <span>Dir. Accuracy: <strong className="text-red-400">{aluMetrics.da}%</strong></span>
            <span>Naïve DA: <strong className="text-gray-500">N/A (Flat)</strong></span>
          </div>
        </div>

        {/* Card 4: Model Coverage & Width */}
        <div className="glass-card p-5 border-l-4 border-red-700">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-400 uppercase">95% Interval Width</span>
            <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-400">Residual Calibrated</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">±${aluMetrics.interval_95_width}</span>
            <span className="text-xs text-red-400 font-medium">/ MT</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Out-of-sample empirical residual quantile width for {selectedHorizon}-month horizon.
          </p>
          <div className="mt-2 text-[11px] text-gray-400 border-t border-gray-800 pt-2 flex justify-between">
            <span>80% Width: <strong className="text-red-400">±${aluMetrics.interval_80_width}</strong></span>
            <span>Validation: <strong className="text-rose-400">Walk-Forward</strong></span>
          </div>
        </div>
      </div>

      {/* Main Interactive Forecast Chart */}
      <div className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Raw Material Price Curves: Historical & 6-Month Ensemble Forecast
            </h2>
            <p className="text-xs text-gray-400">
              Solid lines = actual historical prices ($/MT); dashed lines = 6-month model forecast curves.
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
                  <Line name="PVC Historical ($/MT)" type="monotone" dataKey="pvcActual" stroke="#DC2626" strokeWidth={2.2} dot={{ r: 3 }} />
                  <Line name="PVC 6M Forecast ($/MT)" type="monotone" dataKey="pvcForecast" stroke="#E53E3E" strokeWidth={2.2} strokeDasharray="5 5" dot={{ r: 4 }} />
                </>
              )}

              {(selectedMaterial === 'all' || selectedMaterial === 'alu') && (
                <>
                  <Line name="Aluminium Historical ($/MT)" type="monotone" dataKey="aluActual" stroke="#9F1239" strokeWidth={2.2} dot={{ r: 3 }} />
                  <Line name="Aluminium 6M Forecast ($/MT)" type="monotone" dataKey="aluForecast" stroke="#BE123C" strokeWidth={2.2} strokeDasharray="5 5" dot={{ r: 4 }} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Next 6 Month Forecast Table Breakdown */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-500" /> Granular 6-Month Forecast & Prediction Interval Table
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-red-950 text-gray-400 bg-[#0E0E14]">
                <th className="p-3">Horizon</th>
                <th className="p-3">Target Month</th>
                <th className="p-3">PVC Resin Forecast ($/MT)</th>
                <th className="p-3">PVC 95% Pred. Interval</th>
                <th className="p-3">Aluminium Forecast ($/MT)</th>
                <th className="p-3">Aluminium 95% Pred. Interval</th>
                <th className="p-3">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-950 text-gray-300 font-mono">
              {futureData.aluminium.map((aluItem, idx) => {
                const pvcItem = futureData.pvc_resin[idx];
                const aluChange = ((aluItem.pred_ensemble - currentAlu) / currentAlu) * 100;
                const pvcChange = ((pvcItem.pred_ensemble - currentPVC) / currentPVC) * 100;

                return (
                  <tr key={aluItem.target_date} className="hover:bg-red-950/20 transition">
                    <td className="p-3 font-bold text-red-400">H+{aluItem.horizon}</td>
                    <td className="p-3 font-semibold text-white font-sans">{aluItem.target_date}</td>
                    <td className="p-3">
                      <span className="font-bold text-red-400">${pvcItem.pred_ensemble}</span>
                      <span className="text-[10px] ml-1.5 text-gray-400">({pvcChange >= 0 ? '+' : ''}{pvcChange.toFixed(1)}%)</span>
                    </td>
                    <td className="p-3 text-gray-400">${pvcItem.lower_95} - ${pvcItem.upper_95}</td>
                    <td className="p-3">
                      <span className="font-bold text-rose-400">${aluItem.pred_ensemble}</span>
                      <span className="text-[10px] ml-1.5 text-gray-400">({aluChange >= 0 ? '+' : ''}{aluChange.toFixed(1)}%)</span>
                    </td>
                    <td className="p-3 text-gray-400">${aluItem.lower_95} - ${aluItem.upper_95}</td>
                    <td className="p-3 font-sans">
                      {aluChange > 2.0 || pvcChange > 2.0 ? (
                        <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-red-950 text-red-300 border border-red-800">
                          BUY FORWARD / LOCK
                        </span>
                      ) : aluChange < -2.0 || pvcChange < -2.0 ? (
                        <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          DEFER / MINIMUM BUY
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-gray-900 text-gray-300 border border-gray-700">
                          STAGGER REPLENISHMENT
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
