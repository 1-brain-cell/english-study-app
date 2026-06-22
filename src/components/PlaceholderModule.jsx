import React from 'react';
import { Layers, Wrench, Calendar, BookOpen, AlertTriangle } from 'lucide-react';

export default function PlaceholderModule({ name, stepNumber, description }) {
  const steps = [
    "Scaffold Vite + React + Tailwind + Local Storage Layer (Current)",
    "Vocabulary SRS + Dashboard Core (Current)",
    "Quiz Engine (Step 5)",
    "Grammar & Reference + Clause Library (Step 6)",
    "Writing Practice + Self-Rubric (Step 7)",
    "Immersion Logger + VTuber Accent Compare (Step 8)",
    "Study Planner + Progress Aggregator (Step 9)",
    "Mobile Responsiveness, Streak Logic, Progress Charts Polish (Step 10)"
  ];

  return (
    <div className="glass rounded-2xl p-8 border-slate-800 text-center max-w-xl mx-auto space-y-6 my-6 animate-fade-in">
      <div className="mx-auto h-16 w-16 bg-accent-950/40 border border-accent-900/60 rounded-2xl flex items-center justify-center text-accent-400">
        <Wrench className="h-8 w-8 text-accent-400" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-extrabold text-white tracking-tight">{name}</h3>
        <span className="inline-block bg-slate-900 text-slate-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-slate-850">
          Scaffolded - Coming in Build Sequence Step {stepNumber}
        </span>
        <p className="text-slate-400 text-sm mt-3 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pt-6 border-t border-slate-900 text-left">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-accent-400" /> Implementation Blueprint
        </h4>
        <div className="space-y-2 text-xs">
          {steps.map((step, idx) => {
            const stepId = idx + 1;
            const isCurrent = stepId === 1 || stepId === 2 || (name === "Quiz Engine" && stepId === 3) || 
                              ((name === "Clause Library" || name === "Grammar Reference") && stepId === 4) ||
                              (name === "Writing Practice" && stepId === 5) || 
                              (name === "Immersion Logger" && stepId === 6) ||
                              (name === "Study Planner" && stepId === 7);
            
            return (
              <div 
                key={idx} 
                className={`flex items-center gap-2.5 p-2 rounded-lg border transition ${
                  stepId === stepNumber 
                    ? 'bg-accent-950/20 border-accent-900 text-accent-300 font-semibold' 
                    : stepId < stepNumber 
                      ? 'bg-slate-950/30 border-slate-900 text-slate-500' 
                      : 'bg-slate-950/10 border-transparent text-slate-600'
                }`}
              >
                <div className={`h-2.5 w-2.5 rounded-full ${
                  stepId === stepNumber 
                    ? 'bg-accent-400 animate-pulse' 
                    : stepId < stepNumber 
                      ? 'bg-emerald-600' 
                      : 'bg-slate-800'
                }`} />
                <span>{step}</span>
                {stepId === stepNumber && <span className="ml-auto text-[9px] bg-accent-900 text-accent-200 px-1.5 py-0.5 rounded font-bold uppercase">Active Next</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
