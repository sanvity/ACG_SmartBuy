import React, { useState } from 'react';
import { Database, FileText, Upload, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import forecastData from '../data/forecast_data.json';

export default function DataMethodology({ onDataUpdated }) {
  const [materialUpload, setMaterialUpload] = useState('pvc_resin');
  const [csvText, setCsvText] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const metadata = forecastData.metadata || {};
  const provenance = metadata.data_provenance || {};

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ material: materialUpload, csvContent: csvText })
      });

      if (!response.ok) {
        throw new Error('Server returned error during CSV upload');
      }

      const updatedData = await response.json();
      setUploadStatus({ type: 'success', message: 'Custom CSV successfully ingested and model pipeline retrained!' });
      if (onDataUpdated) onDataUpdated(updatedData);
    } catch (err) {
      setUploadStatus({ type: 'error', message: `Upload failed: ${err.message}` });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 border-l-4 border-red-800">
        <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-1">
          <Database className="w-4 h-4" /> Data Layer & Methodology Documentation
        </div>
        <h1 className="text-2xl font-bold text-white">Source Provenance, Dataset Schemas & Limitations</h1>
        <p className="text-gray-400 text-sm mt-1">
          Full technical transparency regarding historical datasets, data status (observed vs. proxy), forecast horizons, and custom CSV ingestion pipelines.
        </p>
      </div>

      {/* Dataset Provenance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aluminium Provenance */}
        <div className="glass-panel p-6 border border-red-950 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Observed Commodity Dataset</span>
              <h3 className="text-lg font-bold text-white mt-1">LME Aluminium Cash Settlement</h3>
            </div>
            <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              STATUS: OBSERVED
            </span>
          </div>

          <div className="text-xs space-y-2 text-gray-300 font-mono bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
            <div className="flex justify-between"><span>Source Provenance:</span><strong className="text-white">LME / World Bank / FRED</strong></div>
            <div className="flex justify-between"><span>Observation Frequency:</span><strong className="text-white">Monthly Average</strong></div>
            <div className="flex justify-between"><span>Unit & Currency:</span><strong className="text-white">USD / Metric Ton ($/MT)</strong></div>
            <div className="flex justify-between"><span>Historical Span:</span><strong className="text-white">2015-01 to 2026-08 ({metadata.total_historical_months} Months)</strong></div>
            <div className="flex justify-between"><span>Forecast Origin:</span><strong className="text-red-400">{metadata.forecast_origin_date}</strong></div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Genuine historical monthly cash settlement prices for high-grade primary aluminium. External drivers include Alumina PAX Index, EU/US Energy Cost Index, Global Manufacturing PMI, and LME Warehouse Stock levels.
          </p>
        </div>

        {/* PVC Provenance */}
        <div className="glass-panel p-6 border border-red-950 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Proxy & Custom Dataset</span>
              <h3 className="text-lg font-bold text-white mt-1">Global PVC Resin Spot & Feedstock Index</h3>
            </div>
            <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
              STATUS: PROXY / UPLOADABLE
            </span>
          </div>

          <div className="text-xs space-y-2 text-gray-300 font-mono bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
            <div className="flex justify-between"><span>Source Provenance:</span><strong className="text-white">US BLS Chemical PPI & ICIS Proxy</strong></div>
            <div className="flex justify-between"><span>Observation Frequency:</span><strong className="text-white">Monthly Average</strong></div>
            <div className="flex justify-between"><span>Unit & Currency:</span><strong className="text-white">USD / Metric Ton ($/MT)</strong></div>
            <div className="flex justify-between"><span>Historical Span:</span><strong className="text-white">2015-01 to 2026-08 ({metadata.total_historical_months} Months)</strong></div>
            <div className="flex justify-between"><span>Forecast Origin:</span><strong className="text-rose-400">{metadata.forecast_origin_date}</strong></div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Proxy price series derived from upstream petrochem feedstocks (VCM, Ethylene, Brent Crude). Buyers can upload plant-specific historical purchase contracts below to retrain the PVC model on exact ACG landed costs.
          </p>
        </div>
      </div>

      {/* CSV Import & Custom Pipeline Drawer */}
      <div className="glass-panel p-6 border-l-4 border-rose-600 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-rose-500" /> Custom Plant Purchase CSV Upload Workflow
        </h3>
        <p className="text-xs text-gray-400">
          Upload plant purchase records (CSV format: <code className="text-red-400 font-mono">date, price</code>) to dynamically replace proxy data and retrain the ML pipeline on historical ACG contracts.
        </p>

        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="text-xs font-bold text-gray-300">
              Target Commodity Material:
              <select
                value={materialUpload}
                onChange={(e) => setMaterialUpload(e.target.value)}
                className="ml-2 bg-[#0A0A0E] border border-red-950 rounded p-1.5 text-white font-mono text-xs focus:border-red-500"
              >
                <option value="pvc_resin">PVC Resin (Replace Proxy)</option>
                <option value="aluminium">LME Aluminium (Custom Series)</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={isUploading || !csvText.trim()}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs rounded-lg hover:from-red-500 hover:to-rose-500 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Retraining Pipeline...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" /> Ingest CSV & Retrain Model
                </>
              )}
            </button>
          </div>

          <textarea
            rows={5}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste CSV rows here (e.g.):&#10;date,price&#10;2024-01-01,1050.0&#10;2024-02-01,1080.5&#10;2024-03-01,1110.0"
            className="w-full bg-[#0A0A0E] border border-red-950 rounded-xl p-3 text-xs text-white font-mono focus:border-red-500 focus:outline-none"
          />
        </form>

        {uploadStatus && (
          <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${uploadStatus.type === 'success' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-red-950 text-red-300 border-red-800'}`}>
            {uploadStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {uploadStatus.message}
          </div>
        )}
      </div>

      {/* Model & Competition MVP Guidelines */}
      <div className="glass-panel p-6 border-l-4 border-amber-600 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" /> Methodology & Competition Guidelines
        </h4>
        <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside leading-relaxed">
          <li><strong>Zero Data Leakage:</strong> All multi-horizon models ($h=1 \dots 6$) use expanding window walk-forward validation with strict temporal separation. No future observations are used in feature construction or normalization.</li>
          <li><strong>Direct Returns Target:</strong> Targets are formulated as direct $h$-step log returns $y(t, h) = \ln(P(t+h) / P(t))$, transformed back to absolute prices.</li>
          <li><strong>Prediction Intervals:</strong> Time-ordered residual quantiles (80% and 95%) represent empirical out-of-sample prediction coverage.</li>
          <li><strong>Association vs. Causation:</strong> Cross-correlations capture historical co-movement across lagged returns and must be interpreted as statistical association rather than proof of physical causality.</li>
        </ul>
      </div>
    </div>
  );
}
