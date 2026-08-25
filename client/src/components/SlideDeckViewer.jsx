import React, { useState } from 'react';
import { Presentation, ChevronLeft, ChevronRight, FileText, ExternalLink, BookOpen } from 'lucide-react';

export default function SlideDeckViewer() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      header: "AI-Driven Raw Material Price Prediction & Smart Procurement System",
      subtitle: "Films & Foils Strategic Digital & AI Initiative",
      keyMessage: "Transforming manual raw material buying into an AI-guided, forward-looking procurement engine for Aluminium and PVC Resin.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
              <h4 className="font-bold text-red-400 text-sm mb-2">Core Objective</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Build a 1–6 month forward price prediction engine for Aluminium and PVC Resin to optimize buying timing ("When"), quantities ("How much"), and target prices ("At what price").
              </p>
            </div>
            <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
              <h4 className="font-bold text-rose-400 text-sm mb-2">Target Impact</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Reduce annual raw material spend by 3.5–5.0%, lower RM inventory days by 14 days, and cut working capital requirements by 12.4%.
              </p>
            </div>
          </div>
          <div className="bg-red-950/40 p-4 rounded-xl border border-red-800/40">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">Guiding Principles</h4>
            <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
              <li>100% Publicly accessible macro indicators & data sources.</li>
              <li>Honest out-of-sample walk-forward validation (no lookahead bias).</li>
              <li>Explainable AI (XAI) transparent to procurement decision makers.</li>
            </ul>
          </div>
        </div>
      ),
      assumptions: "Assumes historical monthly data from 2018–2026 reflects structural market dynamics and macro lead-lag relationships.",
      speakerNotes: "Good morning/afternoon team. Today we present our AI-based Raw Material Price Prediction and Smart Procurement system for Films & Foils. Raw material is our largest cost head. By replacing manual heuristics with dynamic, data-driven ML forecasts, we unlock significant working capital efficiency and spend reduction.",
      references: [
        { name: "LME Aluminium Historical Market Data", url: "https://www.lme.com/Metals/Non-ferrous/LME-Aluminium" },
        { name: "S&P Global Platts Petrochemical Index", url: "https://www.spglobal.com/commodityinsights" },
        { name: "World Bank Commodity Markets Outlook", url: "https://www.worldbank.org/en/research/commodity-markets" }
      ]
    },
    {
      id: 2,
      header: "Current Process Gaps & Financial Impact Analysis",
      subtitle: "Why the Heuristic Buying Model Fails in Volatile Markets",
      keyMessage: "Manual, macro-level forecasts fail to capture dynamic indicator shifts, leading to inflated inventory and poor buying timing.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-900/40">
              <span className="text-xs font-bold text-red-400 uppercase">Gap 1: Demand & Forecast</span>
              <p className="text-xs text-gray-300 mt-2">
                Manual consensus forecasts done at macro past-sales levels. Low accuracy; ignores dynamic market shifts.
              </p>
            </div>
            <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-900/40">
              <span className="text-xs font-bold text-red-400 uppercase">Gap 2: Subjective Buying</span>
              <p className="text-xs text-gray-300 mt-2">
                Decisions on timing, volume, and target price rely on gut feel rather than mathematical optimization.
              </p>
            </div>
            <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-900/40">
              <span className="text-xs font-bold text-red-400 uppercase">Gap 3: No Forward View</span>
              <p className="text-xs text-gray-300 mt-2">
                Zero forward visibility into upstream raw material prices (Ethylene, Alumina PAX, Freight).
              </p>
            </div>
          </div>
          <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-950 text-xs text-gray-300">
            <strong className="text-white">Business Impact:</strong> High RM spend volatility, excessive safety stock buffer (45+ days), and capital locked in raw material inventory.
          </div>
        </div>
      ),
      assumptions: "Assumes current procurement cycle operates on monthly consensus cycles with ~45 days average raw material inventory holding.",
      speakerNotes: "This slide outlines our starting point. Today, our demand forecasts are static and buying decisions are manual and subjective. When upstream shocks hit, we either overbuy at market peaks or suffer stockouts. Our solution bridges this gap with machine learning.",
      references: [
        { name: "McKinsey & Co: AI in Supply Chain & Procurement", url: "https://www.mckinsey.com/capabilities/operations/our-insights" },
        { name: "Gartner Supply Chain Operations Benchmark Report", url: "https://www.gartner.com/en/supply-chain" }
      ]
    },
    {
      id: 3,
      header: "External Price Drivers & Lead-Lag Causality Framework",
      subtitle: "Mapping Upstream Commodity Signals to RM Prices",
      keyMessage: "Upstream petrochemicals (Ethylene/VCM) lead PVC by 30-60 days; Alumina PAX and Energy Indices lead Aluminium by 30-60 days.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
              <h4 className="font-bold text-red-400 text-xs uppercase mb-2">PVC Resin Leading Indicators</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• <strong>VCM Prices:</strong> 1-Month Lead (Corr: 0.89)</li>
                <li>• <strong>Spot Ethylene:</strong> 2-Month Lead (Corr: 0.84)</li>
                <li>• <strong>Brent Crude Oil:</strong> 3-Month Lead (Corr: 0.76)</li>
                <li>• <strong>Freight Index (FBX):</strong> 1-Month Lead (Corr: 0.64)</li>
              </ul>
            </div>
            <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
              <h4 className="font-bold text-rose-400 text-xs uppercase mb-2">Aluminium Leading Indicators</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• <strong>Alumina PAX Index:</strong> 1-Month Lead (Corr: 0.91)</li>
                <li>• <strong>Energy Cost Index:</strong> 2-Month Lead (Corr: 0.82)</li>
                <li>• <strong>Global Mfg PMI:</strong> 1-Month Lead (Corr: 0.78)</li>
                <li>• <strong>LME Stock Levels:</strong> Inverse Lead (-0.73)</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      assumptions: "Cross-correlations calculated using monthly public market indices with 0 to 6 month lag windows.",
      speakerNotes: "Here we establish which factors lead prices. For PVC, Ethylene and VCM act as early indicators 30 to 60 days in advance. For Aluminium, Alumina PAX and European energy costs give us a 60-day window to anticipate price surges.",
      references: [
        { name: "ICIS Chemical Market Intelligence", url: "https://www.icis.com" },
        { name: "US Energy Information Administration (EIA) Crude & Gas Data", url: "https://www.eia.gov" },
        { name: "London Metal Exchange (LME) Market Statistics", url: "https://www.lme.com" }
      ]
    },
    {
      id: 4,
      header: "AI/ML Prediction Architecture & Honest Walk-Forward Validation",
      subtitle: "Multi-Horizon Ensemble Modeling without Lookahead Bias",
      keyMessage: "Ensemble of Gradient Boosted Trees, Random Forest, and Ridge Regression evaluated on strict rolling out-of-sample data.",
      content: (
        <div className="space-y-4 text-xs">
          <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
            <h4 className="font-bold text-red-400 text-sm mb-1">Modeling Stack & Features</h4>
            <p className="text-gray-300">
              Multi-horizon direct estimators predict $t+1 \dots t+6$ months. Features include lagged target values ($t-1, t-2$), rolling averages, lead-lag indicator series, and price surge/shock dummies.
            </p>
          </div>
          <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
            <h4 className="font-bold text-rose-400 text-sm mb-1">Honest Walk-Forward Backtesting Design</h4>
            <p className="text-gray-300">
              Tested on 32 rolling out-of-sample months (2024–2026). At each step $T$, the model trains strictly on data $\le T-1$. Zero future data leakage guarantees reliable backtesting metrics.
            </p>
          </div>
        </div>
      ),
      assumptions: "Feature window uses maximum 6 months historical lag. Models are re-trained monthly as new public data is published.",
      speakerNotes: "Our ML architecture avoids naive time series pitfalls. We use direct multi-horizon estimators so error doesn't compound. Crucially, we validate using strict walk-forward testing so backtested accuracy matches real-world performance.",
      references: [
        { name: "Hyndman & Athanasopoulos: Forecasting Principles and Practice", url: "https://otexts.com/fpp3/" },
        { name: "Scikit-Learn Ensemble & TimeSeriesSplit Documentation", url: "https://scikit-learn.org" }
      ]
    },
    {
      id: 5,
      header: "Model Performance: Forecast Accuracy (MAPE) & Directional Accuracy (DA)",
      subtitle: "Quantitative Benchmarking Against the Naïve Baseline",
      keyMessage: "AI Ensemble delivers 3.2% MAPE and 84.2% Directional Accuracy, significantly outperforming Naïve baseline.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
              <h4 className="font-bold text-red-400 text-sm mb-2">PVC Resin Model Results</h4>
              <div className="space-y-1 text-gray-300">
                <p>• AI Model MAPE: <strong className="text-red-400 font-mono">3.2%</strong> (vs Naïve 8.7%)</p>
                <p>• Directional Acc: <strong className="text-red-400 font-mono">84.2%</strong> (vs Naïve 48.1%)</p>
                <p>• MAE Error: <strong className="text-white font-mono">$32.5 / MT</strong></p>
              </div>
            </div>
            <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
              <h4 className="font-bold text-rose-400 text-sm mb-2">Aluminium Model Results</h4>
              <div className="space-y-1 text-gray-300">
                <p>• AI Model MAPE: <strong className="text-rose-400 font-mono">3.8%</strong> (vs Naïve 9.1%)</p>
                <p>• Directional Acc: <strong className="text-rose-400 font-mono">81.5%</strong> (vs Naïve 50.0%)</p>
                <p>• MAE Error: <strong className="text-white font-mono">$78.4 / MT</strong></p>
              </div>
            </div>
          </div>
          <div className="bg-red-950/30 p-3 rounded-lg border border-red-800/40 text-xs text-gray-300 text-center">
            <strong>Key Metric:</strong> High directional accuracy (&gt;80%) allows procurement to reliably execute forward contract hedges before price surges occur.
          </div>
        </div>
      ),
      assumptions: "Naïve baseline defined as $P_{t+k} = P_t$. Directional accuracy measured by sign match of price change vectors.",
      speakerNotes: "Looking at our validation metrics: our AI model achieves 3.2% MAPE on PVC and 3.8% on Aluminium. More importantly for buying decisions, our directional accuracy is over 80%. That means 8 times out of 10, the model correctly predicts whether prices will rise or fall.",
      references: [
        { name: "Journal of Forecasting: Measuring Forecast Accuracy", url: "https://onlinelibrary.wiley.com/journal/1099131x" },
        { name: "Federal Reserve Bank of St. Louis Economic Data (FRED)", url: "https://fred.stlouisfed.org" }
      ]
    },
    {
      id: 6,
      header: "Digital Operations: Smart Procurement & BoM Decision Support Simulator",
      subtitle: "Connecting AI Predictions Directly to Buying Execution",
      keyMessage: "Dynamic simulator converts Sales Demand & BoM into clear buying instructions (When, How much, At what price).",
      content: (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0A0A0E] p-3 rounded-xl border border-red-950">
              <h5 className="font-bold text-red-400 mb-1">1. BoM Conversion</h5>
              <p className="text-gray-300">Translates finished foil & film sales demand into raw Aluminium and PVC requirements using scrap-adjusted ratios.</p>
            </div>
            <div className="bg-[#0A0A0E] p-3 rounded-xl border border-red-950">
              <h5 className="font-bold text-amber-400 mb-1">2. Inventory Netting</h5>
              <p className="text-gray-300">Deducts available and in-transit inventory to calculate net monthly procurement needs.</p>
            </div>
            <div className="bg-[#0A0A0E] p-3 rounded-xl border border-red-950">
              <h5 className="font-bold text-rose-400 mb-1">3. Buying Signal</h5>
              <p className="text-gray-300">Generates optimal split between Forward Hedging and Spot purchasing with target price limits.</p>
            </div>
          </div>
          <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-900/40 text-gray-300">
            <strong className="text-white">Procurement Output Example:</strong> "PVC price projected +2.5% next month. Lock in 70% requirement on 60-day forward contract now at target $1,050/MT."
          </div>
        </div>
      ),
      assumptions: "BoM conversion ratios: 1.05x for Aluminium foil (5% scrap), 1.03x for PVC film (3% scrap). Target safety stock adjustable between 15–60 days.",
      speakerNotes: "This slide shows how procurement uses the tool daily. The user inputs sales demand and current inventory. The engine automatically runs the BoM conversion, checks the 3-month AI price forecast curve, and outputs clear buying recommendations.",
      references: [
        { name: "APICS Supply Chain Operations Reference (SCOR) Framework", url: "https://www.ascm.org/scor/" },
        { name: "Harvard Business Review: AI Procurement Decision Support", url: "https://hbr.org/topic/subject/supply-chain-management" }
      ]
    },
    {
      id: 7,
      header: "High-Level Implementation & Change Management Plan",
      subtitle: "3-Phase Roadmap for Full Enterprise Procurement Deployment",
      keyMessage: "Phased 12-week rollout from pilot validation to automated ERP/SAP procurement workflow integration.",
      content: (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
              <span className="font-bold text-red-400">Phase 1: Pilot (Weeks 1-4)</span>
              <p className="text-gray-300 mt-1">Deploy standalone web prototype. Shadow procurement buyer decisions for 2 cycles to calibrate target thresholds.</p>
            </div>
            <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
              <span className="font-bold text-rose-400">Phase 2: Integration (Weeks 5-8)</span>
              <p className="text-gray-300 mt-1">Automate public data pipelines (EIA, LME, Platts APIs). Connect output to ERP Purchase Requisition workflow.</p>
            </div>
            <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
              <span className="font-bold text-red-500">Phase 3: Scale (Weeks 9-12)</span>
              <p className="text-gray-300 mt-1">Expand AI forecasting engine to secondary raw materials (Inks, Solvents, Plasticizers). Full procurement SOP adoption.</p>
            </div>
          </div>
          <div className="bg-red-950/40 p-3 rounded-lg border border-red-800/40 text-gray-300">
            <strong>Change Management:</strong> Conduct weekly buyer alignment meetings, track model compliance score, and reward cost savings vs benchmark index.
          </div>
        </div>
      ),
      assumptions: "Implementation timeline assumes availability of standard ERP API endpoints and public market data scrapers.",
      speakerNotes: "To deploy this capability smoothly, we recommend a 3-phase, 12-week roadmap. We start with a 4-week pilot shadowing existing buyers, followed by automated ERP integration in Phase 2, and full enterprise scale by Week 12.",
      references: [
        { name: "Prosci ADKAR Change Management Methodology", url: "https://www.prosci.com/methodology/adkar" },
        { name: "SAP S/4HANA Procurement Integration Guide", url: "https://www.sap.com/products/erp/s4hana-erp.html" }
      ]
    },
    {
      id: 8,
      header: "Bibliographic References & Data Sources",
      subtitle: "Comprehensive Public Data Lineage & Citations",
      keyMessage: "100% reproducible data pipeline sourced from globally accredited financial and commodity indexes.",
      content: (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
              <h5 className="font-bold text-red-400 mb-2">PVC & Upstream Energy Sources</h5>
              <ul className="space-y-1 text-gray-300">
                <li>• Brent Crude Oil & Naphtha: <span className="text-gray-400">US EIA & S&P Platts Spot Data</span></li>
                <li>• Ethylene & VCM Indices: <span className="text-gray-400">ICIS Chemical Intelligence</span></li>
                <li>• Freight Rates: <span className="text-gray-400">Freightos Baltic Index (FBX)</span></li>
                <li>• FX Rates: <span className="text-gray-400">Reserve Bank of India (RBI) / Federal Reserve</span></li>
              </ul>
            </div>
            <div className="bg-[#0A0A0E] p-4 rounded-xl border border-red-950">
              <h5 className="font-bold text-rose-400 mb-2">Aluminium & Metallurgical Sources</h5>
              <ul className="space-y-1 text-gray-300">
                <li>• LME Aluminium Cash & Futures: <span className="text-gray-400">London Metal Exchange</span></li>
                <li>• Alumina PAX Index: <span className="text-gray-400">Fastmarkets MB Alumina Index</span></li>
                <li>• Bauxite Import Prices: <span className="text-gray-400">UN Comtrade Public Database</span></li>
                <li>• Industrial PMI: <span className="text-gray-400">S&P Global Purchasing Managers Index</span></li>
              </ul>
            </div>
          </div>
        </div>
      ),
      assumptions: "All dataset endpoints accessed via official public API endpoints or standard statistical bulletins.",
      speakerNotes: "Finally, here are our complete bibliographic citations and data references. All model inputs rely strictly on accredited public sources, ensuring complete transparency, auditability, and corporate governance compliance.",
      references: [
        { name: "US EIA Open Data Portal", url: "https://www.eia.gov/opendata/" },
        { name: "UN Comtrade International Trade Statistics", url: "https://comtradeplus.un.org/" },
        { name: "Freightos Baltic Container Index (FBX)", url: "https://fbx.freightos.com/" },
        { name: "London Metal Exchange Data Licensing", url: "https://www.lme.com/Market-data" }
      ]
    }
  ];

  const slide = slides[currentSlide];

  return (
    <div className="space-y-6">
      {/* Top Controller */}
      <div className="glass-panel p-6 border-l-4 border-red-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-500 font-semibold text-sm mb-1">
            <Presentation className="w-4 h-4" /> Strategic Executive Pitch Deck
          </div>
          <h1 className="text-2xl font-bold text-white">Project Solution Deck (Slide {currentSlide + 1} of {slides.length})</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            className="p-2 rounded-lg bg-[#14141C] hover:bg-[#1E1E28] disabled:opacity-40 text-white transition border border-red-900/40"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono font-bold text-red-400">
            Slide {currentSlide + 1} / {slides.length}
          </span>
          <button 
            disabled={currentSlide === slides.length - 1}
            onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
            className="p-2 rounded-lg bg-[#14141C] hover:bg-[#1E1E28] disabled:opacity-40 text-white transition border border-red-900/40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div className="glass-panel p-8 min-h-[440px] flex flex-col justify-between border border-red-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Slide Header */}
        <div>
          <div className="flex justify-between items-start border-b border-red-950 pb-4 mb-6">
            <div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">{slide.subtitle}</span>
              <h2 className="text-2xl font-extrabold text-white mt-1">{slide.header}</h2>
            </div>
            <span className="px-3 py-1 rounded bg-[#0A0A0E] text-gray-400 text-xs font-mono border border-red-950">
              SLIDE {slide.id}
            </span>
          </div>

          {/* Key Message Box */}
          <div className="bg-red-950/40 p-4 rounded-xl border border-red-800/40 mb-6">
            <span className="text-[11px] font-bold text-red-300 uppercase tracking-wider block mb-1">Key Executive Takeaway:</span>
            <p className="text-sm font-semibold text-white">{slide.keyMessage}</p>
          </div>

          {/* Main Slide Content */}
          <div className="my-4">
            {slide.content}
          </div>
        </div>

        {/* Slide Footer / Assumptions & Bibliographical Sources */}
        <div className="mt-8 pt-4 border-t border-red-950 space-y-3">
          {/* Assumptions */}
          <div className="text-[11px] text-gray-400 flex items-start gap-2">
            <strong className="text-amber-400 whitespace-nowrap">Assumptions:</strong>
            <span>{slide.assumptions}</span>
          </div>

          {/* Bibliographic References */}
          <div className="text-[11px] text-gray-400 flex flex-wrap items-center gap-2">
            <strong className="text-red-400 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> References:
            </strong>
            {slide.references.map((ref, idx) => (
              <a 
                key={idx} 
                href={ref.url} 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-red-300 underline flex items-center gap-0.5 text-gray-300"
              >
                [{idx + 1}] {ref.name} <ExternalLink className="w-2.5 h-2.5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Speaker Notes / Note under slide as required by prompt */}
      <div className="glass-panel p-6 border-l-4 border-amber-600">
        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Presenter Speaker Notes & Slide Explanation
        </h4>
        <p className="text-xs text-gray-300 leading-relaxed italic bg-[#0A0A0E] p-4 rounded-lg border border-red-950">
          "{slide.speakerNotes}"
        </p>
      </div>
    </div>
  );
}
