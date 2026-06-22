import React, { useState, useEffect } from 'react';
import { 
  getVocab, 
  saveVocab, 
  addCustomWord, 
  getExternalLinks,
  recordActivity
} from '../data/db';
import { sm2, getReviewQueue, getTodayStr } from '../utils/srs';
import { 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  ExternalLink, 
  HelpCircle, 
  AlertCircle,
  Check, 
  X, 
  RotateCcw,
  Sparkles,
  Bookmark
} from 'lucide-react';

export default function VocabSRS({ onActivityLogged }) {
  const [vocab, setVocab] = useState(getVocab());
  const [filteredVocab, setFilteredVocab] = useState([]);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedCard, setSelectedCard] = useState(null);

  // Review Session state
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewSessionStats, setReviewSessionStats] = useState({ correct: 0, wrong: 0 });

  // Add Card State
  const [isAdding, setIsAdding] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newTag, setNewTag] = useState('business');
  const [newSource, setNewSource] = useState('');
  const [newSightings, setNewSightings] = useState(1);

  // Load external dictionary urls
  const extLinks = getExternalLinks();
  const dictionaries = extLinks?.dictionaries || [];

  // Update lists
  useEffect(() => {
    refreshVocabList();
  }, [vocab, searchTerm, selectedTag]);

  const refreshVocabList = () => {
    let list = vocab;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(card => 
        card.word.toLowerCase().includes(term) ||
        card.meaning.toLowerCase().includes(term) ||
        card.example.toLowerCase().includes(term)
      );
    }

    if (selectedTag !== 'all') {
      list = list.filter(card => card.tag === selectedTag);
    }

    setFilteredVocab(list);
  };

  // Get distinct tags
  const tags = ['all', ...new Set(vocab.map(card => card.tag))];

  // Start Review Session
  const handleStartReview = () => {
    const queue = getReviewQueue(vocab, 15);
    const combined = [...queue.dueCards, ...queue.newCards];
    
    if (combined.length === 0) {
      alert("No cards due for review today! Great job!");
      return;
    }
    
    setReviewQueue(combined);
    setCurrentReviewIndex(0);
    setIsFlipped(false);
    setIsReviewing(true);
    setReviewSessionStats({ correct: 0, wrong: 0 });
  };

  // Reveal Card Meaning
  const handleRevealCard = () => {
    setIsFlipped(true);
  };

  // Submit recall score
  const handleGradeCard = (score) => {
    const activeCard = reviewQueue[currentReviewIndex];
    const updatedCard = sm2(activeCard, score);
    
    // Update local vocab array
    const updatedVocab = vocab.map(card => 
      card.id === activeCard.id ? updatedCard : card
    );
    setVocab(updatedVocab);
    saveVocab(updatedVocab);
    
    // Track session scores
    if (score >= 3) {
      setReviewSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setReviewSessionStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }

    // Keep user active streak alive
    recordActivity();
    if (onActivityLogged) onActivityLogged();

    // Next Card
    if (currentReviewIndex + 1 < reviewQueue.length) {
      setIsFlipped(false);
      setCurrentReviewIndex(currentReviewIndex + 1);
    } else {
      // Finished review session
      setIsReviewing(false);
      alert(`Review complete! You studied ${reviewQueue.length} cards. Correct: ${reviewSessionStats.correct + (score >= 3 ? 1 : 0)}, Incorrect: ${reviewSessionStats.wrong + (score < 3 ? 1 : 0)}`);
      // Reload vocab state
      setVocab(getVocab());
    }
  };

  // Add Card Handlers
  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    if (!newWord.trim() || !newMeaning.trim() || !newExample.trim()) {
      alert("Please fill in Word, Meaning, and Example fields");
      return;
    }

    // Slang constraint check
    const isSlang = newTag === 'vtuber-slang' || newTag === 'reddit-slang';
    if (isSlang && newSightings < 3) {
      const confirmAdd = confirm("Slang guidelines recommend adding a slang only after seeing/hearing it at least 3 times. Do you still want to add it?");
      if (!confirmAdd) return;
    }

    const newCard = addCustomWord({
      word: newWord,
      meaning: newMeaning,
      example: newExample,
      tag: newTag,
      source: newSource,
      sightings: isSlang ? newSightings : 0
    });

    setNewWord('');
    setNewMeaning('');
    setNewExample('');
    setNewSource('');
    setNewSightings(1);
    setIsAdding(false);
    
    // Refresh state
    setVocab(getVocab());
    recordActivity();
    if (onActivityLogged) onActivityLogged();
  };

  // Get Dictionary link
  const getDictUrl = (tpl, word) => {
    return tpl.replace('{q}', encodeURIComponent(word));
  };

  const isSlangSelected = newTag === 'vtuber-slang' || newTag === 'reddit-slang';

  // Count due and new cards
  const currentQueueStats = getReviewQueue(vocab, 15);

  return (
    <div className="space-y-6">
      
      {/* Review Queue Summary Banner */}
      {!isReviewing && (
        <div className="glass rounded-2xl p-6 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-accent-950/50 border border-accent-900 rounded-2xl text-accent-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">SRS Vocabulary Trainer</h3>
              <p className="text-slate-400 text-xs mt-1">
                You have <span className="text-accent-400 font-bold">{currentQueueStats.dueCards.length}</span> due reviews and up to <span className="text-sky-400 font-bold">{currentQueueStats.newCards.length}</span> new words ready to learn.
              </p>
            </div>
          </div>
          <button 
            onClick={handleStartReview}
            className="w-full sm:w-auto bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-accent-950/40"
          >
            Start Review Session
          </button>
        </div>
      )}

      {/* Reviewing Screen */}
      {isReviewing && reviewQueue.length > 0 && (
        <div className="glass rounded-2xl p-6 border-accent-900/40 bg-accent-950/10 max-w-2xl mx-auto shadow-2xl animate-fade-in">
          
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-6">
            <span>CARD {currentReviewIndex + 1} OF {reviewQueue.length}</span>
            <span className={`px-2.5 py-0.5 rounded-full ${
              !reviewQueue[currentReviewIndex].srs?.repetition 
                ? 'bg-sky-950 text-sky-400 border border-sky-900/60' 
                : 'bg-emerald-950 text-emerald-400 border border-emerald-900/60'
            }`}>
              {!reviewQueue[currentReviewIndex].srs?.repetition ? 'New Word' : 'Due Review'}
            </span>
          </div>

          {/* Flashcard container */}
          <div className="min-h-[260px] flex flex-col justify-between py-6 px-4 border border-slate-800 bg-slate-950/40 rounded-2xl relative overflow-hidden">
            
            {/* Front Side */}
            <div className="text-center space-y-4">
              <span className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full">
                {reviewQueue[currentReviewIndex].tag}
              </span>
              
              <h2 className="text-4xl font-extrabold text-white tracking-tight pt-4 select-all">
                {reviewQueue[currentReviewIndex].word}
              </h2>
              
              {reviewQueue[currentReviewIndex].source && (
                <p className="text-xs text-slate-500 italic">Source: {reviewQueue[currentReviewIndex].source}</p>
              )}
            </div>

            {/* Flipped details */}
            {isFlipped ? (
              <div className="mt-8 pt-6 border-t border-slate-900 space-y-4 text-center animate-fade-in">
                <div>
                  <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Meaning</h4>
                  <p className="text-lg font-semibold text-slate-200">{reviewQueue[currentReviewIndex].meaning}</p>
                </div>
                
                <div>
                  <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Context Sentence</h4>
                  <p className="text-sm italic text-slate-300">"{reviewQueue[currentReviewIndex].example}"</p>
                </div>

                {/* Slang Guideline Warning inside card reviews */}
                {(reviewQueue[currentReviewIndex].tag === 'vtuber-slang' || reviewQueue[currentReviewIndex].tag === 'reddit-slang') && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/50 text-[11px] text-amber-300 text-left">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>
                      Guideline check: Remember to log slang only after seeing them 3+ times. Sightings logged: {reviewQueue[currentReviewIndex].sightings || 3}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleRevealCard}
                  className="bg-accent-600/20 hover:bg-accent-600/30 text-accent-400 border border-accent-950/80 font-bold py-2.5 px-6 rounded-xl text-sm transition"
                >
                  Reveal Meaning
                </button>
              </div>
            )}

            {/* Dictionary Lookups (Always present so user can lookup word instantly) */}
            <div className="flex flex-wrap justify-center items-center gap-2.5 mt-6 pt-4 border-t border-slate-900/40">
              <span className="text-[10px] text-slate-500 font-bold uppercase mr-1">External Dictionary:</span>
              {dictionaries.map((dict) => (
                <a
                  key={dict.name}
                  href={getDictUrl(dict.url, reviewQueue[currentReviewIndex].word)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 py-1 px-2.5 rounded-lg border border-slate-850 transition"
                >
                  {dict.name} <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>

          </div>

          {/* Grading Buttons (SM-2 Quality score) */}
          {isFlipped && (
            <div className="mt-6 space-y-3">
              <h4 className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Rate your recall</h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { q: 5, label: 'Perfect', desc: '5', color: 'bg-emerald-600 hover:bg-emerald-500 text-white' },
                  { q: 4, label: 'Hesitant', desc: '4', color: 'bg-emerald-700 hover:bg-emerald-600 text-white' },
                  { q: 3, label: 'Difficult', desc: '3', color: 'bg-teal-700 hover:bg-teal-600 text-white' },
                  { q: 2, label: 'Familiar', desc: '2', color: 'bg-amber-700 hover:bg-amber-600 text-white' },
                  { q: 1, label: 'Wrong', desc: '1', color: 'bg-rose-700 hover:bg-rose-600 text-white' },
                  { q: 0, label: 'Blank', desc: '0', color: 'bg-rose-900 hover:bg-rose-800 text-rose-100' }
                ].map((item) => (
                  <button
                    key={item.q}
                    onClick={() => handleGradeCard(item.q)}
                    title={`${item.label}`}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${item.color}`}
                  >
                    <span>{item.desc}</span>
                    <span className="text-[9px] opacity-75 font-normal mt-0.5">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Abort review */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsReviewing(false)}
              className="text-xs font-medium text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 mx-auto"
            >
              <X className="h-3 w-3" /> Stop Session
            </button>
          </div>

        </div>
      )}

      {/* Main interface - Search, Filter, Word bank */}
      {!isReviewing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List panel */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Search & filters */}
            <div className="glass rounded-2xl p-4 border-slate-800 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search cards..."
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-accent-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-accent-500 uppercase font-semibold"
                >
                  {tags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsAdding(true)}
                className="bg-accent-600 hover:bg-accent-500 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1 transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add Card
              </button>
            </div>

            {/* List container */}
            <div className="glass rounded-2xl p-4 border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white">Vocabulary Bank ({filteredVocab.length})</h4>
                <span className="text-[10px] text-slate-500">Click word to see progress detail</span>
              </div>

              {filteredVocab.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No vocabulary cards found. Try clearing search filters or add a new card!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredVocab.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCard(card)}
                      className={`p-3.5 rounded-xl text-left border transition duration-200 cursor-pointer ${
                        selectedCard?.id === card.id
                          ? 'bg-accent-950/20 border-accent-700/60 shadow-md shadow-accent-950/20'
                          : 'bg-slate-900/20 border-slate-900 hover:bg-slate-900/40 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-white text-base select-all">{card.word}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-[9px] font-bold text-slate-400 tracking-wide uppercase border border-slate-900">
                          {card.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{card.meaning}</p>
                      
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 pt-2.5 border-t border-slate-900/40">
                        <span>Repetition: {card.srs?.repetition || 0}</span>
                        <span>
                          {card.srs?.dueDate 
                            ? `Due: ${card.srs.dueDate}` 
                            : 'Unstudied'
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Detail Side Panel */}
          <div className="space-y-4">
            
            {/* Adding new card panel */}
            {isAdding && (
              <div className="glass rounded-2xl p-5 border-accent-900/30 bg-accent-950/10 animate-fade-in">
                <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Plus className="h-4 w-4 text-accent-400" /> Add Custom Word
                  </h4>
                  <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleAddCardSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Vocabulary Word</label>
                    <input
                      type="text"
                      required
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      placeholder="e.g. indemnity"
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-accent-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Meaning (in English / Thai)</label>
                    <input
                      type="text"
                      required
                      value={newMeaning}
                      onChange={(e) => setNewMeaning(e.target.value)}
                      placeholder="e.g. security or compensation against loss (การชดใช้)"
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-accent-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Example Sentence</label>
                    <textarea
                      required
                      value={newExample}
                      onChange={(e) => setNewExample(e.target.value)}
                      placeholder="Write a clear context sentence containing the word..."
                      rows="2"
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-accent-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Domain Tag</label>
                      <select
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-accent-500 uppercase font-semibold"
                      >
                        <option value="business">Business</option>
                        <option value="legal">Legal</option>
                        <option value="ai-tech">AI & Tech</option>
                        <option value="genshin-lore">Genshin Lore</option>
                        <option value="identityv-skill">Identity V</option>
                        <option value="valorant">Valorant</option>
                        <option value="osu">osu!</option>
                        <option value="vtuber-slang">VTuber Slang</option>
                        <option value="reddit-slang">Reddit Slang</option>
                        <option value="cross-domain">Cross Domain</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Source (Optional)</label>
                      <input
                        type="text"
                        value={newSource}
                        onChange={(e) => setNewSource(e.target.value)}
                        placeholder="e.g. HBR, Reddit"
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-accent-500"
                      />
                    </div>
                  </div>

                  {/* Slang Guideline Sightings input & Warning */}
                  {isSlangSelected && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Sightings Count</label>
                        <input
                          type="number"
                          min="1"
                          value={newSightings}
                          onChange={(e) => setNewSightings(parseInt(e.target.value) || 1)}
                          className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-center text-white"
                        />
                      </div>
                      
                      {newSightings < 3 && (
                        <div className="flex items-start gap-1.5 text-[10px] text-amber-300 leading-normal bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                          <span>
                            Guideline Alert: You should sight slang in the wild at least 3 times before learning. Sightings count is under 3.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white text-xs font-bold py-2.5 rounded-xl transition duration-150 shadow"
                  >
                    Save to Deck
                  </button>
                </form>
              </div>
            )}

            {/* Selected card detail display */}
            {selectedCard ? (
              <div className="glass rounded-2xl p-5 border-slate-800 space-y-4 text-left animate-fade-in">
                <div className="flex items-start justify-between border-b border-slate-900 pb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-[9px] font-bold text-slate-400 tracking-wide uppercase border border-slate-900">
                      {selectedCard.tag}
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-1.5 select-all">{selectedCard.word}</h3>
                  </div>
                  <button onClick={() => setSelectedCard(null)} className="text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Meaning</h4>
                    <p className="text-slate-200 mt-1 font-medium">{selectedCard.meaning}</p>
                  </div>

                  <div>
                    <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Example Sentence</h4>
                    <p className="text-slate-300 italic mt-1 bg-slate-950/30 p-2.5 rounded-lg border border-slate-900">"{selectedCard.example}"</p>
                  </div>

                  {selectedCard.source && (
                    <div>
                      <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Source</h4>
                      <p className="text-slate-300 mt-1">{selectedCard.source}</p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-900">
                    <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">SRS Parameters</h4>
                    
                    <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-900 text-[11px]">
                      <div>
                        <span className="text-slate-500">Repetitions:</span>
                        <span className="float-right text-slate-200 font-semibold">{selectedCard.srs?.repetition || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Interval:</span>
                        <span className="float-right text-slate-200 font-semibold">{selectedCard.srs?.interval || 0} days</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Ease Factor:</span>
                        <span className="float-right text-slate-200 font-semibold">{selectedCard.srs?.easeFactor?.toFixed(2) || '2.50'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Due Date:</span>
                        <span className="float-right text-slate-200 font-semibold">{selectedCard.srs?.dueDate || 'Unstudied'}</span>
                      </div>
                    </div>
                  </div>

                  {/* External Dictionary Lookups for active card details */}
                  <div className="pt-3 border-t border-slate-900">
                    <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">Look up word on</h4>
                    <div className="flex flex-wrap gap-2">
                      {dictionaries.map((dict) => (
                        <a
                          key={dict.name}
                          href={getDictUrl(dict.url, selectedCard.word)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-850 hover:bg-slate-800 py-1.5 px-3 rounded-xl transition"
                        >
                          {dict.name} <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              !isAdding && (
                <div className="glass rounded-2xl p-6 border-slate-800 text-center py-16 text-slate-500 text-xs flex flex-col items-center justify-center space-y-2">
                  <Bookmark className="h-8 w-8 text-slate-600" />
                  <span>Select a word card to view full details and SRS learning history.</span>
                </div>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}
