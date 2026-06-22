import React, { useState, useEffect } from 'react';
import { 
  getStaticRubrics, 
  getStaticErrors, 
  getExternalLinks, 
  addWritingLog,
  getWritingLogs
} from '../data/db';
import { 
  Edit3, 
  BookOpen, 
  CheckSquare, 
  History, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileText,
  Bookmark
} from 'lucide-react';

export default function Writing({ onActivityLogged }) {
  const rubrics = getStaticRubrics();
  const errors = getStaticErrors();
  const extLinks = getExternalLinks();
  
  // Writing mode state
  const [activePromptId, setActivePromptId] = useState('summary');
  const [draftText, setDraftText] = useState('');
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  
  // Rubric checklist answers (item.id -> boolean)
  const [rubricAnswers, setRubricAnswers] = useState({});
  const [openErrorCategory, setOpenErrorCategory] = useState(null);

  useEffect(() => {
    setHistoryLogs(getWritingLogs().slice(-5).reverse());
  }, []);

  const prompts = [
    { 
      id: 'summary', 
      title: 'HBR Article Summary (100-Word)', 
      desc: 'Read a business or AI-tech article (e.g. from Harvard Business Review). Write a concise summary capturing the core premise and deliverables within approximately 100 words. Force yourself to use formal registers.' 
    },
    { 
      id: 'email', 
      title: 'Formal Client Proposal Email', 
      desc: 'Draft an email pitching a software solution, data analytics service, or SLA structure to a prospective international client. Focus on professional openings, removing contractions, and outlining clear milestones.' 
    },
    { 
      id: 'clause', 
      title: 'NDA / Contract Clause Drafting', 
      desc: 'Draft an NDA clause (Confidentiality), payment terms clause (Disputed invoices), or termination clause. Strictly adhere to legal modals (shall/must for obligations, may for discretionary rights).' 
    },
    { 
      id: 'custom', 
      title: 'Free Writing / Custom Prompt', 
      desc: 'Practice drafting anything else — a project brief, meeting minutes, technical logs, or an email update to an internal stakeholder.' 
    }
  ];

  const getWordCount = (text) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  const wordCount = getWordCount(draftText);
  const activePrompt = prompts.find(p => p.id === activePromptId);
  const activeRubric = rubrics.find(r => r.writingType === (activePromptId === 'custom' ? 'summary' : activePromptId)) || rubrics[0];

  const handleOpenRubric = () => {
    if (!draftText.trim()) {
      alert("Please write something before reviewing the rubric.");
      return;
    }
    // Initialize rubric answers to false
    const initialAnswers = {};
    activeRubric.items.forEach(item => {
      initialAnswers[item.id] = false;
    });
    setRubricAnswers(initialAnswers);
    setIsRubricOpen(true);
  };

  const handleCheckboxChange = (itemId, checked) => {
    setRubricAnswers(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  const handleSaveDraft = () => {
    addWritingLog(activePromptId, draftText, wordCount, rubricAnswers);
    setDraftText('');
    setIsRubricOpen(false);
    setRubricAnswers({});
    
    // Refresh history
    setHistoryLogs(getWritingLogs().slice(-5).reverse());
    
    alert("Draft and self-rubric evaluation saved to your study log!");
    if (onActivityLogged) onActivityLogged();
  };

  // Group common Thai learner errors by category
  const errorCategories = [...new Set(errors.map(e => e.category))];

  return (
    <div className="space-y-6">
      
      {/* Tab Switcher Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Left Form Panel */}
        <div className="lg:col-span-2 space-y-4">
          
          {!isRubricOpen ? (
            /* DRAFT WRITING VIEW */
            <div className="glass rounded-2xl p-5 border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Edit3 className="h-4.5 w-4.5 text-accent-400" /> Writing Practice & Self-Rubric
              </h3>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">1. Select Prompt</label>
                <select
                  value={activePromptId}
                  onChange={(e) => {
                    setActivePromptId(e.target.value);
                    setDraftText('');
                  }}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-accent-500 font-semibold"
                >
                  {prompts.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-xs text-slate-350 leading-relaxed">
                <span className="font-bold text-slate-300 block mb-0.5">Instructions:</span>
                {activePrompt.desc}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">2. Compose Draft</label>
                  <span className={`text-[10px] font-bold ${
                    activePromptId === 'summary' && (wordCount < 80 || wordCount > 120)
                      ? 'text-amber-500'
                      : 'text-slate-500'
                  }`}>
                    {wordCount} words {activePromptId === 'summary' && '(Target: ~100)'}
                  </span>
                </div>
                <textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Start writing in English..."
                  rows="8"
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-xs text-slate-250 focus:outline-none focus:border-accent-500 leading-relaxed font-serif"
                />
              </div>

              {/* Hand off to Grammarly / LanguageTool */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-900">
                <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Check externally:</span>
                {extLinks?.grammarTools?.map((tool) => (
                  <a
                    key={tool.name}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-900 py-1.5 px-3 rounded-lg border border-slate-900 transition font-bold"
                  >
                    {tool.name} <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>

              <button
                onClick={handleOpenRubric}
                disabled={!draftText.trim()}
                className="w-full bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-bold py-2.5 rounded-xl text-xs transition disabled:opacity-50"
              >
                Proceed to Self-Rubric Check
              </button>

            </div>
          ) : (
            /* RUBRIC CHECKLIST VIEW */
            <div className="glass rounded-2xl p-5 border-slate-800 space-y-4 animate-fade-in">
              <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <CheckSquare className="h-4.5 w-4.5 text-accent-400" /> Self-Grading Rubric
                </h3>
                <button 
                  onClick={() => setIsRubricOpen(false)} 
                  className="text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Edit Draft
                </button>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Your Draft preview ({wordCount} words):</span>
                <p className="text-xs italic text-slate-300 leading-relaxed font-serif max-h-[100px] overflow-y-auto pr-1">
                  "{draftText}"
                </p>
              </div>

              {/* Rubric Check items */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Evaluation Checklist</h4>
                
                <div className="space-y-2">
                  {activeRubric.items.map((item) => (
                    <label 
                      key={item.id}
                      className="flex items-start gap-2.5 p-2.5 bg-slate-900/10 hover:bg-slate-900/30 rounded-xl cursor-pointer border border-transparent hover:border-slate-900 transition text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={rubricAnswers[item.id] || false}
                        onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                        className="mt-0.5 h-4.5 w-4.5 rounded border-slate-700 bg-slate-950 text-accent-500 focus:ring-accent-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="text-slate-200 leading-normal">{item.check}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block ${
                          item.category === 'grammar' ? 'bg-rose-950 text-rose-450 border border-rose-900/40' :
                          item.category === 'register' ? 'bg-sky-950 text-sky-450 border border-sky-900/40' :
                          item.category === 'structure' ? 'bg-emerald-950 text-emerald-450 border border-emerald-900/40' :
                          'bg-amber-950 text-amber-450 border border-amber-900/40'
                        }`}>
                          {item.category}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsRubricOpen(false)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-350 font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Edit Draft
                </button>
                <button
                  onClick={handleSaveDraft}
                  className="flex-1 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Save & Log Writing
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Right side - Common Mistakes Reference & History logs */}
        <div className="space-y-4 text-left">
          
          {/* Common Mistakes reference */}
          <div className="glass rounded-2xl p-5 border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500" /> Common Thai Mistakes
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Compare your draft against these frequent errors committed by Thai native speakers (articles, plurals, tense shifts).
            </p>
            
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {errorCategories.map((cat) => {
                const isOpen = openErrorCategory === cat;
                const matches = errors.filter(e => e.category === cat);
                return (
                  <div key={cat} className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950/20">
                    <button
                      onClick={() => setOpenErrorCategory(isOpen ? null : cat)}
                      className="w-full p-2.5 text-xs font-bold capitalize bg-slate-950 flex items-center justify-between text-slate-300"
                    >
                      <span>{cat} errors</span>
                      {isOpen ? <ChevronUp className="h-4.5 w-4.5 text-slate-500" /> : <ChevronDown className="h-4.5 w-4.5 text-slate-500" />}
                    </button>
                    
                    {isOpen && (
                      <div className="p-3 space-y-3 bg-slate-950/50">
                        {matches.map((err) => (
                          <div key={err.id} className="space-y-1 text-[11px] leading-relaxed border-b border-slate-900 pb-2.5 last:border-0 last:pb-0">
                            <div>
                              <span className="text-rose-400 font-bold">Wrong:</span>
                              <p className="text-slate-400 italic">"{err.wrong}"</p>
                            </div>
                            <div>
                              <span className="text-emerald-400 font-bold">Right:</span>
                              <p className="text-slate-200 font-semibold">"{err.right}"</p>
                            </div>
                            <p className="text-slate-500 text-[10px] leading-normal mt-0.5">Note (TH): {err.note_th}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* History log list */}
          <div className="glass rounded-2xl p-5 border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <History className="h-4.5 w-4.5 text-accent-400" /> Writing History Logs
            </h4>
            
            {historyLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-650 text-xs italic">
                No writing drafts logged yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[225px] overflow-y-auto pr-1">
                {historyLogs.map((log) => {
                  const typeTitle = prompts.find(p => p.id === log.promptId)?.title || 'Draft Summary';
                  // Calculate compliant score
                  const checkCount = Object.keys(log.rubricAnswers || {}).length;
                  const successCount = Object.values(log.rubricAnswers || {}).filter(Boolean).length;
                  
                  return (
                    <div key={log.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl space-y-2 text-[11px]">
                      <div className="flex justify-between items-center text-slate-500">
                        <span>{log.date}</span>
                        <span className="text-[10px] font-bold text-slate-400 truncate max-w-[100px]">{typeTitle}</span>
                      </div>
                      
                      <p className="text-slate-350 leading-relaxed font-serif line-clamp-2">"{log.text}"</p>
                      
                      <div className="flex items-center justify-between pt-1 border-t border-slate-900/60 text-[10px] text-slate-500 font-semibold">
                        <span>Word count: {log.wordCount}</span>
                        {checkCount > 0 && (
                          <span className="text-accent-450 bg-accent-950/20 px-1.5 py-0.5 rounded border border-accent-900/40">
                            Rubric: {successCount} / {checkCount} Passed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
