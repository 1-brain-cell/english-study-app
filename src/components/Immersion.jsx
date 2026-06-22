import React, { useState, useEffect } from 'react';
import { 
  getImmersionSources, 
  addImmersionLog, 
  getImmersionLogs,
  addCustomWord
} from '../data/db';
import { 
  Tv, 
  Gamepad2, 
  ExternalLink, 
  Plus, 
  Trash2, 
  History, 
  Calendar,
  FileText,
  UserCheck,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function Immersion({ onActivityLogged }) {
  const sources = getImmersionSources();
  
  // Tabs: 'logger' | 'compare' | 'directory'
  const [activeSubTab, setActiveSubTab] = useState('logger');
  
  // Log form state
  const [selectedSourceId, setSelectedSourceId] = useState(sources[0]?.id || '');
  const [minutes, setMinutes] = useState('');
  const [capturedPhrases, setCapturedPhrases] = useState([]); // array of { phrase, meaning, tag }
  
  // Current phrase input state
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [currentMeaning, setCurrentMeaning] = useState('');
  const [currentTag, setCurrentTag] = useState('vtuber-slang');

  // VTuber compare state
  const [niyekoNotes, setNiyekoNotes] = useState('');
  const [azeruNotes, setAzeruNotes] = useState('');

  // History state
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Load vtuber compare notes
    setNiyekoNotes(localStorage.getItem('eng_study_niyeko_notes') || '');
    setAzeruNotes(localStorage.getItem('eng_study_azeru_notes') || '');
    // Load logs history
    setLogs(getImmersionLogs().slice(-5).reverse());
  }, []);

  const handleAddPhraseInput = () => {
    if (!currentPhrase.trim() || !currentMeaning.trim()) {
      alert("Please fill in both phrase and meaning");
      return;
    }
    setCapturedPhrases(prev => [
      ...prev,
      {
        phrase: currentPhrase.trim(),
        meaning: currentMeaning.trim(),
        tag: currentTag
      }
    ]);
    setCurrentPhrase('');
    setCurrentMeaning('');
  };

  const handleRemovePhrase = (idx) => {
    setCapturedPhrases(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePushToVocab = (phraseObj) => {
    // Adds directly to vocab database
    addCustomWord({
      word: phraseObj.phrase,
      meaning: phraseObj.meaning,
      example: `Captured during immersion session from logged source.`,
      tag: phraseObj.tag,
      source: 'Immersion Capture',
      sightings: 3 // auto-override warning guidelines since user sighted it
    });
    alert(`"${phraseObj.phrase}" added to Vocabulary SRS deck!`);
    if (onActivityLogged) onActivityLogged();
  };

  const handleSubmitLog = (e) => {
    e.preventDefault();
    if (!minutes || isNaN(minutes) || parseInt(minutes) <= 0) {
      alert("Please enter valid minutes");
      return;
    }

    addImmersionLog(selectedSourceId, parseInt(minutes), capturedPhrases);
    setMinutes('');
    setCapturedPhrases([]);
    setLogs(getImmersionLogs().slice(-5).reverse());
    
    alert("Immersion session logged successfully!");
    if (onActivityLogged) onActivityLogged();
  };

  const handleSaveCompareNotes = () => {
    localStorage.setItem('eng_study_niyeko_notes', niyekoNotes);
    localStorage.setItem('eng_study_azeru_notes', azeruNotes);
    alert("VTuber comparison notes saved successfully!");
  };

  // Directories state
  const [selectedDirectoryKind, setSelectedDirectoryKind] = useState('all');
  const directoryKinds = ['all', 'vtuber', 'game', 'reddit', 'esports'];

  const filteredSources = selectedDirectoryKind === 'all'
    ? sources
    : sources.filter(s => s.kind === selectedDirectoryKind);

  return (
    <div className="space-y-6">
      
      {/* Sub tabs switcher */}
      <div className="flex border-b border-slate-900 gap-1.5 p-1 bg-slate-950/40 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveSubTab('logger')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition duration-200 cursor-pointer ${
            activeSubTab === 'logger'
              ? 'bg-accent-600/15 text-accent-300 border border-accent-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tv className="h-3.5 w-3.5 inline mr-1" /> Log Session
        </button>
        <button
          onClick={() => setActiveSubTab('compare')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition duration-200 cursor-pointer ${
            activeSubTab === 'compare'
              ? 'bg-accent-600/15 text-accent-300 border border-accent-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="h-3.5 w-3.5 inline mr-1" /> Accent Compare
        </button>
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition duration-200 cursor-pointer ${
            activeSubTab === 'directory'
              ? 'bg-accent-600/15 text-accent-300 border border-accent-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gamepad2 className="h-3.5 w-3.5 inline mr-1" /> Channels Directory
        </button>
      </div>

      {/* SUB TAB 1: IMMERSION SESSION LOGGER */}
      {activeSubTab === 'logger' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          
          {/* Main logging form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass rounded-2xl p-5 border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Tv className="h-4.5 w-4.5 text-accent-400" /> Log Immersion Input
              </h3>
              
              <form onSubmit={handleSubmitLog} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Immersion Source</label>
                    <select
                      value={selectedSourceId}
                      onChange={(e) => setSelectedSourceId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-accent-500 font-semibold"
                    >
                      {sources.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.kind})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Minutes Spent</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                      placeholder="e.g. 30"
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-accent-500 font-semibold"
                    />
                  </div>
                </div>

                {/* Phrase Capturer Widgets */}
                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-3.5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capture Slang / Phrases Heard</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={currentPhrase}
                      onChange={(e) => setCurrentPhrase(e.target.value)}
                      placeholder="Phrase (e.g. lowkey)"
                      className="bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-accent-500 font-semibold"
                    />
                    
                    <input
                      type="text"
                      value={currentMeaning}
                      onChange={(e) => setCurrentMeaning(e.target.value)}
                      placeholder="Meaning (e.g. slightly)"
                      className="bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-accent-500 font-semibold"
                    />

                    <select
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      className="bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-accent-500 uppercase font-semibold"
                    >
                      <option value="vtuber-slang">VTuber Slang</option>
                      <option value="reddit-slang">Reddit Slang</option>
                      <option value="cross-domain">Cross Domain</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPhraseInput}
                    className="flex items-center gap-1 text-[11px] font-bold text-accent-300 hover:text-accent-200 px-3 py-1.5 bg-accent-950/20 border border-accent-900/40 rounded-xl transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Phrase to List
                  </button>

                  {/* Captured lists */}
                  {capturedPhrases.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-900/60 max-h-[160px] overflow-y-auto">
                      {capturedPhrases.map((phrase, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="font-bold text-slate-200">{phrase.phrase}</span>
                            <span className="text-[10px] text-slate-500 ml-2">({phrase.meaning})</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handlePushToVocab(phrase)}
                              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/20 border border-emerald-900/40 px-2.5 py-1 rounded-lg transition"
                            >
                              Push to SRS
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleRemovePhrase(idx)}
                              className="text-rose-450 hover:text-rose-350 p-1 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Log Session (adds to Immersion Hours)
                </button>
              </form>
            </div>
          </div>

          {/* Right side history log panel */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5 border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-4.5 w-4.5 text-accent-400" /> Immersion Logs
              </h4>
              
              {logs.length === 0 ? (
                <div className="text-center py-8 text-slate-650 text-xs italic">
                  No immersion hours logged this week.
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {logs.map((log) => {
                    const sourceName = sources.find(s => s.id === log.sourceId)?.name || 'Unknown Channel';
                    return (
                      <div key={log.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1.5 text-[11px]">
                        <div className="flex justify-between items-center text-slate-500">
                          <span>{log.date}</span>
                          <span className="font-bold text-slate-300 truncate max-w-[120px]">{sourceName}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-slate-450">Duration:</span>
                          <span className="font-extrabold text-white text-xs">{log.minutes} min</span>
                        </div>

                        {log.phrasesCaptured?.length > 0 && (
                          <div className="pt-1.5 border-t border-slate-900/60">
                            <span className="text-[10px] text-slate-500 font-bold block mb-1">Phrases Captured:</span>
                            <div className="flex flex-wrap gap-1">
                              {log.phrasesCaptured.map((p, idx) => (
                                <span key={idx} className="bg-slate-950 border border-slate-900 text-slate-350 text-[9.5px] px-1.5 py-0.5 rounded">
                                  {p.phrase}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* SUB TAB 2: VTUBER ACCENT COMPARE WORKSPACE */}
      {activeSubTab === 'compare' && (
        <div className="glass rounded-2xl p-6 border-slate-800 text-left space-y-6 animate-fade-in">
          
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <UserCheck className="h-4.5 w-4.5 text-accent-400" /> VTuber Style & Accent Compare
            </h3>
            <p className="text-xs text-slate-400 leading-normal mt-1">
              Observe and take notes on the contrast in spoken speed, rhythm, and slang styles between these two EN creators. Compare Niyeko's Filipino English / high-energy gameplay speech against Azeru's deliberate, clear-paced voice-actor narration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Niyeko Card */}
            <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-white">Niyeko</h4>
                  <span className="text-[9.5px] font-bold text-amber-500 uppercase">Filipino EN VTuber</span>
                </div>
                <a 
                  href="https://www.twitch.tv/niyeko" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-850 px-2 py-1 rounded"
                >
                  Twitch Channel <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl text-xs text-slate-400 space-y-1">
                <span className="font-bold text-slate-350 block">Acoustic & Style notes:</span>
                <p className="leading-relaxed">Fast, chaotic, high-energy gaming delivery. Rich in gaming vernacular (Valorant, Identity V terminology). Heavy colloquial contractions and Philippine English phonetic features (clear consonants, syllable-timed cadence). Excellent ear-training for rapid slang.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">My Notes (Accent, expressions, slang terms):</label>
                <textarea
                  value={niyekoNotes}
                  onChange={(e) => setNiyekoNotes(e.target.value)}
                  placeholder="Note slang words she uses (e.g. lowkey, cope, fr fr), speaking speed, and pronunciation changes..."
                  rows="5"
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-accent-500 font-serif leading-relaxed"
                />
              </div>
            </div>

            {/* Azeru Card */}
            <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-white">Azeru</h4>
                  <span className="text-[9.5px] font-bold text-sky-400 uppercase">EN voice actor VTuber</span>
                </div>
                <a 
                  href="https://www.youtube.com/results?search_query=azeru+vtuber" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-850 px-2 py-1 rounded"
                >
                  YouTube clips <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl text-xs text-slate-400 space-y-1">
                <span className="font-bold text-slate-350 block">Acoustic & Style notes:</span>
                <p className="leading-relaxed">Calm, deeper tone with measured pacing. ASMR/audiobook-style clarity. Focuses on narrative exposition, voice acting exercises, and descriptive expressions. Trains ear for clear stress shifts and deliberate pronunciation structures.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">My Notes (Diction, pacing, expressions):</label>
                <textarea
                  value={azeruNotes}
                  onChange={(e) => setAzeruNotes(e.target.value)}
                  placeholder="Note vocabulary selection, how he pauses, stress shifts, and clear pronunciation guidelines..."
                  rows="5"
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-accent-500 font-serif leading-relaxed"
                />
              </div>
            </div>

          </div>

          <button
            onClick={handleSaveCompareNotes}
            className="w-full bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-bold py-2.5 rounded-xl text-xs transition"
          >
            Save Comparison Notes
          </button>
        </div>
      )}

      {/* SUB TAB 3: IMMERSION DIRECTORY CHANNELS */}
      {activeSubTab === 'directory' && (
        <div className="glass rounded-2xl p-6 border-slate-800 text-left space-y-5 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Immersion Channels Directory</h3>
              <p className="text-xs text-slate-400 mt-0.5">Quick access links to standard subreddits, stream channels, and community sites</p>
            </div>
            
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 border border-slate-900 rounded-xl">
              {directoryKinds.map(kind => (
                <button
                  key={kind}
                  onClick={() => setSelectedDirectoryKind(kind)}
                  className={`py-1 px-2.5 text-[10px] font-bold uppercase tracking-wide rounded-lg transition duration-150 cursor-pointer ${
                    selectedDirectoryKind === kind
                      ? 'bg-accent-600/15 text-accent-300 border border-accent-950/20'
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  {kind}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSources.map((source) => (
              <div 
                key={source.id} 
                onClick={() => window.open(source.url, '_blank')}
                className="p-4 bg-slate-900/15 border border-slate-900 hover:border-slate-850 hover:bg-slate-900/30 rounded-2xl cursor-pointer transition duration-200 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between">
                    <h4 className="font-extrabold text-white text-sm select-all">{source.name}</h4>
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-[9px] font-extrabold text-slate-500 uppercase tracking-wide border border-slate-900">
                      {source.kind}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal line-clamp-3">{source.note}</p>
                </div>
                
                <div className="pt-3 border-t border-slate-900/40 text-[10px] font-bold text-accent-400 flex items-center justify-end gap-1 mt-3">
                  <span>Visit channel</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
