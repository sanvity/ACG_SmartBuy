import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ShieldCheck, Award, CheckCircle, Sliders, Download, AlertCircle } from 'lucide-react';
import forecastData from '../data/forecast_data.json';

export default function BacktestSuite() {
  const [selectedMaterial, setSelectedMaterial] = useState('aluminium');
  const [selectedHorizon, setSelectedHorizon] = useState('1'); // '1' to '6'
  const [selectedModel, setSelectedModel] = useState('ensemble');

  const backtestMaterialObj = forecastData.backtest[selectedMaterial] || {};
  const backtestHorizonObj = backtestMaterialObj[selectedHorizon] || { metrics: {}, backtest_series: [] };

  const allMetrics = backtestHorizonObj.metrics || {};
  const currentModelMetrics = allMetrics[selectedModel] || { mape: 0, mae: 0, da: 0, interval_95_width: 0 };
  const naiveMetrics = allMetrics.naive || { mape: 0, mae: 0 };

  const mapeDelta = (naiveMetrics.mape - currentModelMetrics.mape).toFixed(2);
  const relImprovement = naiveMetrics.mape > 0 ? (((naiveMetrics.mape - currentModelMetrics.mape) / naiveMetrics.mape) * 100).toFixed(1) : 0;

  const handleDownloadBacktestCSV = () => {
    const headers = "Origin_Date,Target_Date,Actual_Price,Origin_Price,Pred_Ensemble,Pred_Ridge,Pred_GB,Pred_RF,Pred_Naive\n";
    const rows = backtestHorizonObj.backtest_series.map(row => 
      `${row.origin_date},${row.target_date},${row.actual},${row.origin_price},${row.pred_ensemble},${row.pred_ridge},${row.pred_gradient_boosting},${row.pred_random_forest},${row.pred_naive}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ACG_SmartBuy_Backtest_${selectedMaterial}_H${selectedHorizon}_${selectedModel}.csv`;
    a.click();
  };

  const getModelKeyForChart = (mKey) => {
    switch (mKey) {
      case 'ridge': return 'pred_ridge';
      case 'gradient_boosting': return 'pred_gradient_boosting';
      case 'random_forest': return 'pred_random_forest';
      case 'naive': return 'pred_naive';
      default: return 'pred_ensemble';
    }
  };

  const selectedModelChartKey = getModelKeyForChart(selectedModel);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="glass-panel p-4 border-l-4 border-red-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Walk-Forward Backtest Validation</h1>
          <p className="text-gray-400 text-xs mt-0.5">
            Evaluating predictions out-of-sample against the Naïve persistence baseline across horizons H+1 to H+6.
          </p>
        </div>

        <button 
          onClick={handleDownloadBacktestCSV}
          className="px-3 py-1.5 rounded-lg bg-[#14141C] hover:bg-[#1E1E28] text-gray-200 text-xs font-semibold border border-zinc-800 flex items-center gap-1.5 transition shadow"
        >
          <Download className="w-3.5 h-3.5 text-rose-400" /> Export Backtest CSV
        </button>
      </div>

      {/* Controls: Material, Model & Horizon Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0A0A0E] p-3 rounded-xl border border-red-950">
        {/* Material Selector */}
        <div>
          <label className="block text-xs text-gray-400 font-semibold mb-1">Material Dataset:</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedMaterial('aluminium')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                selectedMaterial === 'aluminium' ? 'bg-red-800 text-white shadow' : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              Aluminium Spot
            </button>
            <button
              onClick={() => setSelectedMaterial('pvc_resin')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                selectedMaterial === 'pvc_resin' ? 'bg-rose-900 text-white shadow' : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              PVC Resin WPI
            </button>
          </div>
        </div>

        {/* Model Selector */}
        <div>
          <label className="block text-xs text-gray-400 font-semibold mb-1">Model Architecture:</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-[#121218] border border-zinc-800 rounded-lg p-1.5 text-xs text-white font-semibold focus:border-red-700"
          >
            <option value="ensemble">Hybrid Stacking Ensemble (Ridge+GB+RF)</option>
            <option value="ridge">Ridge Linear Model (L2 Regularized)</option>
            <option value="gradient_boosting">Gradient Boosting Machine</option>
            <option value="random_forest">Random Forest Regressor</option>
            <option value="naive">Naïve Persistence Baseline</option>
          </select>
        </div>

        {/* Horizon Selector */}
        <div>
          <label className="block text-xs text-gray-400 font-semibold mb-1">Forecast Horizon:</label>
          <div className="flex items-center gap-1 bg-[#121218] p-1 rounded-lg border border-zinc-800 text-xs">
            {[1, 2, 3, 4, 5, 6].map(h => (
              <button
                key={h}
                onClick={() => setSelectedHorizon(String(h))}
                className={`flex-1 py-1 rounded font-semibold transition ${
                  selectedHorizon === String(h) ? 'bg-red-800 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                H+{h}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Selected Model MAPE */}
        <div className="glass-card p-4 border-l-4 border-red-600">
          <span className="text-xs font-bold text-gray-400 uppercase">Model MAPE (H+{selectedHorizon})</span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-400">{currentModelMetrics.mape}%</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">MAE: ${currentModelMetrics.mae}/MT</p>
        </div>

        {/* Metric 2: Naïve Baseline MAPE */}
        <div className="glass-card p-4 border-l-4 border-gray-700">
          <span className="text-xs font-bold text-gray-400 uppercase">Naïve Baseline MAPE</span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-400">{naiveMetrics.mape}%</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">MAE: ${naiveMetrics.mae}/MT</p>
        </div>

        {/* Metric 3: Directional Accuracy */}
        <div className="glass-card p-4 border-l-4 border-rose-600">
          <span className="text-xs font-bold text-gray-400 uppercase">Directional Accuracy</span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400">
              {currentModelMetrics.da !== null ? `${currentModelMetrics.da}%` : 'N/A'}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">Correct Direction Called</p>
        </div>

        {/* Metric 4: Error Improvement Delta */}
        <div className="glass-card p-4 border-l-4 border-amber-600">
          <span className="text-xs font-bold text-gray-400 uppercase">MAPE Delta vs Naïve</span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${mapeDelta >= 0 ? 'text-red-400' : 'text-amber-400'}`}>
              {mapeDelta >= 0 ? `-${mapeDelta}%` : `+${Math.abs(mapeDelta)}%`}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">{relImprovement}% Error Reduction</p>
        </div>
      </div>

      {/* Real Time Series Chart */}
      <div className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-red-500" /> Walk-Forward Out-of-Sample Series (H+{selectedHorizon} Horizon)
            </h3>
            <p className="text-xs text-gray-400">
              Evaluated on {backtestHorizonObj.eval_count} out-of-sample test steps ({backtestHorizonObj.eval_start_date} to {backtestHorizonObj.eval_end_date}).
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={backtestHorizonObj.backtest_series} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F28" />
              <XAxis dataKey="target_date" stroke="#9CA3AF" tick={{ fontSize: 10 }} interval={12} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} domain={['auto', 'auto']} unit=" $" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0A0A0E', borderColor: '#7F1D1D', borderRadius: '8px', color: '#FFF' }} 
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />

              <Line name="Actual Price ($/MT)" type="monotone" dataKey="actual" stroke="#F59E0B" strokeWidth={2.5} dot={false} />
              <Line name={`${selectedModel.toUpperCase()} Forecast ($/MT)`} type="monotone" dataKey={selectedModelChartKey} stroke="#EF4444" strokeWidth={2} strokeDasharray="3 3" dot={false} />
              <Line name="Naïve Baseline ($/MT)" type="monotone" dataKey="pred_naive" stroke="#6B7280" strokeWidth={1.5} strokeDasharray="6 6" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
