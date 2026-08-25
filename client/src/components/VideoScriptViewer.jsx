import React, { useState, useEffect } from 'react';
import { Video, Play, Pause, Clock, Film, Sparkles, Flame } from 'lucide-react';

export default function VideoScriptViewer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const scriptSteps = [
    {
      time: "0:00 - 0:20",
      title: "Hook & Problem Statement",
      speaker: "Presenter",
      visual: "Show Executive Dashboard with current manual procurement gaps highlighted.",
      transcript: "Raw materials represent over 60% of total operating spend for Films & Foils. Today, procurement decisions suffer from low-accuracy manual forecasts, gut-feel purchasing, and zero forward visibility into upstream commodity prices. This leads to higher spend, inflated inventory, and locked working capital.",
      callout: "Highlight $1.85M potential spend reduction"
    },
    {
      time: "0:20 - 0:45",
      title: "External Indicators & Lead-Lag Causality",
      speaker: "Presenter",
      visual: "Transition to Correlation Heatmap & Lag Slider (Ethylene/VCM leading PVC, Alumina leading Aluminium).",
      transcript: "To solve this, we mapped external market indicators that drive raw material prices. For PVC Resin, upstream Ethylene and VCM prices act as early-warning indicators 30 to 60 days ahead. For Aluminium, Alumina PAX and European energy indices lead LME price moves by 60 days.",
      callout: "Show 60-day early warning lead time"
    },
    {
      time: "0:45 - 1:15",
      title: "AI Forecasting & Out-of-Sample Walk-Forward Backtest",
      speaker: "Presenter",
      visual: "Display Backtest Suite: AI Forecast vs Actuals vs Naïve Baseline curves.",
      transcript: "Using a Gradient Boosted ML ensemble with strict out-of-sample walk-forward validation over 32 rolling months, our model achieved 3.2% MAPE on PVC and 3.8% on Aluminium—outperforming the naïve baseline by over 5%. Crucially, our directional accuracy exceeds 84%, correctly calling up/down market swings 8 times out of 10.",
      callout: "Emphasize 84.2% Directional Accuracy & 3.2% MAPE"
    },
    {
      time: "1:15 - 1:40",
      title: "Digital Operations & Smart BoM Procurement Simulator",
      speaker: "Presenter",
      visual: "Demo Procurement Simulator: adjust finished product demand & show instant buying decision.",
      transcript: "Here in our Digital Operations Simulator, procurement inputs sales demand. The system calculates exact scrap-adjusted raw material needs via Bill of Materials, deducts current stock, and generates immediate buying instructions: 'Lock in 70% requirement on 60-day forward contract at target $1,050/MT before price surge hits.'",
      callout: "Demonstrate Spot vs Forward Contract recommendation"
    },
    {
      time: "1:40 - 2:00",
      title: "Business Impact & Rollout Plan",
      speaker: "Presenter",
      visual: "Show 3-Phase Implementation Roadmap & Financial Savings Summary.",
      transcript: "In summary, our AI price prediction engine cuts raw material spend by up to 5%, reduces inventory holding by 14 days, and frees up working capital. We can deploy this system in 12 weeks through a phased ERP rollout. Thank you!",
      callout: "Conclude with 12-week deployment timeline"
    }
  ];

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStep(prev => (prev + 1) % scriptSteps.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 border-l-4 border-red-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-500 font-semibold text-sm mb-1">
            <Video className="w-4 h-4" /> Video Pitch Script & Presentation Mode
          </div>
          <h1 className="text-2xl font-bold text-white">1–3 Minute Presentation Walkthrough Guide</h1>
          <p className="text-gray-400 text-sm mt-1">
            Timestamped narration transcript, visual cues, and presenter cues for recording the 2-minute video presentation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 transition ${
              isPlaying 
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                : 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
            }`}
          >
            {isPlaying ? <><Pause className="w-4 h-4" /> Pause Teleprompter</> : <><Play className="w-4 h-4" /> Start Auto-Prompter</>}
          </button>
        </div>
      </div>

      {/* Script Steps List */}
      <div className="space-y-4">
        {scriptSteps.map((step, idx) => {
          const isActive = idx === activeStep;

          return (
            <div 
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`glass-panel p-5 transition cursor-pointer border ${
                isActive 
                  ? 'border-red-600 bg-red-950/30 shadow-lg shadow-red-600/20' 
                  : 'border-red-950/60 hover:border-red-800 opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#0A0A0E] text-red-400 font-mono text-xs font-bold border border-red-950 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {step.time}
                  </span>
                  <h3 className="text-base font-bold text-white">{step.title}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-red-950 text-red-300 border border-red-800/40 flex items-center gap-1">
                  <Film className="w-3 h-3" /> Visual Cue: {step.visual.split(':')[0]}
                </span>
              </div>

              {/* Visual On-Screen Prompt */}
              <div className="bg-[#0A0A0E] p-2.5 rounded-lg border border-red-950 mb-3 text-xs text-gray-400">
                <strong className="text-red-400">On-Screen Action:</strong> {step.visual}
              </div>

              {/* Transcript */}
              <div className="bg-black p-4 rounded-xl border border-red-950">
                <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Voiceover Script:</span>
                <p className="text-sm text-gray-200 leading-relaxed font-sans">
                  "{step.transcript}"
                </p>
              </div>

              {/* Presenter Callout */}
              <div className="mt-3 flex justify-between items-center text-xs text-red-400 font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Key Pitch Point: {step.callout}
                </span>
                {isActive && (
                  <span className="text-red-500 font-bold animate-pulse text-[11px]">
                    ● Active Teleprompter Segment
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
