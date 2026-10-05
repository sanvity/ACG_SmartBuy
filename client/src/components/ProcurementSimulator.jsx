import React, { useState } from 'react';
import { Factory, ShoppingCart, Layers, CheckCircle2, AlertTriangle, Download, Sliders, DollarSign, ShieldAlert } from 'lucide-react';
import forecastData from '../data/forecast_data.json';

export default function ProcurementSimulator() {
  // 1. Material Selector
  const [material, setMaterial] = useState('aluminium'); // 'aluminium' or 'pvc_resin'

  // 2. Finished Goods Demand Inputs (6 Months)
  const [demandM1, setDemandM1] = useState(600);
  const [demandM2, setDemandM2] = useState(650);
  const [demandM3, setDemandM3] = useState(700);
  const [demandM4, setDemandM4] = useState(620);
  const [demandM5, setDemandM5] = useState(640);
  const [demandM6, setDemandM6] = useState(680);

  // 3. Operational & Constraint Inputs
  const [startingStock, setStartingStock] = useState(150); // Tons
  const [inTransitQty, setInTransitQty] = useState(100);     // In-transit tons
  const [inTransitMonth, setInTransitMonth] = useState(1);   // Arrival month (1..6)
  
  const [bomRatio, setBomRatio] = useState(material === 'aluminium' ? 1.05 : 1.03);
  const [safetyStockDays, setSafetyStockDays] = useState(30); // Target safety stock days
  const [carryingCostYr, setCarryingCostYr] = useState(12);    // 12% per year
  const [landedPremiumPct, setLandedPremiumPct] = useState(2.5); // +2.5% over LME/Spot benchmark
  
  const [storageCapacity, setStorageCapacity] = useState(1200); // Max storage limit (tons)
  const [moqTons, setMoqTons] = useState(50);                   // Minimum Order Quantity (tons)
  const [monthlyBudgetCap, setMonthlyBudgetCap] = useState(2500000); // $2.5M cap

  const futureForecasts = forecastData.future_forecast[material] || [];
  const histData = forecastData.historical_data || [];
  const currentSpotPrice = histData[histData.length - 1]?.[material] || 2000;

  const monthlyCarryingRate = (carryingCostYr / 100) / 12.0;
  const landedMultiplier = 1.0 + (landedPremiumPct / 100.0);

  const monthlyDemandList = [
    Math.max(0, Number(demandM1)),
    Math.max(0, Number(demandM2)),
    Math.max(0, Number(demandM3)),
    Math.max(0, Number(demandM4)),
    Math.max(0, Number(demandM5)),
    Math.max(0, Number(demandM6)),
  ];

  // Daily consumption rate (approx 30 days/mo) for safety stock calculation
  const avgMonthlyDemand = monthlyDemandList.reduce((a, b) => a + b, 0) / 6.0;
  const rawDailyDemand = (avgMonthlyDemand * bomRatio) / 30.0;
  const targetSafetyStockTons = Math.round(rawDailyDemand * safetyStockDays);

  // 4. Time-Phased Inventory Calculation Engine
  let prevStockAI = Math.max(0, Number(startingStock));
  let prevStockBase = Math.max(0, Number(startingStock));

  const scheduleAI = [];
  const scheduleBase = [];

  for (let m = 1; m <= 6; m++) {
    const forecastObj = futureForecasts[m - 1] || { pred_ensemble: currentSpotPrice, target_date: `M+${m}` };
    const spotBenchmark = forecastObj.pred_ensemble || currentSpotPrice;
    const landedPrice = spotBenchmark * landedMultiplier;

    const finishedDemand = monthlyDemandList[m - 1];
    const rawConsumption = Math.round(finishedDemand * bomRatio);

    const receiptsInTransit = (m === Number(inTransitMonth)) ? Math.max(0, Number(inTransitQty)) : 0;

    // --- BASELINE REPLENISHMENT POLICY ---
    const availStockBase = prevStockBase + receiptsInTransit;
    const netNeedBase = Math.max(0, rawConsumption + targetSafetyStockTons - availStockBase);
    let orderBase = netNeedBase > 0 ? Math.max(Number(moqTons), netNeedBase) : 0;
    const endStockBase = availStockBase + orderBase - rawConsumption;
    const spendBase = orderBase * landedPrice;
    const carryingBase = ((availStockBase + endStockBase) / 2.0) * landedPrice * monthlyCarryingRate;

    scheduleBase.push({
      month: m,
      date: forecastObj.target_date,
      demand: rawConsumption,
      receipts: receiptsInTransit,
      order: orderBase,
      endStock: endStockBase,
      spend: spendBase,
      carryingCost: carryingBase,
      landedPrice: landedPrice
    });
    prevStockBase = endStockBase;

    // --- AI SMART BUY POLICY ---
    const availStockAI = prevStockAI + receiptsInTransit;
    const priceChangePct = ((spotBenchmark - currentSpotPrice) / currentSpotPrice) * 100;
    
    // Strategic Order Calculation
    let action = "STAGGER REPLENISHMENT";
    let orderAI = 0;

    const netNeedAI = Math.max(0, rawConsumption + targetSafetyStockTons - availStockAI);

    if (priceChangePct > 2.0) {
      // Forward Lock / Buy Forward: Order 120% of net need up to storage capacity
      action = "BUY FORWARD / PRICE LOCK";
      const targetOrder = Math.max(Number(moqTons), Math.round(netNeedAI * 1.3));
      const maxAllowedByCap = Math.max(0, Number(storageCapacity) + rawConsumption - availStockAI);
      orderAI = Math.min(targetOrder, maxAllowedByCap);
    } else if (priceChangePct < -2.0) {
      // Defer / Minimum Buy: Order strictly minimum to maintain safety stock
      action = "DEFER / MINIMUM REPLENISHMENT";
      orderAI = netNeedAI > 0 ? Math.max(Number(moqTons), netNeedAI) : 0;
    } else {
      action = "STAGGER REPLENISHMENT";
      orderAI = netNeedAI > 0 ? Math.max(Number(moqTons), netNeedAI) : 0;
    }

    // Budget Cap Enforcement Warning
    const spendAI = orderAI * landedPrice;
    const endStockAI = availStockAI + orderAI - rawConsumption;
    const carryingAI = ((availStockAI + endStockAI) / 2.0) * landedPrice * monthlyCarryingRate;

    scheduleAI.push({
      month: m,
      date: forecastObj.target_date,
      demand: rawConsumption,
      receipts: receiptsInTransit,
      order: orderAI,
      endStock: endStockAI,
      spend: spendAI,
      carryingCost: carryingAI,
      landedPrice: landedPrice,
      action: action,
      stockoutRisk: endStockAI < targetSafetyStockTons,
      capacityBreach: endStockAI > Number(storageCapacity),
      budgetExceeded: spendAI > Number(monthlyBudgetCap)
    });
    prevStockAI = endStockAI;
  }

  // 5. Total Financial Metrics & Comparisons
  const totalSpendAI = scheduleAI.reduce((acc, r) => acc + r.spend, 0);
  const totalCarryingAI = scheduleAI.reduce((acc, r) => acc + r.carryingCost, 0);
  const totalCostAI = totalSpendAI + totalCarryingAI;

  const totalSpendBase = scheduleBase.reduce((acc, r) => acc + r.spend, 0);
  const totalCarryingBase = scheduleBase.reduce((acc, r) => acc + r.carryingCost, 0);
  const totalCostBase = totalSpendBase + totalCarryingBase;

  const scenarioSavings = totalCostBase - totalCostAI; // Can be positive or negative!

  const handleDownloadScheduleCSV = () => {
    const headers = "Month,Target_Date,Gross_Raw_Demand,Receipts,AI_Order_Tons,AI_End_Stock,AI_Material_Spend,AI_Carrying_Cost,Baseline_Order_Tons,Baseline_End_Stock,Action\n";
    const rows = scheduleAI.map((r, i) => {
      const b = scheduleBase[i];
      return `${r.month},${r.date},${r.demand},${r.receipts},${r.order},${r.endStock},${r.spend.toFixed(2)},${r.carryingCost.toFixed(2)},${b.order},${b.endStock},${r.action}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ACG_SmartBuy_Procurement_Schedule_${material}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="glass-panel p-4 border-l-4 border-red-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Smart Procurement & S&OP Simulator</h1>
          <p className="text-gray-400 text-xs mt-0.5">
            Translates demand into raw material requirements, enforces inventory constraints, and optimizes purchase timing.
          </p>
        </div>

        <button 
          onClick={handleDownloadScheduleCSV}
          className="px-3 py-1.5 rounded-lg bg-[#14141C] hover:bg-[#1E1E28] text-gray-200 text-xs font-semibold border border-zinc-800 flex items-center gap-1.5 transition shadow"
        >
          <Download className="w-3.5 h-3.5 text-rose-400" /> Export CSV
        </button>
      </div>

      {/* Material & Main Parameter Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0A0A0E] p-4 rounded-xl border border-zinc-800">
        <div>
          <label className="block text-xs text-gray-400 font-semibold mb-1">Target Raw Material:</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setMaterial('aluminium'); setBomRatio(1.05); }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                material === 'aluminium' ? 'bg-red-800 text-white shadow' : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              Aluminium Foil (World Bank Spot)
            </button>
            <button
              onClick={() => { setMaterial('pvc_resin'); setBomRatio(1.03); }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                material === 'pvc_resin' ? 'bg-rose-900 text-white shadow' : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              PVC Resin (GoI DPIIT WPI)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 font-semibold mb-1">BoM Yield Coefficient (Raw/FG):</label>
          <input 
            type="number"
            step="0.01"
            value={bomRatio}
            onChange={(e) => setBomRatio(Math.max(0.5, Number(e.target.value)))}
            className="w-full bg-[#121218] border border-red-900/60 rounded-lg p-1.5 text-xs text-white font-mono"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 font-semibold mb-1">Safety Stock Target (Days):</label>
          <div className="flex items-center gap-3">
            <input 
              type="range"
              min="10"
              max="60"
              value={safetyStockDays}
              onChange={(e) => setSafetyStockDays(Number(e.target.value))}
              className="flex-1 accent-red-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-red-400 font-mono w-16 text-right">
              {safetyStockDays} Days ({targetSafetyStockTons} T)
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Constraint Inputs Drawer */}
      <div className="glass-panel p-5 border border-red-950 space-y-4">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-red-500" /> Operational & Inventory Parameters
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="text-gray-400 block mb-1">Initial Inventory (T):</label>
            <input 
              type="number" 
              value={startingStock} 
              onChange={(e) => setStartingStock(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[#0A0A0E] border border-red-950 rounded p-1.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">In-Transit Qty (T):</label>
            <input 
              type="number" 
              value={inTransitQty} 
              onChange={(e) => setInTransitQty(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[#0A0A0E] border border-red-950 rounded p-1.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Arrival Month:</label>
            <select
              value={inTransitMonth}
              onChange={(e) => setInTransitMonth(Number(e.target.value))}
              className="w-full bg-[#0A0A0E] border border-red-950 rounded p-1.5 text-white font-mono"
            >
              {[1, 2, 3, 4, 5, 6].map(m => <option key={m} value={m}>Month M+{m}</option>)}
            </select>
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Storage Limit (T):</label>
            <input 
              type="number" 
              value={storageCapacity} 
              onChange={(e) => setStorageCapacity(Math.max(100, Number(e.target.value)))}
              className="w-full bg-[#0A0A0E] border border-red-950 rounded p-1.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">MOQ Increment (T):</label>
            <input 
              type="number" 
              value={moqTons} 
              onChange={(e) => setMoqTons(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#0A0A0E] border border-red-950 rounded p-1.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Carrying Cost (%/Yr):</label>
            <input 
              type="number" 
              step="0.5"
              value={carryingCostYr} 
              onChange={(e) => setCarryingCostYr(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[#0A0A0E] border border-red-950 rounded p-1.5 text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Time-Phased Procurement Schedule Table */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-red-500" /> Time-Phased Procurement Schedule (6-Month Horizon)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-red-950 text-gray-400 bg-[#0E0E14]">
                <th className="p-3">Month</th>
                <th className="p-3">Target Date</th>
                <th className="p-3 text-right">Raw Demand (T)</th>
                <th className="p-3 text-right">Receipts (T)</th>
                <th className="p-3 text-right bg-red-950/40 text-red-300 font-bold">AI Order (T)</th>
                <th className="p-3 text-right bg-red-950/40 text-red-300 font-bold">Ending Stock</th>
                <th className="p-3 text-right">Material Spend</th>
                <th className="p-3 text-right">Carrying Cost</th>
                <th className="p-3">Policy Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-950 text-gray-300 font-mono">
              {scheduleAI.map((r) => (
                <tr key={r.month} className="hover:bg-red-950/20 transition">
                  <td className="p-3 font-bold text-red-400">M+{r.month}</td>
                  <td className="p-3 text-white font-sans">{r.date}</td>
                  <td className="p-3 text-right">{r.demand}</td>
                  <td className="p-3 text-right text-emerald-400">{r.receipts > 0 ? `+${r.receipts}` : '-'}</td>
                  <td className="p-3 text-right font-bold text-red-400 bg-red-950/20">{r.order} T</td>
                  <td className={`p-3 text-right font-bold bg-red-950/20 ${r.stockoutRisk ? 'text-amber-400' : 'text-white'}`}>
                    {r.endStock} T
                  </td>
                  <td className="p-3 text-right">${Math.round(r.spend).toLocaleString()}</td>
                  <td className="p-3 text-right text-gray-400">${Math.round(r.carryingCost).toLocaleString()}</td>
                  <td className="p-3 font-sans">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        r.action.includes('FORWARD') ? 'bg-red-950 text-red-300 border border-red-800' :
                        r.action.includes('DEFER') ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        'bg-gray-900 text-gray-300 border border-gray-700'
                      }`}>
                        {r.action}
                      </span>
                      {r.stockoutRisk && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Low Safety Stock" />}
                      {r.capacityBreach && <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" title="Storage Capacity Exceeded" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Comparison & Scenario Outcome Box */}
      <div className="bg-gradient-to-r from-red-950/90 to-black p-6 rounded-xl border border-red-600/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
            <DollarSign className="w-4 h-4" /> Policy Outcome Comparison (Material Spend + Carrying Costs)
          </div>
          <h4 className="text-xl font-bold text-white">6-Month Total Financial Impact</h4>
          <div className="text-xs text-gray-300 space-x-4 pt-1 font-mono">
            <span>AI Plan Total: <strong className="text-white">${Math.round(totalCostAI).toLocaleString()}</strong></span>
            <span>Baseline Plan Total: <strong className="text-gray-400">${Math.round(totalCostBase).toLocaleString()}</strong></span>
          </div>
        </div>

        <div className="text-right bg-[#0A0A0E] p-4 rounded-xl border border-red-900/60 min-w-[220px]">
          <span className="text-xs text-gray-400 uppercase font-bold block">Estimated Policy Savings</span>
          <div className={`text-3xl font-bold font-mono ${scenarioSavings >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {scenarioSavings >= 0 ? `+$${Math.round(scenarioSavings).toLocaleString()}` : `-$${Math.round(Math.abs(scenarioSavings)).toLocaleString()}`}
          </div>
          <span className="text-[11px] text-gray-400">
            {scenarioSavings >= 0 ? 'Cost Reduction' : 'Higher Spend (Hedging Premium)'}
          </span>
        </div>
      </div>
    </div>
  );
}
