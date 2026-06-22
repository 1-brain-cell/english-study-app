import React, { useState, useEffect } from 'react';
import { 
  getWeeklyHours, 
  getProgress, 
  updateMilestone, 
  overridePhase, 
  addStudyLog, 
  exportData, 
  importData, 
  resetAllData,
  getStudyLogs
} from '../data/db';
import { 
  Flame, 
  TrendingUp, 
  BookOpen, 
  Tv, 
  Award, 
  Plus, 
  Download, 
  Upload, 
  RefreshCw, 
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function Dashboard({ onActivityLogged }) {
  const [progress, setProgress] = useState(getProgress());
  const [weeklyHours, setWeeklyHours] = useState(getWeeklyHours());
  const [logs, setLogs] = useState(getStudyLogs());
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  
  // Log study state
  const [logMinutes, setLogMinutes] = useState('');
  const [logDesc, setLogDesc] = useState('');
  const [logFocus, setLogFocus] = useState('vocab');
  
  // Import/export state
  const [importText, setImportText] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importStatus, setImportStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    // Refresh stats when component mounts
    refreshStats();
  }, []);

  const refreshStats = () => {
    setProgress(getProgress());
    setWeeklyHours(getWeeklyHours());
    setLogs(getStudyLogs().slice(-5).reverse()); // show last 5 logs
  };

  const handleMilestoneChange = (milestoneId, checked) => {
    const updated = updateMilestone(milestoneId, checked);
    setProgress(updated);
    if (onActivityLogged) onActivityLogged();
  };

  const handlePhaseOverride = (phaseNum) => {
    const updated = overridePhase(phaseNum);
    setProgress(updated);
  };

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!logMinutes || isNaN(logMinutes) || parseInt(logMinutes) <= 0) {
      alert('Please enter a valid number of minutes');
      return;
    }
    if (!logDesc.trim()) {
      alert('Please enter a brief description of what you studied');
      return;
    }

    addStudyLog(parseInt(logMinutes), logDesc, logFocus);
    setLogMinutes('');
    setLogDesc('');
    setIsLogModalOpen(false);
    refreshStats();
    
    if (onActivityLogged) onActivityLogged();
  };

  const handleExport = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `english_study_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    e.preventDefault();
    if (!importText.trim()) {
      setImportStatus({ type: 'error', message: 'Backup JSON text cannot be empty' });
      return;
    }
    const success = importData(importText);
    if (success) {
      setImportStatus({ type: 'success', message: 'Data imported successfully! Reloading stats...' });
      setImportText('');
      setTimeout(() => {
        setIsImportOpen(false);
        setImportStatus({ type: '', message: '' });
        refreshStats();
        if (onActivityLogged) onActivityLogged();
      }, 1500);
    } else {
      setImportStatus({ type: 'error', message: 'Failed to import. Check format correctness.' });
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const success = importData(text);
      if (success) {
        setImportStatus({ type: 'success', message: 'Data imported from file successfully!' });
        setTimeout(() => {
          setImportStatus({ type: '', message: '' });
          refreshStats();
          if (onActivityLogged) onActivityLogged();
        }, 1500);
      } else {
        setImportStatus({ type: 'error', message: 'Invalid backup file structure' });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to RESET all data back to original seeds? All your progress, logs, and custom cards will be permanently deleted.')) {
      resetAllData();
      refreshStats();
      if (onActivityLogged) onActivityLogged();
    }
  };

  // Calculating Phase Info
  const phaseDetails = {
    1: { title: "Phase 1: Business Foundations", desc: "Grammar: Conditionals, modals (shall/must/may), relative clauses, passive. Vocab: Business & Finance focus." },
    2: { title: "Phase 2: Contract & Legal English", desc: "Grammar/Structure: Contract anatomy, legal connectors, word pairs. Focus: Clause analysis, drafting." },
    3: { title: "Phase 3: AI & Tech English", desc: "Vocab: ML/AI, Software, Data domains. Study: Tech SaaS agreements, SLAs, DPA analysis." }
  };

  const currentPhaseInfo = phaseDetails[progress.phase] || phaseDetails[1];

  // Focused / Immersion split percentages
  const focusedPercent = Math.min(100, (weeklyHours.focused / weeklyHours.focusedTarget) * 100);
  const immersionPercent = Math.min(100, (weeklyHours.immersion / weeklyHours.immersionTarget) * 100);

  return (
    <div className="space-y-6">
      
      {/* Upper Grid - Streak, Phase, Weekly split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Streak & Status Card */}
        <div className="glass rounded-2xl p-6 flex flex-col justify-between border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 font-medium text-sm tracking-wider uppercase">Active Streak</h3>
            <Flame className={`h-6 w-6 ${progress.streak > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-600'}`} />
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-white tracking-tight">{progress.streak}</span>
              <span className="text-slate-400 font-semibold">Days</span>
            </div>
            <p className="text-slate-400 text-xs mt-2">
              {progress.streak > 0 
                ? "Keep it up! Log study time or SRS reviews daily to maintain your streak." 
                : "No study activity logged today. Review vocab cards or log gaming sessions to start a streak!"
              }
            </p>
          </div>
          <button 
            onClick={() => setIsLogModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-semibold py-2.5 px-4 rounded-xl transition duration-300 shadow-md shadow-accent-950/50"
          >
            <Plus className="h-4 w-4" /> Log Study Session
          </button>
        </div>

        {/* Phase Overrider Card */}
        <div className="glass rounded-2xl p-6 flex flex-col justify-between border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 font-medium text-sm tracking-wider uppercase">Curriculum Tracker</h3>
            <Layers className="h-5 w-5 text-accent-400" />
          </div>
          <div className="my-4">
            <h4 className="text-lg font-bold text-white leading-tight">{currentPhaseInfo.title}</h4>
            <p className="text-slate-400 text-xs mt-2 line-clamp-3">
              {currentPhaseInfo.desc}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs mr-auto font-medium">Switch phase:</span>
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => handlePhaseOverride(num)}
                className={`h-8 w-8 text-xs font-bold rounded-lg transition duration-200 ${
                  progress.phase === num
                    ? 'bg-accent-500 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                P{num}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly split card */}
        <div className="glass rounded-2xl p-6 flex flex-col justify-between border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 font-medium text-sm tracking-wider uppercase">Weekly Hours (Mon-Sun)</h3>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          
          <div className="my-4 space-y-4">
            {/* Focused Time Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <BookOpen className="h-3.5 w-3.5 text-accent-400" /> Focused Study
                </span>
                <span className="text-slate-400">
                  {weeklyHours.focused}h <span className="text-slate-600">/ {weeklyHours.focusedTarget}h</span>
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-accent-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${focusedPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Immersion Time Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Tv className="h-3.5 w-3.5 text-sky-400" /> Immersion Input
                </span>
                <span className="text-slate-400">
                  {weeklyHours.immersion}h <span className="text-slate-600">/ {weeklyHours.immersionTarget}h</span>
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-sky-400 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${immersionPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center italic">
            Target: 6–7h Focused + 4–5h Immersion weekly split
          </div>
        </div>

      </div>

      {/* Main Grid - Milestones & Recent logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Milestone Checklists */}
        <div className="glass rounded-2xl p-6 border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-accent-400" /> Phase Study Milestones
            </h3>
            
            <div className="space-y-4">
              {/* Milestone 1 */}
              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-900/40 cursor-pointer transition duration-150">
                <input 
                  type="checkbox"
                  checked={progress.milestones.phase1}
                  onChange={(e) => handleMilestoneChange('phase1', e.target.checked)}
                  className="mt-1 h-5.5 w-5.5 rounded border-slate-700 bg-slate-950 text-accent-500 focus:ring-accent-500 cursor-pointer"
                />
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Phase 1 Milestone (End of Month 2)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Read business or AI news articles with 80% comprehension without opening a dictionary.</p>
                </div>
              </label>

              {/* Milestone 2 */}
              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-900/40 cursor-pointer transition duration-150">
                <input 
                  type="checkbox"
                  checked={progress.milestones.phase2}
                  onChange={(e) => handleMilestoneChange('phase2', e.target.checked)}
                  className="mt-1 h-5.5 w-5.5 rounded border-slate-700 bg-slate-950 text-accent-500 focus:ring-accent-500 cursor-pointer"
                />
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Phase 2 Milestone (End of Month 4)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Draft a simple confidentiality agreement (NDA) or contract clause completely unaided.</p>
                </div>
              </label>

              {/* Milestone 3 */}
              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-900/40 cursor-pointer transition duration-150">
                <input 
                  type="checkbox"
                  checked={progress.milestones.phase3}
                  onChange={(e) => handleMilestoneChange('phase3', e.target.checked)}
                  className="mt-1 h-5.5 w-5.5 rounded border-slate-700 bg-slate-950 text-accent-500 focus:ring-accent-500 cursor-pointer"
                />
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Phase 3 Milestone (End of Month 6)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Read a complex SaaS/AI DPA agreement, point out risk items, and negotiate amendments.</p>
                </div>
              </label>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-900 text-xs text-slate-400 flex items-center justify-between">
            <span>Started: {progress.startDate}</span>
            <span>Check items as they are achieved</span>
          </div>
        </div>

        {/* Recent Study Activity Logs */}
        <div className="glass rounded-2xl p-6 border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent-400" /> Recent Study Logs
            </h3>
            
            {logs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No logs recorded yet. Start logging focused sessions above.
              </div>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{log.description}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                          log.focusArea === 'vocab' ? 'bg-accent-950 text-accent-400 border border-accent-900' :
                          log.focusArea === 'legal' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                          log.focusArea === 'writing' ? 'bg-sky-950 text-sky-400 border border-sky-900' :
                          'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}>
                          {log.focusArea}
                        </span>
                      </div>
                      <span className="text-slate-500 mt-1 block">{log.date}</span>
                    </div>
                    <span className="text-slate-300 font-extrabold text-sm">{log.minutes} min</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="text-right text-[11px] text-slate-500 italic mt-3 pt-3 border-t border-slate-900">
            Log records keep your study streaks alive
          </div>
        </div>

      </div>

      {/* Backup and restore panel */}
      <div className="glass rounded-2xl p-6 border-slate-800">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Upload className="h-4.5 w-4.5 text-accent-400" /> Storage Management & Backups
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          All data is stored purely in your local browser storage. Use these tools to back up your progress as a JSON file or restore a previous backup.
        </p>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold py-2 px-4 rounded-xl transition duration-200"
          >
            <Download className="h-3.5 w-3.5 text-accent-400" /> Export JSON Backup
          </button>
          
          <button
            onClick={() => setIsImportOpen(!isImportOpen)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold py-2 px-4 rounded-xl transition duration-200"
          >
            <Upload className="h-3.5 w-3.5 text-accent-400" /> Import JSON Backup
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-900/60 text-xs font-semibold py-2 px-4 rounded-xl transition duration-200 ml-auto"
          >
            <RefreshCw className="h-3.5 w-3.5 text-rose-400" /> Reset Database
          </button>
        </div>

        {isImportOpen && (
          <form onSubmit={handleImport} className="mt-4 p-4 border border-slate-900 bg-slate-950/40 rounded-xl space-y-3">
            <h4 className="text-xs font-semibold text-white">Paste JSON data or upload a file:</h4>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-slate-300 hover:file:bg-slate-800"
              />
              <span className="text-slate-500 text-xs text-center self-center">OR</span>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste backup JSON string here..."
                rows="3"
                className="w-full text-xs bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-accent-500"
              />
            </div>

            <div className="flex items-center justify-between">
              {importStatus.message && (
                <div className={`text-xs flex items-center gap-1.5 ${importStatus.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <AlertTriangle className="h-3.5 w-3.5" /> {importStatus.message}
                </div>
              )}
              <button
                type="submit"
                className="bg-accent-600 hover:bg-accent-500 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition duration-150 ml-auto"
              >
                Upload & Restore
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Log study session modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass w-full max-w-md rounded-2xl p-6 border-slate-800 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Log Focused Study</h3>
            
            <form onSubmit={handleAddLog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Time Spent (Minutes)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={logMinutes}
                  onChange={(e) => setLogMinutes(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-accent-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Focus Area</label>
                <select
                  value={logFocus}
                  onChange={(e) => setLogFocus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-accent-500"
                >
                  <option value="vocab">Vocabulary Study (SRS)</option>
                  <option value="grammar">Grammar & Syntax Rules</option>
                  <option value="writing">Writing Practice / Essays</option>
                  <option value="legal">Contract / Clause Analysis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Study Description</label>
                <input
                  type="text"
                  required
                  value={logDesc}
                  onChange={(e) => setLogDesc(e.target.value)}
                  placeholder="e.g. Read HBR article on data engineering"
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-accent-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold py-2.5 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent-600 hover:bg-accent-500 text-white font-semibold py-2.5 rounded-xl text-sm transition"
                >
                  Log Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
