import React, { useState } from 'react';
import { Cpu, Layers, BarChart2, Sparkles, CheckCircle2, Flame } from 'lucide-react';
import forecastData from '../data/forecast_data.json';

export default function ModelExplainer() {
  const [selectedMaterial, setSelectedMaterial] = useState('pvc');
  const [selectedModel, setSelectedModel] = useState('ensemble');

  const featureImportance = forecastData.feature_importance[selectedMaterial];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 border-l-4 border-red-600">
        <div className="flex items-center gap-2 text-red-500 font-semibold text-sm mb-1">
          <Cpu className="w-4 h-4" /> Machine Learning Architecture & Explainability
        </div>
        <h1 className="text-2xl font-bold text-white">AI Prediction Engine & SHAP Feature Importance</h1>
        <p className="text-gray-400 text-sm mt-1">
          Transparent, explainable price prediction models that quantify the relative weight of every macroeconomic input factor.
        </p>
      </div>

      {/* Control Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedMaterial('pvc')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              selectedMaterial === 'pvc' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            PVC Resin Model
          </button>
          <button
            onClick={() => setSelectedMaterial('aluminium')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              selectedMaterial === 'aluminium' 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' 
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            LME Aluminium Model
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Algorithm:</span>
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-[#14141C] text-white text-xs px-3 py-1.5 rounded-lg border border-red-900/60 focus:outline-none focus:border-red-500 font-medium"
          >
            <option value="ensemble">Gradient Boosted Ensemble (Recommended)</option>
            <option value="rf">Random Forest Regressor</option>
            <option value="gb">Gradient Boosting Machine (XGB/GBM)</option>
            <option value="ridge">Regularized Ridge Linear Model</option>
            <option value="sarimax">SARIMAX Time Series</option>
          </select>
        </div>
      </div>

      {/* Feature Importance SHAP Bar Breakdown */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-red-500" /> Relative Feature Importance & SHAP Drivers ({selectedMaterial.toUpperCase()})
            </h3>
            <p className="text-xs text-gray-400">
              Contribution weight of each indicator to the 1-to-6 month forward price prediction.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-950 text-red-300 border border-red-800/60 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Explainable AI (XAI)
          </span>
        </div>

        <div className="space-y-4 mt-6">
          {featureImportance.map((item, idx) => {
            const percentage = Math.round(item.importance * 100);

            return (
              <div key={item.factor} className="bg-[#0E0E14] p-4 rounded-xl border border-red-950/60">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-950 text-red-400 text-xs font-bold flex items-center justify-center font-mono border border-red-800/40">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-bold text-white">{item.factor}</span>
                  </div>
                  <span className="text-sm font-bold text-red-400 font-mono">{percentage}% Weight</span>
                </div>
                <p className="text-xs text-gray-400 ml-8 mb-2">{item.description}</p>
                <div className="w-full bg-gray-900 rounded-full h-2 ml-8 max-w-[calc(100%-2rem)]">
                  <div 
                    className="bg-gradient-to-r from-red-600 via-rose-600 to-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-red-950">
          <div className="flex items-center gap-2 text-red-400 text-sm font-semibold mb-2">
            <Layers className="w-4 h-4" /> Multi-Horizon Forecasting
          </div>
          <h4 className="text-sm font-bold text-white mb-2">Sequential Direct Predictions</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Separate predictive estimators trained for each forecast horizon ($t+1, t+2 \dots t+6$ months) to avoid recursive error compounding across multi-month projections.
          </p>
        </div>

        <div className="glass-card p-5 border border-red-950">
          <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold mb-2">
            <Cpu className="w-4 h-4" /> Hybrid Stacking Ensemble
          </div>
          <h4 className="text-sm font-bold text-white mb-2">GBM + RF + Ridge Blend</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Combines non-linear tree ensembles (capturing commodity price shocks) with regularized Ridge regression (capturing macroeconomic trends).
          </p>
        </div>

        <div className="glass-card p-5 border border-red-950">
          <div className="flex items-center gap-2 text-red-500 text-sm font-semibold mb-2">
            <CheckCircle2 className="w-4 h-4" /> Shock Event Dummies
          </div>
          <h4 className="text-sm font-bold text-white mb-2">Supply Disruption Features</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Explicit binary surge indicators for geopolitical shipping bottlenecks, refinery shutdowns, and energy crunches to prevent under-forecasting tail risks.
          </p>
        </div>
      </div>
    </div>
  );
}
