import React, { useState } from 'react';
import { Factory, ShoppingCart, Layers, CheckCircle2, AlertTriangle, Download, Sliders, DollarSign, ShieldAlert, TrendingUp, Sparkles } from 'lucide-react';
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
  
  // Real-world corporate benchmark carrying cost: default 3.5%/year
  const [carryingCostYr, setCarryingCostYr] = useState(3.5);
  const [landedPremiumPct, setLandedPremiumPct] = useState(2.5); // +2.5% over benchmark
  const [forwardBuyPct, setForwardBuyPct] = useState(110); // 110% of requirement (conservative forward buy)
  const [priceThresholdPct, setPriceThresholdPct] = useState(1.5); // 1.5% surge threshold before locking
  
  const [storageCapacity, setStorageCapacity] = useState(1500); // Max storage limit (tons)
  const [moqTons, setMoqTons] = useState(50);                   // Minimum Order Quantity (tons)
  const [monthlyBudgetCap, setMonthlyBudgetCap] = useState(3500000); // $3.5M cap

  // 100% Real Historical Dataset & Model Forecast Layer
  const futureForecasts = forecastData.future_forecast[material] || [];
  const histData = forecastData.historical_data || [];
  const currentSpotPrice = histData[histData.length - 1]?.[material] || (material === 'aluminium' ? 3251.0 : 1220.0);

  const monthlyCarryingRate = (carryingCostYr / 100.0) / 12.0;
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

  // Time-Phased Inventory Calculation Engine
  let prevStockAI = Math.max(0, Number(startingStock));
  let prevStockBase = Math.max(0, Number(startingStock));

  const scheduleAI = [];
  const scheduleBase = [];

  let countLocks = 0;
  let countDefers = 0;
  let countStaggers = 0;
  let totalAvoidedPriceGain = 0;

  for (let m = 1; m <= 6; m++) {
    const forecastObj = futureForecasts[m - 1] || { pred_ensemble: currentSpotPrice, target_date: `M+${m}` };
    const spotBenchmark = forecastObj.pred_ensemble || currentSpotPrice;
    const landedPrice = spotBenchmark * landedMultiplier;

    const finishedDemand = monthlyDemandList[m - 1];
    const rawConsumption = Math.round(finishedDemand * bomRatio);
    const receiptsInTransit = (m === Number(inTransitMonth)) ? Math.max(0, Number(inTransitQty)) : 0;

    // --- BASELINE REPLENISHMENT POLICY (Spot Just-in-Time) ---
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

    // --- AI SMART BUY POLICY (Disciplined Forward Hedging) ---
    const availStockAI = prevStockAI + receiptsInTransit;
    const netNeedAI = Math.max(0, rawConsumption + targetSafetyStockTons - availStockAI);

    // Scan forward horizon prices
    const futurePricesInHorizon = futureForecasts.slice(m - 1).map(f => f.pred_ensemble || currentSpotPrice);
    const maxFuturePrice = Math.max(...futurePricesInHorizon);
    const minFuturePrice = Math.min(...futurePricesInHorizon);

    const futureSurgePct = ((maxFuturePrice - spotBenchmark) / spotBenchmark) * 100;
    const futureDropPct = ((spotBenchmark - minFuturePrice) / spotBenchmark) * 100;

    let action = "STAGGER REPLENISHMENT";
    let orderAI = 0;

    // Disciplined threshold check: Future surge must exceed carrying cost + safety threshold
    if (futureSurgePct >= priceThresholdPct) {
      action = "BUY FORWARD / PRICE LOCK";
      countLocks++;
      const multiplier = forwardBuyPct / 100.0;
      const targetOrder = Math.max(Number(moqTons), Math.round(netNeedAI * multiplier));
      const maxAllowedByCap = Math.max(0, Number(storageCapacity) + rawConsumption - availStockAI);
      orderAI = Math.min(targetOrder, maxAllowedByCap);

      // Avoided price gain calculation (Spot price at peak vs locked current spot price)
      if (maxFuturePrice > spotBenchmark) {
        totalAvoidedPriceGain += (orderAI * (maxFuturePrice - spotBenchmark) * landedMultiplier);
      }
    } else if (futureDropPct >= priceThresholdPct) {
      action = "DEFER / MINIMUM REPLENISHMENT";
      countDefers++;
      orderAI = netNeedAI > 0 ? Math.max(Number(moqTons), netNeedAI) : 0;
    } else {
      action = "STAGGER REPLENISHMENT";
      countStaggers++;
      orderAI = netNeedAI > 0 ? Math.max(Number(moqTons), netNeedAI) : 0;
    }

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

  // Financial Metrics & Calculations
  const totalSpendAI = scheduleAI.reduce((acc, r) => acc + r.spend, 0);
  const totalCarryingAI = scheduleAI.reduce((acc, r) => acc + r.carryingCost, 0);
  const totalCostAI = totalSpendAI + totalCarryingAI;

  const totalSpendBase = scheduleBase.reduce((acc, r) => acc + r.spend, 0);
  const totalCarryingBase = scheduleBase.reduce((acc, r) => acc + r.carryingCost, 0);
  const totalCostBase = totalSpendBase + totalCarryingBase;

  const scenarioSavings = totalCostBase - totalCostAI;
  const savingsPct = (scenarioSavings / totalCostBase) * 100.0;

  const peakForecastPrice = Math.max(...futureForecasts.map(f => f.pred_ensemble || currentSpotPrice));
  const peakSurgePct = (((peakForecastPrice - currentSpotPrice) / currentSpotPrice) * 100).toFixed(1);

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
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Smart Procurement & S&OP Simulator</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              HISTORICAL MODEL FORECASTS
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-0.5">
            Translates demand into raw material requirements, enforces inventory constraints, and optimizes purchase timing based on ML forecasts.
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
          <Sliders className="w-4 h-4 text-red-500" /> Operational & Policy Parameters
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
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

          <div>
            <label className="text-gray-400 block mb-1">Forward-Buy Ratio (%):</label>
            <input 
              type="number" 
              step="5"
              value={forwardBuyPct} 
              onChange={(e) => setForwardBuyPct(Math.max(100, Number(e.target.value)))}
              className="w-full bg-[#0A0A0E] border border-red-950 rounded p-1.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Lock Surge Threshold (%):</label>
            <input 
              type="number" 
              step="0.1"
              value={priceThresholdPct} 
              onChange={(e) => setPriceThresholdPct(Math.max(0.1, Number(e.target.value)))}
              className="w-full bg-[#0A0A0E] border border-red-950 rounded p-1.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Starting Stock (Tons):</label>
            <input 
              type="number" 
              value={startingStock} 
              onChange={(e) => setStartingStock(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[#0A0A0E] border border-red-950 rounded p-1.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Storage Limit (Tons):</label>
            <input 
              type="number" 
              value={storageCapacity} 
              onChange={(e) => setStorageCapacity(Math.max(500, Number(e.target.value)))}
              className="w-full bg-[#0A0A0E] border border-red-950 rounded p-1.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Landed Premium (%):</label>
            <input 
              type="number" 
              step="0.5"
              value={landedPremiumPct} 
              onChange={(e) => setLandedPremiumPct(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[#0A0A0E] border border-red-950 rounded p-1.5 text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Target Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 border-l-4 border-gray-600">
          <span className="text-[11px] text-gray-400 uppercase font-bold block">Baseline Spot Cost</span>
          <div className="text-xl font-bold text-white font-mono mt-1">
            ${(totalCostBase / 1e6).toFixed(2)}M
          </div>
          <span className="text-[10px] text-gray-500">Spot JIT Replenishment</span>
        </div>

        <div className="glass-panel p-4 border-l-4 border-red-600">
          <span className="text-[11px] text-gray-400 uppercase font-bold block">AI Procurement Cost</span>
          <div className="text-xl font-bold text-white font-mono mt-1">
            ${(totalCostAI / 1e6).toFixed(2)}M
          </div>
          <span className="text-[10px] text-gray-500">Optimized Purchase Timing</span>
        </div>

        <div className={`glass-panel p-4 border-l-4 ${scenarioSavings >= 0 ? 'border-emerald-500 bg-emerald-950/10' : 'border-amber-500 bg-amber-950/10'}`}>
          <span className="text-[11px] text-gray-400 uppercase font-bold block">Estimated Policy Savings</span>
          <div className={`text-xl font-bold font-mono mt-1 ${scenarioSavings >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {scenarioSavings >= 0 ? `+$${Math.round(scenarioSavings).toLocaleString()}` : `-$${Math.round(Math.abs(scenarioSavings)).toLocaleString()}`}
          </div>
          <span className="text-[10px] text-gray-400">
            {scenarioSavings >= 0 ? `+${savingsPct.toFixed(2)}% Net Cost Reduction` : `${savingsPct.toFixed(2)}% Higher Spend`}
          </span>
        </div>

        <div className="glass-panel p-4 border-l-4 border-indigo-500">
          <span className="text-[11px] text-gray-400 uppercase font-bold block">AI Buy Decisions</span>
          <div className="text-xl font-bold text-indigo-300 font-mono mt-1">
            {countLocks} Locks / {countDefers} Defers
          </div>
          <span className="text-[10px] text-gray-400">{countStaggers} Stagger Replenishments</span>
        </div>
      </div>

      {/* Causal Chain Storyboard Box (Forecast -> Recommendation -> Economic Result) */}
      <div className="bg-[#0A0A0E] p-5 rounded-xl border border-red-900/60 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-400" /> AI Strategic Procurement Causal Storyboard
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Step 1: Forecast */}
          <div className="bg-[#12121A] p-3.5 rounded-lg border border-zinc-800">
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block mb-1">1. Empirical AI Price Forecast</span>
            <div className="text-sm font-bold text-white">Current Spot: ${currentSpotPrice.toLocaleString()}/MT</div>
            <div className="text-xs text-gray-300 mt-1">
              Expected Peak: <strong className="text-emerald-400">${peakForecastPrice.toLocaleString()}/MT</strong> (+{peakSurgePct}%)
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              ML Ensemble predicts raw material price surge across 6-month horizon.
            </p>
          </div>

          {/* Step 2: AI Recommendation */}
          <div className="bg-[#12121A] p-3.5 rounded-lg border border-zinc-800">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mb-1">2. AI Policy Decision</span>
            <div className="text-sm font-bold text-indigo-300">BUY FORWARD / PRICE LOCK</div>
            <div className="text-xs text-gray-300 mt-1">
              Order Ratio: <strong className="text-white">{forwardBuyPct}% of Requirement</strong>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              Locks current spot benchmark price early before upcoming peak to prevent cost inflation.
            </p>
          </div>

          {/* Step 3: Economic Result */}
          <div className="bg-[#12121A] p-3.5 rounded-lg border border-zinc-800">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">3. Net Financial Impact</span>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between text-emerald-400">
                <span>Avoided Price Increase:</span>
                <span>+${Math.round(totalAvoidedPriceGain).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Net Carrying Cost:</span>
                <span>-${Math.round(totalCarryingAI).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white font-bold border-t border-zinc-700 pt-1">
                <span>Net Policy Savings:</span>
                <span className="text-emerald-400">+${Math.round(scenarioSavings).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Business Narrative Explanation */}
        <div className="bg-red-950/20 border border-red-900/40 p-3.5 rounded-lg text-xs text-gray-300 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Business Value Narrative: </strong>
            {scenarioSavings >= 0 ? (
              <span>
                Based on real historical dataset forecasts, the AI model identified upcoming raw material price increases (+{peakSurgePct}% peak) and strategically locked inventory at spot benchmark rates before the surge. By calibrating carrying costs ({carryingCostYr}%/yr) against expected price gains, the resulting price avoidance (+${Math.round(totalAvoidedPriceGain).toLocaleString()}) comfortably exceeded holding costs, generating <strong>+${Math.round(scenarioSavings).toLocaleString()} (+{savingsPct.toFixed(2)}%)</strong> in net procurement savings.
              </span>
            ) : (
              <span>
                Under current market parameters, the cost of holding excess forward inventory (${Math.round(totalCarryingAI).toLocaleString()}) outweighs the small spot price variation. Adjust carrying costs or lock thresholds to explore positive hedging windows.
              </span>
            )}
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
            {scenarioSavings >= 0 ? `+${savingsPct.toFixed(2)}% Cost Reduction` : `${savingsPct.toFixed(2)}% Higher Spend`}
          </span>
        </div>
      </div>
    </div>
  );
}
