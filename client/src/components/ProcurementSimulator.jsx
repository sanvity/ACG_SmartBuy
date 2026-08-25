import React, { useState } from 'react';
import { Factory, ShoppingCart, Layers, CheckCircle2, Flame } from 'lucide-react';
import forecastData from '../data/forecast_data.json';

export default function ProcurementSimulator() {
  // User Input State
  const [salesDemandFoil, setSalesDemandFoil] = useState(650); // Tons finished foil
  const [salesDemandPVC, setSalesDemandPVC] = useState(900);   // Tons finished PVC film
  
  const [inventoryFoil, setInventoryFoil] = useState(120);     // Current stock in tons
  const [inventoryPVC, setInventoryPVC] = useState(150);       // Current stock in tons

  const [targetStockDays, setTargetStockDays] = useState(30);

  // Bill of Materials (BoM) conversion ratios
  const aluBomRatio = 1.05; // 1.05 tons raw Aluminium per ton finished foil (5% process scrap)
  const pvcBomRatio = 1.03; // 1.03 tons raw PVC resin per ton finished film (3% scrap)

  // Derived Requirements
  const rawAluNeed = Math.round(salesDemandFoil * aluBomRatio);
  const rawPVCNeed = Math.round(salesDemandPVC * pvcBomRatio);

  const netAluToBuy = Math.max(0, rawAluNeed - inventoryFoil);
  const netPVCToBuy = Math.max(0, rawPVCNeed - inventoryPVC);

  // Prices from AI Forecast
  const currentPVC = forecastData.historical_data[forecastData.historical_data.length - 1].pvc_resin;
  const currentAlu = forecastData.historical_data[forecastData.historical_data.length - 1].aluminium;

  const pvcForecast = forecastData.future_forecast.pvc;
  const aluForecast = forecastData.future_forecast.aluminium;

  const pvcNextMonthPred = pvcForecast[0].pred;
  const aluNextMonthPred = aluForecast[0].pred;

  const pvc3MonthAvg = Math.round(pvcForecast.slice(0, 3).reduce((acc, c) => acc + c.pred, 0) / 3);
  const alu3MonthAvg = Math.round(aluForecast.slice(0, 3).reduce((acc, c) => acc + c.pred, 0) / 3);

  // Buying Decisions Strategy Engine
  const getPvcStrategy = () => {
    if (pvcNextMonthPred > currentPVC * 1.015) {
      return {
        action: "FORWARD CONTRACT / BUY NOW",
        badgeColor: "bg-red-950 text-red-300 border-red-800",
        reason: `Price projected to rise +${(((pvcNextMonthPred - currentPVC) / currentPVC) * 100).toFixed(1)}% next month. Lock in 70% requirement on 60-day forward contract now.`,
        buyQty: Math.round(netPVCToBuy * 0.7),
        spotQty: Math.round(netPVCToBuy * 0.3),
        targetPrice: `$${currentPVC} - $${Math.round(currentPVC * 1.01)}`
      };
    } else {
      return {
        action: "SPOT PURCHASING / DRAWDOWN",
        badgeColor: "bg-gray-900 text-gray-300 border-gray-700",
        reason: "Price stable or declining. Purchase strictly on spot basis to minimize working capital.",
        buyQty: Math.round(netPVCToBuy * 0.4),
        spotQty: Math.round(netPVCToBuy * 0.6),
        targetPrice: `$${Math.round(currentPVC * 0.99)} - $${currentPVC}`
      };
    }
  };

  const getAluStrategy = () => {
    if (aluNextMonthPred > currentAlu * 1.01) {
      return {
        action: "HEDGE 60% FORWARD / BUY NOW",
        badgeColor: "bg-rose-950 text-rose-300 border-rose-800",
        reason: `Alumina PAX & Energy index trends point upward (+${(((aluNextMonthPred - currentAlu) / currentAlu) * 100).toFixed(1)}%). Secure LME forward contracts.`,
        buyQty: Math.round(netAluToBuy * 0.65),
        spotQty: Math.round(netAluToBuy * 0.35),
        targetPrice: `$${currentAlu} - $${Math.round(currentAlu * 1.01)}`
      };
    } else {
      return {
        action: "NORMAL SPOT PROCUREMENT",
        badgeColor: "bg-gray-900 text-gray-300 border-gray-700",
        reason: "Aluminium prices stable. Standard just-in-time purchasing recommended.",
        buyQty: Math.round(netAluToBuy * 0.5),
        spotQty: Math.round(netAluToBuy * 0.5),
        targetPrice: `$${Math.round(currentAlu * 0.995)}`
      };
    }
  };

  const pvcStrat = getPvcStrategy();
  const aluStrat = getAluStrategy();

  const totalSpendBaseline = (netAluToBuy * alu3MonthAvg) + (netPVCToBuy * pvc3MonthAvg);
  const totalSpendOptimized = (netAluToBuy * (currentAlu * 1.005)) + (netPVCToBuy * (currentPVC * 1.005));
  const estimatedSavings = Math.max(0, Math.round(totalSpendBaseline - totalSpendOptimized));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 border-l-4 border-red-600">
        <div className="flex items-center gap-2 text-red-500 font-semibold text-sm mb-1">
          <Factory className="w-4 h-4" /> Digital Operations & Decision Support
        </div>
        <h1 className="text-2xl font-bold text-white">Smart Procurement & BoM Inventory Simulator</h1>
        <p className="text-gray-400 text-sm mt-1">
          Translates Sales demand forecasts into exact Raw Material requirements via Bill of Materials (BoM) and generates optimal buying decisions (When, How Much, At What Price).
        </p>
      </div>

      {/* Simulator Inputs & BoM Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="glass-panel p-6 space-y-5 lg:col-span-1 border border-red-950">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-red-500" /> Operational Inputs
          </h3>

          {/* Sales Demand Inputs */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-300">
              Finished Foil Sales Forecast (Tons):
              <input 
                type="number" 
                value={salesDemandFoil} 
                onChange={(e) => setSalesDemandFoil(Number(e.target.value))}
                className="w-full mt-1 bg-[#0A0A0E] border border-red-950 rounded-lg p-2 text-white font-mono text-sm focus:border-red-500 focus:outline-none"
              />
            </label>

            <label className="block text-xs font-semibold text-gray-300">
              Finished PVC Film Sales Forecast (Tons):
              <input 
                type="number" 
                value={salesDemandPVC} 
                onChange={(e) => setSalesDemandPVC(Number(e.target.value))}
                className="w-full mt-1 bg-[#0A0A0E] border border-red-950 rounded-lg p-2 text-white font-mono text-sm focus:border-red-500 focus:outline-none"
              />
            </label>
          </div>

          <hr className="border-red-950" />

          {/* Inventory Inputs */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-300">
              Current Available Aluminium Stock (Tons):
              <input 
                type="number" 
                value={inventoryFoil} 
                onChange={(e) => setInventoryFoil(Number(e.target.value))}
                className="w-full mt-1 bg-[#0A0A0E] border border-red-950 rounded-lg p-2 text-white font-mono text-sm focus:border-red-500 focus:outline-none"
              />
            </label>

            <label className="block text-xs font-semibold text-gray-300">
              Current Available PVC Resin Stock (Tons):
              <input 
                type="number" 
                value={inventoryPVC} 
                onChange={(e) => setInventoryPVC(Number(e.target.value))}
                className="w-full mt-1 bg-[#0A0A0E] border border-red-950 rounded-lg p-2 text-white font-mono text-sm focus:border-red-500 focus:outline-none"
              />
            </label>
          </div>

          <hr className="border-red-950" />

          {/* Target Safety Stock Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-300 font-semibold">
              <span>Target Safety Stock Days:</span>
              <span className="text-red-400 font-mono">{targetStockDays} Days</span>
            </div>
            <input 
              type="range" 
              min="15" 
              max="60" 
              value={targetStockDays}
              onChange={(e) => setTargetStockDays(Number(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
          </div>
        </div>

        {/* BoM Calculation & Strategy Output */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-6 border border-red-950">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-500" /> Bill of Materials (BoM) Breakdown & Purchase Decision
            </h3>
            <span className="px-3 py-1 rounded bg-red-950 text-red-300 text-xs font-semibold border border-red-800/40">
              Real-Time AI Decision Engine
            </span>
          </div>

          {/* BoM Summary Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Aluminium BoM Card */}
            <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-950 space-y-3">
              <div className="flex justify-between items-center border-b border-red-950 pb-2">
                <span className="font-bold text-white text-sm">Aluminium Foil RM Decision</span>
                <span className="text-xs text-gray-400 font-mono">BoM Ratio: 1.05x</span>
              </div>
              <div className="text-xs space-y-1 text-gray-300">
                <div className="flex justify-between"><span>Gross BoM Requirement:</span><strong className="text-white font-mono">{rawAluNeed} Tons</strong></div>
                <div className="flex justify-between"><span>Current Stock + In-Transit:</span><strong className="text-gray-400 font-mono">{inventoryFoil} Tons</strong></div>
                <div className="flex justify-between text-red-400 pt-1 border-t border-red-950">
                  <span className="font-bold">Net Procurement Needed:</span>
                  <strong className="text-sm font-bold font-mono">{netAluToBuy} Tons</strong>
                </div>
              </div>
              <div className="pt-2">
                <span className={`inline-block w-full text-center py-1.5 px-3 rounded text-xs font-bold border ${aluStrat.badgeColor}`}>
                  {aluStrat.action}
                </span>
                <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">{aluStrat.reason}</p>
                <div className="mt-2 text-[11px] bg-black p-2 rounded text-gray-300 font-mono flex justify-between border border-red-950">
                  <span>Target Buy Price:</span>
                  <strong className="text-rose-400">{aluStrat.targetPrice}</strong>
                </div>
              </div>
            </div>

            {/* PVC Resin BoM Card */}
            <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-950 space-y-3">
              <div className="flex justify-between items-center border-b border-red-950 pb-2">
                <span className="font-bold text-white text-sm">PVC Resin RM Decision</span>
                <span className="text-xs text-gray-400 font-mono">BoM Ratio: 1.03x</span>
              </div>
              <div className="text-xs space-y-1 text-gray-300">
                <div className="flex justify-between"><span>Gross BoM Requirement:</span><strong className="text-white font-mono">{rawPVCNeed} Tons</strong></div>
                <div className="flex justify-between"><span>Current Stock + In-Transit:</span><strong className="text-gray-400 font-mono">{inventoryPVC} Tons</strong></div>
                <div className="flex justify-between text-red-400 pt-1 border-t border-red-950">
                  <span className="font-bold">Net Procurement Needed:</span>
                  <strong className="text-sm font-bold font-mono">{netPVCToBuy} Tons</strong>
                </div>
              </div>
              <div className="pt-2">
                <span className={`inline-block w-full text-center py-1.5 px-3 rounded text-xs font-bold border ${pvcStrat.badgeColor}`}>
                  {pvcStrat.action}
                </span>
                <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">{pvcStrat.reason}</p>
                <div className="mt-2 text-[11px] bg-black p-2 rounded text-gray-300 font-mono flex justify-between border border-red-950">
                  <span>Target Buy Price:</span>
                  <strong className="text-red-400">{pvcStrat.targetPrice}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Savings & Financial Impact Summary Box */}
          <div className="bg-gradient-to-r from-red-950/80 to-black p-5 rounded-xl border border-red-600/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> AI Purchase Order Optimization Summary
              </div>
              <h4 className="text-lg font-bold text-white mt-1">Estimated Cost Reduction for Current Cycle</h4>
              <p className="text-xs text-gray-300 mt-0.5">
                By timing forward contracts for Aluminium & PVC against 3-month forecast peaks.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-400 font-mono">${estimatedSavings.toLocaleString()}</div>
              <span className="text-[11px] text-gray-400">Direct Purchase Savings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
