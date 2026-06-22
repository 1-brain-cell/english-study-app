import React, { useState, useEffect } from 'react';
import { 
  addStudyLog, 
  addImmersionLog, 
  getWeeklyHours,
  getStudyLogs,
  getImmersionLogs
} from '../data/db';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Coffee, 
  BookOpen, 
  Tv, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function Planner({ onActivityLogged }) {
  // Mode: 'weekday' | 'weekend'
  const [scheduleMode, setScheduleMode] = useState('weekday');
  const [weeklyHours, setWeeklyHours] = useState(getWeeklyHours());
  
  // Track checklist completion state for today (cached in local state)
  const [completedItems, setCompletedItems] = useState({});

  useEffect(() => {
    setWeeklyHours(getWeeklyHours());
    
    // Load today's planner checkbox states from localStorage to survive reloads
    const todayStr = new Date().toISOString().split('T')[0];
    const cached = localStorage.getItem(`eng_study_planner_${todayStr}`);
    if (cached) {
      setCompletedItems(JSON.parse(cached));
    } else {
      setCompletedItems({});
    }
  }, []);

  const weekdayActivities = [
    {
      id: 'wd-morning',
      time: 'Morning (45 mins)',
      title: 'Focused Study block',
      description: 'Read one HBR / Economist business article or legal clause. Record at least 10 vocabulary words to SRS deck.',
      duration: 45,
      type: 'focused',
      focusArea: 'vocab'
    },
    {
      id: 'wd-lunch',
      time: 'Lunch Break (20 mins)',
      title: 'Reddit Casual Reading',
      description: 'Browse comments on r/Genshin_Impact, r/IdentityV, or r/VirtualYoutubers in English. Focus on learning everyday slang and conversational syntax.',
      duration: 20,
      type: 'immersion',
      sourceId: 'im-vt-reddit'
    },
    {
      id: 'wd-evening',
      time: 'Evening (Gaming / Lore)',
      title: 'Gaming Immersion',
      description: 'Play Genshin Impact (read quest dialogues) or Identity V in English. Read strategy wikis in English. Do not translate terms to Thai in your head.',
      duration: 60,
      type: 'immersion',
      sourceId: 'im-genshin'
    },
    {
      id: 'wd-bedtime',
      time: 'Before Bed (30 mins)',
      title: 'VTuber Listening ear training',
      description: 'Watch a Twitch stream or YouTube highlight clip of Niyeko or Azeru. Focus on absorbing accents without transcribing or taking detailed notes.',
      duration: 30,
      type: 'immersion',
      sourceId: 'im-niyeko'
    }
  ];

  const weekendActivities = [
    {
      id: 'we-focused',
      time: 'Intensive block (2–3 hrs)',
      title: 'Advanced Focused Practice',
      description: 'Perform deep focused study: draft a service agreement / NDA clause, compile business proposal summaries, or take comprehensive grammar notes.',
      duration: 120,
      type: 'focused',
      focusArea: 'legal'
    },
    {
      id: 'we-immersion',
      time: 'Rest hours (Continuous)',
      title: 'Full Stream Immersion',
      description: 'Watch long VCT casts in English or complete VTuber gaming streams. Browse esports subreddits to review comments and fan reactions.',
      duration: 180,
      type: 'immersion',
      sourceId: 'im-vct'
    }
  ];

  const activeActivities = scheduleMode === 'weekday' ? weekdayActivities : weekendActivities;

  const handleToggleActivity = (act, checked) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newCompleted = {
      ...completedItems,
      [act.id]: checked
    };
    
    setCompletedItems(newCompleted);
    localStorage.setItem(`eng_study_planner_${todayStr}`, JSON.stringify(newCompleted));

    if (checked) {
      // Auto-log activity minutes to feed dashboard progress
      if (act.type === 'focused') {
        addStudyLog(act.duration, `Planner task: ${act.title}`, act.focusArea);
      } else {
        addImmersionLog(act.sourceId, act.duration, []);
      }
      
      // Update local hours state immediately
      setWeeklyHours(getWeeklyHours());
      if (onActivityLogged) onActivityLogged();
      
      alert(`Completed! Auto-logged ${act.duration} minutes of ${act.type} time.`);
    }
  };

  const focusedPercent = Math.min(100, (weeklyHours.focused / weeklyHours.focusedTarget) * 100);
  const immersionPercent = Math.min(100, (weeklyHours.immersion / weeklyHours.immersionTarget) * 100);

  return (
    <div className="space-y-6">
      
      {/* Configuration Header */}
      <div className="glass rounded-2xl p-4 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 mr-auto">
          <div className="p-3 bg-accent-950/50 border border-accent-900 rounded-xl text-accent-400">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-white leading-tight">Interactive Study Planner</h3>
            <p className="text-slate-400 text-xs mt-1">Check off templates to automatically log focus/immersion minutes</p>
          </div>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex bg-slate-950 border border-slate-900 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setScheduleMode('weekday')}
            className={`py-1.5 px-4 text-xs font-bold rounded-lg transition cursor-pointer ${
              scheduleMode === 'weekday'
                ? 'bg-accent-600/15 text-accent-300 border border-accent-950/20'
                : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            Weekdays
          </button>
          <button
            onClick={() => setScheduleMode('weekend')}
            className={`py-1.5 px-4 text-xs font-bold rounded-lg transition cursor-pointer ${
              scheduleMode === 'weekend'
                ? 'bg-accent-600/15 text-accent-300 border border-accent-950/20'
                : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            Weekends
          </button>
        </div>
      </div>

      {/* Main Grid: Checklist vs split dashboard summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Planner checklist items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-2xl p-5 border-slate-800 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold text-white capitalize">{scheduleMode} Study Schedule</h3>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tick item to auto-log minutes</span>
            </div>

            <div className="space-y-3.5">
              {activeActivities.map((act) => {
                const isCompleted = completedItems[act.id] || false;
                return (
                  <div 
                    key={act.id} 
                    className={`p-4 rounded-2xl border transition duration-200 flex items-start gap-4 ${
                      isCompleted
                        ? 'bg-slate-950/30 border-slate-900 opacity-75'
                        : 'bg-slate-900/10 border-slate-900 hover:border-slate-850 hover:bg-slate-900/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={(e) => handleToggleActivity(act, e.target.checked)}
                      className="mt-1 h-5.5 w-5.5 rounded border-slate-700 bg-slate-950 text-accent-500 focus:ring-accent-500 cursor-pointer"
                    />

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h4 className={`text-sm font-extrabold ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                          {act.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {act.time}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-400 leading-normal">{act.description}</p>
                      
                      <div className="pt-2 flex items-center justify-between">
                        <span className={`text-[9.5px] px-2 py-0.5 rounded font-bold uppercase tracking-wide border ${
                          act.type === 'focused'
                            ? 'bg-accent-950 text-accent-400 border-accent-900'
                            : 'bg-sky-950 text-sky-400 border-sky-900'
                        }`}>
                          {act.type} block
                        </span>
                        
                        <span className="text-[10px] text-slate-500">
                          {act.duration} minutes logged
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right side weekly progress & immersion constraints */}
        <div className="space-y-4">
          
          {/* Weekly progress dashboard */}
          <div className="glass rounded-2xl p-5 border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Weekly Hour Progress
            </h4>

            <div className="space-y-4">
              {/* Focused */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-accent-400" /> Focused Study
                  </span>
                  <span className="text-slate-400">
                    {weeklyHours.focused}h <span className="text-slate-650">/ {weeklyHours.focusedTarget}h</span>
                  </span>
                </div>
                <div className="w-full bg-slate-950 border border-slate-900 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-accent-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${focusedPercent}%` }}
                  />
                </div>
              </div>

              {/* Immersion */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Tv className="h-3.5 w-3.5 text-sky-400" /> Immersion Input
                  </span>
                  <span className="text-slate-400">
                    {weeklyHours.immersion}h <span className="text-slate-650">/ {weeklyHours.immersionTarget}h</span>
                  </span>
                </div>
                <div className="w-full bg-slate-950 border border-slate-900 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-sky-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${immersionPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 leading-normal italic text-center pt-2">
              Goal: Maintain a 60% Focused (6-7 hrs) and 40% Immersion (4-5 hrs) weekly balance split.
            </div>
          </div>

          {/* Hard study constraints */}
          <div className="glass rounded-2xl p-5 border-slate-800 space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500" /> Immersion Constraints
            </h4>
            
            <div className="space-y-3 text-[11px] leading-relaxed">
              <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
                <span className="font-bold text-amber-400">1. No translation:</span>
                <p className="text-slate-400">Never translate English back to Thai while playing games or watching VTuber clips. Let context and visual actions construct target associations directly.</p>
              </div>

              <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
                <span className="font-bold text-sky-450">2. Slang guideline:</span>
                <p className="text-slate-400">Only log slang and colloquial phrases in SRS after seeing them in the wild at least 3 times. Avoid memorizing low-frequency one-off terms.</p>
              </div>

              <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
                <span className="font-bold text-emerald-450">3. Active output:</span>
                <p className="text-slate-400">Produce output. Type in-game comms in English or write comments on game/VTuber subreddits in English. Do not just process passive inputs.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
