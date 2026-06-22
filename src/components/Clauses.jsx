import React, { useState, useEffect } from 'react';
import { 
  getStaticClauses, 
  getExternalLinks, 
  addClauseLog,
  getClauseLogs
} from '../data/db';
import { 
  FileText, 
  FileSearch, 
  BookOpen, 
  HelpCircle, 
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  AlertTriangle,
  ArrowRightLeft
} from 'lucide-react';

export default function Clauses({ onActivityLogged }) {
  const clauses = getStaticClauses();
  const extLinks = getExternalLinks();
  
  // Tabs: 'library' | 'analyzer' | 'glossary'
  const [activeSubTab, setActiveSubTab] = useState('library');
  
  // Library State
  const [selectedType, setSelectedType] = useState('all');
  const [selectedClause, setSelectedClause] = useState(clauses[0] || null);

  // Analyzer State
  const [pastedClause, setPastedClause] = useState('');
  const [analyzerStep, setAnalyzerStep] = useState(1); // 1: input/analyze, 2: compare
  
  // Guided Checklist Answers
  const [parties, setParties] = useState('');
  const [obligations, setObligations] = useState('');
  const [rights, setRights] = useState('');
  const [terminationCondition, setTerminationCondition] = useState('');
  const [liabilityCap, setLiabilityCap] = useState('');
  const [governingLaw, setGoverningLaw] = useState('');
  const [closestLibraryId, setClosestLibraryId] = useState(clauses[0]?.id || '');
  
  const [analysisLogs, setAnalysisLogs] = useState([]);

  useEffect(() => {
    setAnalysisLogs(getClauseLogs().slice(-3).reverse());
  }, []);

  const clauseTypes = ['all', ...new Set(clauses.map(c => c.type))];

  const filteredClauses = selectedType === 'all' 
    ? clauses 
    : clauses.filter(c => c.type === selectedType);

  // Cosmetic highlight of legal terms in text
  const highlightLegalTerms = (text) => {
    if (!text) return '';
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Modal Verbs (shall/must = obligation, may = right)
    html = html.replace(/\b(shall|must)\b/gi, '<span class="text-amber-500 font-extrabold">$1</span>');
    html = html.replace(/\b(may)\b/gi, '<span class="text-sky-400 font-extrabold">$1</span>');

    // Connectors
    const connectors = [
      'hereinafter', 'notwithstanding', 'whereas', 'pursuant to', 
      'subject to', 'provided that', 'material breach', 'intellectual property',
      'hold harmless', 'liability'
    ];

    connectors.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      html = html.replace(regex, `<span class="underline decoration-accent-500/50 hover:decoration-accent-400 text-slate-200 font-semibold cursor-help" title="Legal reference term">${term}</span>`);
    });

    return html;
  };

  const handleSaveAnalysis = () => {
    if (!pastedClause.trim()) {
      alert("Please paste a clause to analyze.");
      return;
    }
    
    const checklistAnswers = {
      parties,
      obligations,
      rights,
      terminationCondition,
      liabilityCap,
      governingLaw
    };

    addClauseLog(pastedClause, checklistAnswers, closestLibraryId);
    setAnalysisLogs(getClauseLogs().slice(-3).reverse());
    
    alert("Analysis session logged successfully! Weekly hours and streak updated.");
    
    if (onActivityLogged) onActivityLogged();
    
    // Reset analyzer fields
    setPastedClause('');
    setParties('');
    setObligations('');
    setRights('');
    setTerminationCondition('');
    setLiabilityCap('');
    setGoverningLaw('');
    setAnalyzerStep(1);
  };

  const confusingPairs = [
    {
      term1: "terminate",
      term2: "expire",
      desc1: "Actively end a contract before its natural end date, usually due to a breach or for convenience.",
      desc2: "The contract naturally runs its course and ends at its pre-agreed date (end of the term).",
      tip: "Example: 'Either party may terminate for default' vs. 'This Agreement shall expire on 31 December.'"
    },
    {
      term1: "breach",
      term2: "default",
      desc1: "A general failure to perform any contractual duty or obligation.",
      desc2: "A specific failure to perform, often used for financial failure (non-payment) or missing clear deadlines.",
      tip: "Example: 'Any breach of warranty' vs. 'Default in payment of invoice interest.'"
    },
    {
      term1: "warranty",
      term2: "guarantee",
      desc1: "A promise/statement of fact about quality or state of product. Breach gives rise to compensation claims.",
      desc2: "A secondary promise by a third party (like a parent company or bank) to perform if the primary party defaults.",
      tip: "Example: 'Developer warrants that the SaaS functions' vs. 'Parent Company guarantees the payments.'"
    },
    {
      term1: "liable",
      term2: "responsible",
      desc1: "Legally bound to pay compensation or damages for failure or harm (enforceable in court).",
      desc2: "Having a duty to execute a task, but doesn't automatically mean having to pay court damages unless stated.",
      tip: "Example: 'Processor shall be liable for data breaches' vs. 'Customer is responsible for account security.'"
    }
  ];

  const legalConnectors = [
    { name: "hereinafter", meaning: "From this point forward in this document", example: "Acme Corp. (hereinafter 'the Supplier')." },
    { name: "notwithstanding", meaning: "In spite of / despite (used to override other terms)", example: "Notwithstanding Section 5, either party may terminate." },
    { name: "whereas", meaning: "Given that / considering (used in recitals/background)", example: "Whereas, the Disclosing Party wishes to share secrets." },
    { name: "pursuant to", meaning: "In accordance with / under", example: "Payments shall be made pursuant to Section 4." },
    { name: "subject to", meaning: "Conditional upon / limited by", example: "Subject to payment, Licensee is granted a SaaS license." },
    { name: "provided that", meaning: "On the condition that", example: "May disclose secrets, provided that employees sign NDAs." }
  ];

  return (
    <div className="space-y-6">
      
      {/* Sub tabs switcher */}
      <div className="flex border-b border-slate-900 gap-1.5 p-1 bg-slate-950/40 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveSubTab('library')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition duration-200 cursor-pointer ${
            activeSubTab === 'library'
              ? 'bg-accent-600/15 text-accent-300 border border-accent-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5 inline mr-1" /> Clause Library
        </button>
        <button
          onClick={() => setActiveSubTab('analyzer')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition duration-200 cursor-pointer ${
            activeSubTab === 'analyzer'
              ? 'bg-accent-600/15 text-accent-300 border border-accent-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSearch className="h-3.5 w-3.5 inline mr-1" /> Guided Practice
        </button>
        <button
          onClick={() => setActiveSubTab('glossary')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition duration-200 cursor-pointer ${
            activeSubTab === 'glossary'
              ? 'bg-accent-600/15 text-accent-300 border border-accent-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowRightLeft className="h-3.5 w-3.5 inline mr-1" /> Legal Glossary
        </button>
      </div>

      {/* SUB TAB 1: CLAUSE LIBRARY */}
      {activeSubTab === 'library' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List panel */}
          <div className="lg:col-span-1 space-y-4 text-left">
            <div className="glass rounded-2xl p-4 border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Categories</h4>
                <FileText className="h-4 w-4 text-slate-500" />
              </div>
              
              <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
                {clauseTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-left transition duration-150 cursor-pointer ${
                      selectedType === type
                        ? 'bg-accent-600/10 text-accent-300 border border-accent-950/40'
                        : 'bg-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {type === 'all' ? 'All categories' : type}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4 border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Available Clauses</h4>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {filteredClauses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClause(c)}
                    className={`w-full p-3 text-left rounded-xl text-xs font-bold transition duration-200 border cursor-pointer block ${
                      selectedClause?.id === c.id
                        ? 'bg-accent-950/20 border-accent-700/60 text-white'
                        : 'bg-slate-900/20 border-slate-900 hover:bg-slate-900/40 hover:border-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="font-semibold truncate">{c.title}</div>
                    <span className="text-[10px] text-slate-500 uppercase mt-1 block">{c.type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Details display */}
          <div className="lg:col-span-2 text-left">
            {selectedClause ? (
              <div className="glass rounded-2xl p-6 border-slate-800 space-y-5 animate-fade-in">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-[9px] font-bold text-slate-400 tracking-wide uppercase border border-slate-900">
                      {selectedClause.type}
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-1.5">{selectedClause.title}</h3>
                  </div>
                </div>

                {/* Main Clause text */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Standard Language</h4>
                  <p 
                    className="text-sm italic font-serif leading-relaxed text-slate-100 bg-slate-950 p-4 rounded-xl border border-slate-900 shadow-inner"
                    dangerouslySetInnerHTML={{ __html: highlightLegalTerms(selectedClause.text) }}
                  />
                  <div className="flex gap-4 text-[10px] pl-2">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> shall/must = binding obligation</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-400" /> may = discretionary right</span>
                  </div>
                </div>

                {/* Plain translation */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plain explanation (ความหมายภาษาไทย)</h4>
                  <p className="text-xs text-slate-300 bg-slate-900/40 p-3 rounded-xl border border-slate-900 mt-1 leading-normal">
                    {selectedClause.explanation_th}
                  </p>
                </div>

                {/* Obligations and rights details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                    <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">Obligations (shall/must)</h4>
                    {selectedClause.obligations.length === 0 ? (
                      <span className="text-[11px] text-slate-500">None stated.</span>
                    ) : (
                      <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                        {selectedClause.obligations.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                    <h4 className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1.5">Rights (may)</h4>
                    {selectedClause.rights.length === 0 ? (
                      <span className="text-[11px] text-slate-500">None stated.</span>
                    ) : (
                      <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                        {selectedClause.rights.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Watch terms */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Key Terms to Watch (เงื่อนไขสำคัญที่ต้องระวัง)</h4>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {selectedClause.watch_terms.map((term, idx) => (
                      <span key={idx} className="bg-slate-950 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-900">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="glass rounded-2xl p-12 text-center text-slate-500 text-sm">
                Select a standard clause to read breakdown.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 2: GUIDED PRACTICAL ANALYZER */}
      {activeSubTab === 'analyzer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          
          {/* Left panel - Guided Checklist forms */}
          <div className="lg:col-span-2 space-y-4">
            
            {analyzerStep === 1 ? (
              <div className="glass rounded-2xl p-5 border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <FileSearch className="h-4.5 w-4.5 text-accent-400" /> Clause Self-Practice Analyzer
                </h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Paste a clause from a real contract you are reading (e.g. from SEC EDGAR). We'll highlight modal verbs and connector keywords, and guide you through a self-analysis checklist.
                </p>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Paste Clause Text</label>
                  <textarea
                    value={pastedClause}
                    onChange={(e) => setPastedClause(e.target.value)}
                    placeholder="Paste clause text here..."
                    rows="4"
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-accent-500 leading-relaxed font-serif"
                  />
                </div>

                {pastedClause.trim() && (
                  <div className="space-y-1 bg-slate-950/40 p-4 rounded-xl border border-slate-900 leading-relaxed">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Keyword Highlighting:</h4>
                    <p 
                      className="text-xs font-serif italic text-slate-300"
                      dangerouslySetInnerHTML={{ __html: highlightLegalTerms(pastedClause) }}
                    />
                  </div>
                )}

                {/* Self-check questions */}
                <div className="space-y-3.5 pt-2 border-t border-slate-900">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Analysis Checklist</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">1. Who are the parties bound by this clause?</label>
                      <input
                        type="text"
                        value={parties}
                        onChange={(e) => setParties(e.target.value)}
                        placeholder="e.g. Customer, Provider"
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-accent-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">2. Obligations: what MUST they do? (shall/must)</label>
                      <input
                        type="text"
                        value={obligations}
                        onChange={(e) => setObligations(e.target.value)}
                        placeholder="e.g. Provider must protect data"
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-accent-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">3. Rights: what MAY they do? (discretion)</label>
                      <input
                        type="text"
                        value={rights}
                        onChange={(e) => setRights(e.target.value)}
                        placeholder="e.g. Customer may terminate if breaches"
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-accent-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">4. Is there an active termination condition?</label>
                      <input
                        type="text"
                        value={terminationCondition}
                        onChange={(e) => setTerminationCondition(e.target.value)}
                        placeholder="e.g. 30 days notice to cure breach"
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-accent-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">5. Is there a liability cap mentioned?</label>
                      <input
                        type="text"
                        value={liabilityCap}
                        onChange={(e) => setLiabilityCap(e.target.value)}
                        placeholder="e.g. fees paid during 12 months"
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-accent-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">6. What is the governing law jurisdiction?</label>
                      <input
                        type="text"
                        value={governingLaw}
                        onChange={(e) => setGoverningLaw(e.target.value)}
                        placeholder="e.g. laws of Singapore"
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-accent-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">7. Select closest standard clause from our library:</label>
                    <select
                      value={closestLibraryId}
                      onChange={(e) => setClosestLibraryId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-accent-500 font-semibold"
                    >
                      {clauses.map(c => (
                        <option key={c.id} value={c.id}>{c.type} — {c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!pastedClause.trim()) {
                      alert("Please paste a clause to analyze.");
                      return;
                    }
                    setAnalyzerStep(2);
                  }}
                  className="w-full bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Generate Side-by-Side Comparison
                </button>
              </div>
            ) : (
              // STEP 2: COMPARE TARGET VIEW
              <div className="glass rounded-2xl p-5 border-slate-800 space-y-4 animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <h3 className="text-base font-bold text-white">Compare & Self-Assess</h3>
                  <button 
                    onClick={() => setAnalyzerStep(1)} 
                    className="text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Edit Checklist
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pasted analysis */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your pasted Clause Analysis</h4>
                    
                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 text-xs space-y-2">
                      <div>
                        <span className="text-slate-500 block">Parties:</span>
                        <span className="text-white font-medium">{parties || "Not stated"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Obligations (shall):</span>
                        <span className="text-amber-400 font-medium">{obligations || "Not stated"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Rights (may):</span>
                        <span className="text-sky-400 font-medium">{rights || "Not stated"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Termination Trigger:</span>
                        <span className="text-slate-300">{terminationCondition || "Not stated"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Liability Cap:</span>
                        <span className="text-slate-300">{liabilityCap || "Not stated"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Governing Law:</span>
                        <span className="text-slate-300">{governingLaw || "Not stated"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Standard reference target */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Standard Library Clause Reference</h4>
                    
                    {(() => {
                      const refCard = clauses.find(c => c.id === closestLibraryId);
                      return refCard ? (
                        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 text-xs space-y-2">
                          <div>
                            <span className="text-slate-500 block">Reference Type:</span>
                            <span className="text-white font-bold uppercase">{refCard.type} — {refCard.title}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Standard Obligations:</span>
                            <ul className="list-disc pl-4 text-slate-300 mt-1 space-y-0.5">
                              {refCard.obligations.map((o, idx) => <li key={idx}>{o}</li>)}
                            </ul>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Standard Rights:</span>
                            {refCard.rights.length === 0 ? (
                              <span className="text-slate-500">None stated</span>
                            ) : (
                              <ul className="list-disc pl-4 text-slate-300 mt-1 space-y-0.5">
                                {refCard.rights.map((r, idx) => <li key={idx}>{r}</li>)}
                              </ul>
                            )}
                          </div>
                          <div>
                            <span className="text-slate-500 block">Watch Terms:</span>
                            <span className="text-slate-400">{refCard.watch_terms.join(', ')}</span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setAnalyzerStep(1)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Edit Checklist
                  </button>
                  <button
                    onClick={handleSaveAnalysis}
                    className="flex-1 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="h-4 w-4" /> Save & Log Session
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right panel - History & External Lookups */}
          <div className="space-y-4">
            
            {/* SEC EDGAR Links */}
            <div className="glass rounded-2xl p-5 border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <ExternalLink className="h-4 w-4 text-accent-400" /> Real Contracts Search
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Want to analyze real legal clauses? Search the US Securities and Exchange Commission database (SEC EDGAR) for public contracts.
              </p>
              
              {extLinks?.contracts?.map((c) => (
                <a
                  key={c.name}
                  href={c.url.replace('{q}', encodeURIComponent('SaaS Agreement NDA Termination'))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-2 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-900 text-xs font-semibold rounded-xl text-slate-300 hover:text-white transition flex items-center justify-center gap-1"
                >
                  Search SEC EDGAR Contracts <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>

            {/* Analysis history */}
            <div className="glass rounded-2xl p-5 border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-accent-400" /> Analysis History
              </h4>
              
              {analysisLogs.length === 0 ? (
                <div className="text-center py-6 text-slate-600 text-xs italic">
                  No analysis sessions recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {analysisLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center text-slate-500">
                        <span>{log.date}</span>
                        <span className="font-bold uppercase text-[9px] bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded">
                          {clauses.find(c => c.id === log.matchingClauseId)?.type || 'NDA'}
                        </span>
                      </div>
                      <p className="text-slate-300 italic truncate">"{log.clauseText}"</p>
                      <p className="text-slate-500 text-[10px] mt-1">Parties logged: {log.checklistAnswers?.parties || 'None'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* SUB TAB 3: CONFUSING PAIRS & REFERENCE TABLES */}
      {activeSubTab === 'glossary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          
          {/* Confusing Word Pairs Table */}
          <div className="glass rounded-2xl p-5 border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <ArrowRightLeft className="h-4 w-4 text-accent-400" /> Confusing Legal Word-Pairs
            </h3>
            
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {confusingPairs.map((pair, idx) => (
                <div key={idx} className="p-4 bg-slate-900/20 border border-slate-900/60 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <span className="text-amber-400 font-extrabold">{pair.term1}</span>
                    <span className="text-slate-500 font-semibold">vs</span>
                    <span className="text-sky-400 font-extrabold">{pair.term2}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-900/40">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">{pair.term1}:</span>
                      <p className="text-slate-300 leading-normal">{pair.desc1}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">{pair.term2}:</span>
                      <p className="text-slate-300 leading-normal">{pair.desc2}</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950 p-2.5 rounded-lg text-[11px] text-slate-400 leading-normal border border-slate-950 flex items-start gap-1">
                    <Info className="h-3.5 w-3.5 text-accent-400 shrink-0 mt-0.5" />
                    <span>{pair.tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Connectors Glossary */}
          <div className="glass rounded-2xl p-5 border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <BookOpen className="h-4 w-4 text-accent-400" /> Contract Connector Glossary
            </h3>
            
            <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
              {legalConnectors.map((c, idx) => (
                <div key={idx} className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl text-xs flex flex-col sm:flex-row sm:items-start gap-3">
                  <span className="font-extrabold text-sm text-accent-300 sm:w-28 shrink-0">{c.name}</span>
                  <div className="space-y-1 flex-1">
                    <p className="text-slate-200 font-semibold">{c.meaning}</p>
                    <p className="text-slate-400 font-serif italic text-[11px]">e.g. "{c.example}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
