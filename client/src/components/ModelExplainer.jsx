import React, { useState } from 'react';
import { Cpu, Layers, BarChart2, Sparkles, CheckCircle2, Sliders } from 'lucide-react';
import forecastData from '../data/forecast_data.json';

export default function ModelExplainer() {
  const [selectedMaterial, setSelectedMaterial] = useState('pvc_resin');
  const [selectedModel, setSelectedModel] = useState('ensemble');
  const [selectedHorizon, setSelectedHorizon] = useState('1');

  const materialObj = forecastData.feature_importance?.[selectedMaterial] || {};
  const horizonObj = materialObj[selectedHorizon] || materialObj['1'] || {};
  const featureImportance = horizonObj[selectedModel] || horizonObj.ensemble || [];

  const getArchitectureDetails = (modelKey) => {
    switch (modelKey) {
      case 'ridge':
        return {
          title: "Regularized Ridge Linear Model",
          badge: "L2 Regularized",
          desc: "Fits a regularized linear response on standardized macro indicator returns. Prevents overfitting while preserving global trend coefficients.",
          scaleText: "Feature Weights derived from Normalized Coefficients (|w_i| / Σ|w_i|)"
        };
      case 'gradient_boosting':
        return {
          title: "Gradient Boosting Machine (GBM)",
          badge: "Sequential Trees",
          desc: "Fits sequential decision trees to capture non-linear market shocks, supply disruptions, and complex indicator interaction thresholds.",
          scaleText: "Feature Weights derived from Out-of-Fold Gini / Variance Impurity Reduction"
        };
      case 'random_forest':
        return {
          title: "Random Forest Regressor",
          badge: "Bagged Ensembles",
          desc: "Averages 60 decorrelated decision trees with random feature sub-sampling to reduce variance across volatile macro cycles.",
          scaleText: "Feature Weights derived from Mean Decrease in Impurity (MDI)"
        };
      default:
        return {
          title: "Hybrid Stacking Ensemble (Recommended)",
          badge: "Multi-Model Blend",
          desc: "Blends Ridge Regression (30%), Gradient Boosting (40%), and Random Forests (30%) to combine trend stability with non-linear shock capture.",
          scaleText: "Feature Weights derived from Blended Model Weights"
        };
    }
  };

  const arch = getArchitectureDetails(selectedModel);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="glass-panel p-4 border-l-4 border-red-800">
        <h1 className="text-xl font-bold text-white">AI Architecture & Feature Importance</h1>
        <p className="text-gray-400 text-xs mt-0.5">
          Quantifying feature contribution weights for monthly direct log-return forecasting models.
        </p>
      </div>

      {/* Control Selector Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#0A0A0E] p-3 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedMaterial('pvc_resin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedMaterial === 'pvc_resin' 
                ? 'bg-red-800 text-white shadow' 
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            PVC Resin WPI
          </button>
          <button
            onClick={() => setSelectedMaterial('aluminium')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedMaterial === 'aluminium' 
                ? 'bg-rose-900 text-white shadow' 
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            Aluminium Spot
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-[#121218] p-1 rounded-lg border border-zinc-800 text-xs">
            <span className="text-gray-400 px-2 font-medium flex items-center gap-1">
              <Sliders className="w-3 h-3 text-rose-400" /> Horizon:
            </span>
            {[1, 2, 3, 4, 5, 6].map(h => (
              <button
                key={h}
                onClick={() => setSelectedHorizon(String(h))}
                className={`px-2.5 py-1 rounded font-semibold transition ${
                  selectedHorizon === String(h) ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                H+{h}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Architecture:</span>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[#14141C] text-white text-xs px-3 py-1.5 rounded-lg border border-red-900/60 focus:outline-none focus:border-red-500 font-semibold"
            >
              <option value="ensemble">Hybrid Stacking Ensemble (Blend)</option>
              <option value="gradient_boosting">Gradient Boosting Machine (GBM)</option>
              <option value="random_forest">Random Forest Regressor</option>
              <option value="ridge">Ridge Linear Model</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selected Model Summary Card */}
      <div className="bg-[#0E0E14] p-4 rounded-xl border-l-4 border-rose-500 border border-red-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">{arch.title}</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
              {arch.badge}
            </span>
          </div>
          <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{arch.desc}</p>
        </div>
        <span className="text-[11px] text-gray-400 font-mono bg-black p-1.5 rounded border border-red-950 shrink-0">
          {arch.scaleText}
        </span>
      </div>

      {/* Feature Importance Bar Breakdown */}
      <div className="glass-panel p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-red-500" /> Feature Contribution ({selectedMaterial === 'pvc_resin' ? 'PVC Resin' : 'Aluminium'} — {selectedModel.toUpperCase()})
            </h3>
            <p className="text-xs text-gray-400">
              Relative weight of each macroeconomic feature for horizon H+{selectedHorizon}.
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          {featureImportance.map((item, idx) => {
            const percentage = Math.round(item.importance * 100);

            return (
              <div key={item.feature} className="bg-[#0E0E14] p-4 rounded-xl border border-red-950/60">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-950 text-red-400 text-xs font-bold flex items-center justify-center font-mono border border-red-800/40">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-bold text-white font-mono">{item.feature}</span>
                  </div>
                  <span className="text-sm font-bold text-red-400 font-mono">{percentage}% Weight</span>
                </div>
                <div className="w-full bg-gray-900 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-red-600 via-rose-600 to-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, percentage)}%` }}
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
            <Layers className="w-4 h-4" /> Multi-Horizon Estimators
          </div>
          <h4 className="text-sm font-bold text-white mb-2">Independent Direct Horizons</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Separate predictive estimators trained for each horizon $h=1 \dots 6$ to prevent recursive error accumulation across multi-month forecasts.
          </p>
        </div>

        <div className="glass-card p-5 border border-red-950">
          <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold mb-2">
            <Cpu className="w-4 h-4" /> Stacking Ensemble
          </div>
          <h4 className="text-sm font-bold text-white mb-2">Ridge + GBM + RF</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Combines linear regularized Ridge regression (capturing macro trends) with tree ensembles (capturing non-linear commodity shocks).
          </p>
        </div>

        <div className="glass-card p-5 border border-red-950">
          <div className="flex items-center gap-2 text-red-500 text-sm font-semibold mb-2">
            <CheckCircle2 className="w-4 h-4" /> Leak-Free Scaling
          </div>
          <h4 className="text-sm font-bold text-white mb-2">In-Fold Standardisation</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            StandardScaler is fitted strictly inside each expanding walk-forward training fold to ensure zero look-ahead data leakage.
          </p>
        </div>
      </div>
    </div>
  );
}
