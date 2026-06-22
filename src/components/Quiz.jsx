import React, { useState, useEffect } from 'react';
import { getVocab, saveVocab, getExternalLinks, addQuizLog } from '../data/db';
import { generateQuiz, shuffleArray } from '../utils/quiz';
import { sm2 } from '../utils/srs';
import { 
  HelpCircle, 
  Award, 
  RotateCcw, 
  BookOpen, 
  Check, 
  X, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function Quiz({ onActivityLogged }) {
  const [vocab, setVocab] = useState([]);
  
  // Settings state
  const [selectedTag, setSelectedTag] = useState('all');
  const [questionCount, setQuestionCount] = useState(5);
  const [quizType, setQuizType] = useState('mixed');
  
  // Quiz running state
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  
  // Question answering state
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  
  // Matching game state
  const [matchingWords, setMatchingWords] = useState([]);
  const [matchingMeanings, setMatchingMeanings] = useState([]);
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [selectedMeaningId, setSelectedMeaningId] = useState(null);
  const [matchedIds, setMatchedIds] = useState(new Set()); // set of card ids successfully matched
  const [mismatchFlash, setMismatchFlash] = useState(false); // flash mismatch red
  const [matchingWrongIds, setMatchingWrongIds] = useState(new Set()); // cards matched with at least one error
  
  // Performance review list
  const [quizResults, setQuizResults] = useState([]); // array of { card, correct }
  const [showOnlyMissedRetry, setShowOnlyMissedRetry] = useState(false);

  // Load external links
  const extLinks = getExternalLinks();
  const dictionaries = extLinks?.dictionaries || [];

  useEffect(() => {
    setVocab(getVocab());
  }, []);

  // Fetch unique tags in vocabulary bank
  const tags = ['all', ...new Set(vocab.map(card => card.tag))];

  // Start the Quiz
  const handleStartQuiz = (cardsToUse = null) => {
    const deck = cardsToUse || vocab;
    const generated = generateQuiz(deck, selectedTag, questionCount, quizType);
    
    if (generated.length === 0) {
      alert("No words match the selected tag filters to generate questions. Please choose a different tag.");
      return;
    }

    setQuestions(generated);
    setCurrentIndex(0);
    setUserScore(0);
    setQuizStarted(true);
    setQuizFinished(false);
    setIsAnswerSubmitted(false);
    setSelectedOptionId(null);
    setFillAnswer('');
    setQuizResults([]);
    
    // If matching, configure matching columns
    if (generated[0]?.type === 'matching') {
      setupMatchingGame(generated[0].cards);
    }
  };

  // Setup matching game structure
  const setupMatchingGame = (cards) => {
    const words = cards.map(c => ({ id: c.id, word: c.word }));
    const meanings = cards.map(c => ({ id: c.id, meaning: c.meaning }));
    
    setMatchingWords(shuffleArray(words));
    setMatchingMeanings(shuffleArray(meanings));
    setMatchedIds(new Set());
    setMatchingWrongIds(new Set());
    setSelectedWordId(null);
    setSelectedMeaningId(null);
  };

  // Handle multiple choice click
  const handleSelectOption = (option) => {
    if (isAnswerSubmitted) return;
    
    setSelectedOptionId(option.id);
    setIsAnswerSubmitted(true);
    
    const activeQuestion = questions[currentIndex];
    const isCorrect = option.id === activeQuestion.card.id;
    setIsAnswerCorrect(isCorrect);
    
    if (isCorrect) setUserScore(prev => prev + 1);
    
    // Save performance logs
    setQuizResults(prev => [...prev, { card: activeQuestion.card, correct: isCorrect }]);
    
    // Update SRS
    updateSRSForCard(activeQuestion.card, isCorrect);
  };

  // Handle fill-in-the-blank submit
  const handleSubmitFill = (e) => {
    e.preventDefault();
    if (isAnswerSubmitted || !fillAnswer.trim()) return;
    
    setIsAnswerSubmitted(true);
    
    const activeQuestion = questions[currentIndex];
    const userTrimmed = fillAnswer.trim().toLowerCase();
    const correctTrimmed = activeQuestion.correctAnswer.toLowerCase();
    
    const isCorrect = userTrimmed === correctTrimmed;
    setIsAnswerCorrect(isCorrect);
    
    if (isCorrect) setUserScore(prev => prev + 1);
    
    // Save performance logs
    setQuizResults(prev => [...prev, { card: activeQuestion.card, correct: isCorrect }]);
    
    // Update SRS
    updateSRSForCard(activeQuestion.card, isCorrect);
  };

  // Update card in SRS state and save
  const updateSRSForCard = (card, isCorrect) => {
    const score = isCorrect ? 4 : 2; // q=4 for correct, q=2 for wrong (sm2 algorithm rules)
    const updatedCard = sm2(card, score);
    
    // Load fresh vocab from localStorage, update active, save back
    const freshVocab = getVocab();
    const updatedVocab = freshVocab.map(v => v.id === card.id ? updatedCard : v);
    saveVocab(updatedVocab);
    setVocab(updatedVocab);
    
    if (onActivityLogged) onActivityLogged();
  };

  // Handle Matching pair click
  const handleWordMatchClick = (wordId) => {
    if (matchedIds.has(wordId)) return;
    setSelectedWordId(wordId);
    checkMatch(wordId, selectedMeaningId);
  };

  const handleMeaningMatchClick = (meaningId) => {
    if (matchedIds.has(meaningId)) return;
    setSelectedMeaningId(meaningId);
    checkMatch(selectedWordId, meaningId);
  };

  const checkMatch = (wordId, meaningId) => {
    if (!wordId || !meaningId) return;

    if (wordId === meaningId) {
      // Correct Match!
      const newMatched = new Set(matchedIds);
      newMatched.add(wordId);
      setMatchedIds(newMatched);
      
      const matchedCard = questions[0].cards.find(c => c.id === wordId);
      const isMissed = matchingWrongIds.has(wordId);
      
      // Save matching result for performance recap
      setQuizResults(prev => [...prev, { card: matchedCard, correct: !isMissed }]);
      
      // Update SRS
      updateSRSForCard(matchedCard, !isMissed);
      
      // Update Score
      if (!isMissed) {
        setUserScore(prev => prev + 1);
      }
      
      // Reset active selection
      setSelectedWordId(null);
      setSelectedMeaningId(null);
      
      // Check if all are matched
      if (newMatched.size === questions[0].cards.length) {
        setTimeout(() => {
          handleFinishQuiz(questions[0].cards.length);
        }, 800);
      }
    } else {
      // Incorrect Match
      setMismatchFlash(true);
      
      // Mark these cards as missed at least once so they don't count towards the clean score and get q=2 in SRS
      const newWrong = new Set(matchingWrongIds);
      newWrong.add(wordId);
      newWrong.add(meaningId);
      setMatchingWrongIds(newWrong);
      
      setTimeout(() => {
        setMismatchFlash(false);
        setSelectedWordId(null);
        setSelectedMeaningId(null);
      }, 500);
    }
  };

  // Advance to next question
  const handleNextQuestion = () => {
    setSelectedOptionId(null);
    setFillAnswer('');
    setIsAnswerSubmitted(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleFinishQuiz(questions.length);
    }
  };

  // Finish quiz and save stats log
  const handleFinishQuiz = (totalQuestions) => {
    // Save to Database Logs
    addQuizLog(userScore, totalQuestions, selectedTag, quizType);
    setQuizFinished(true);
    if (onActivityLogged) onActivityLogged();
  };

  // Retry missed words in a fresh quiz
  const handleRetryMissed = () => {
    const missedCards = quizResults.filter(r => !r.correct).map(r => r.card);
    if (missedCards.length === 0) return;
    
    // Configure settings for retry
    setQuestions(missedCards.map((card, index) => {
      // Fallback if example sentence is missing
      const type = card.example && quizType === 'fill-blank' ? 'fill-blank' : 'mc-word-to-meaning';
      
      if (type === 'mc-word-to-meaning') {
        const distractors = vocab.filter(v => v.id !== card.id).slice(0, 3);
        const options = shuffleArray([
          { id: card.id, text: card.meaning, isCorrect: true },
          ...distractors.map(d => ({ id: d.id, text: d.meaning, isCorrect: false }))
        ]);
        
        return {
          id: `retry-${index}-${Date.now()}`,
          type: 'mc-word-to-meaning',
          card: card,
          prompt: `Choose the correct meaning for the word:`,
          focusText: card.word,
          options,
          correctOptionId: card.id
        };
      } else {
        const blankedSentence = card.example.replace(new RegExp(`\\b${card.word}\\b`, 'gi'), '_____');
        return {
          id: `retry-${index}-${Date.now()}`,
          type: 'fill-blank',
          card: card,
          prompt: `Fill in the blank using the correct word:`,
          sentence: blankedSentence,
          correctAnswer: card.word.trim()
        };
      }
    }));
    
    setCurrentIndex(0);
    setUserScore(0);
    setQuizStarted(true);
    setQuizFinished(false);
    setIsAnswerSubmitted(false);
    setSelectedOptionId(null);
    setFillAnswer('');
    setQuizResults([]);
  };

  // Get Dictionary link
  const getDictUrl = (tpl, word) => {
    return tpl.replace('{q}', encodeURIComponent(word));
  };

  return (
    <div className="space-y-6">
      
      {/* Configuration Header */}
      {!quizStarted && (
        <div className="glass rounded-2xl p-6 border-slate-800 text-left max-w-xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent-950/50 border border-accent-900 rounded-xl text-accent-400">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Vocabulary Quiz Bank</h3>
              <p className="text-slate-400 text-xs mt-1">Algorithmically generate quizzes to reinforce memorization</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">1. Filter by Tag</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-accent-500 uppercase font-semibold"
              >
                {tags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">2. Question Count</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-accent-500 font-semibold"
                >
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="15">15 Questions</option>
                  <option value="20">20 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">3. Quiz Style</label>
                <select
                  value={quizType}
                  onChange={(e) => setQuizType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-accent-500 font-semibold"
                >
                  <option value="mixed">Mixed Modes</option>
                  <option value="mc-word-to-meaning">Multiple Choice: Word ➔ Meaning</option>
                  <option value="mc-meaning-to-word">Multiple Choice: Meaning ➔ Word</option>
                  <option value="fill-blank">Fill in the Blank</option>
                  <option value="matching">Word Matching Game (5 pairs)</option>
                </select>
              </div>
            </div>
            
            {quizType === 'matching' && questionCount !== 5 && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-950/20 border border-blue-900/40 text-[11px] text-blue-400">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <span>Word matching is fixed at 5 pairs. Question count will automatically adjust.</span>
              </div>
            )}

            <button
              onClick={() => handleStartQuiz()}
              className="w-full bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-md shadow-accent-950/50"
            >
              Generate & Start Quiz
            </button>
          </div>
        </div>
      )}

      {/* Quiz Game Active View */}
      {quizStarted && !quizFinished && (
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Progress bar */}
          {questions[currentIndex]?.type !== 'matching' && (
            <div className="glass rounded-xl p-4 border-slate-900 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>QUESTION {currentIndex + 1} OF {questions.length}</span>
              <div className="w-48 bg-slate-950 border border-slate-900 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-accent-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
              <span className="text-slate-300">Score: {userScore}</span>
            </div>
          )}

          {/* Render active question container */}
          {questions[currentIndex] && (
            <div className="glass rounded-2xl p-6 border-slate-800 text-left space-y-6 shadow-xl relative overflow-hidden min-h-[300px]">
              
              {/* MCQ Word to Meaning */}
              {questions[currentIndex].type === 'mc-word-to-meaning' && (
                <div className="space-y-4">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-slate-950 border border-slate-900 px-3 py-1 rounded-full">
                    {questions[currentIndex].card.tag}
                  </span>
                  
                  <div>
                    <p className="text-slate-400 text-xs font-semibold">{questions[currentIndex].prompt}</p>
                    <h3 className="text-3xl font-extrabold text-white mt-1.5 tracking-tight">{questions[currentIndex].focusText}</h3>
                  </div>

                  <div className="space-y-2.5 pt-4">
                    {questions[currentIndex].options.map((option) => {
                      const isSelected = selectedOptionId === option.id;
                      const isCorrect = option.isCorrect;
                      let btnStyle = "bg-slate-900/40 border-slate-900 hover:border-slate-800 text-slate-300";
                      
                      if (isAnswerSubmitted) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-950/40 border-rose-500 text-rose-300";
                        } else {
                          btnStyle = "bg-slate-950 border-transparent text-slate-500 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={option.id}
                          disabled={isAnswerSubmitted}
                          onClick={() => handleSelectOption(option)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs transition duration-200 ${btnStyle}`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.text}</span>
                            {isAnswerSubmitted && isCorrect && <Check className="h-4.5 w-4.5 text-emerald-400" />}
                            {isAnswerSubmitted && isSelected && !isCorrect && <X className="h-4.5 w-4.5 text-rose-400" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MCQ Meaning to Word */}
              {questions[currentIndex].type === 'mc-meaning-to-word' && (
                <div className="space-y-4">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-slate-950 border border-slate-900 px-3 py-1 rounded-full">
                    {questions[currentIndex].card.tag}
                  </span>
                  
                  <div>
                    <p className="text-slate-400 text-xs font-semibold">{questions[currentIndex].prompt}</p>
                    <h3 className="text-base font-semibold text-slate-200 mt-2 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-900">{questions[currentIndex].focusText}</h3>
                  </div>

                  <div className="space-y-2.5 pt-4">
                    {questions[currentIndex].options.map((option) => {
                      const isSelected = selectedOptionId === option.id;
                      const isCorrect = option.isCorrect;
                      let btnStyle = "bg-slate-900/40 border-slate-900 hover:border-slate-800 text-slate-300";
                      
                      if (isAnswerSubmitted) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-950/40 border-rose-500 text-rose-300";
                        } else {
                          btnStyle = "bg-slate-950 border-transparent text-slate-500 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={option.id}
                          disabled={isAnswerSubmitted}
                          onClick={() => handleSelectOption(option)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs transition duration-200 ${btnStyle}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{option.text}</span>
                            {isAnswerSubmitted && isCorrect && <Check className="h-4.5 w-4.5 text-emerald-400" />}
                            {isAnswerSubmitted && isSelected && !isCorrect && <X className="h-4.5 w-4.5 text-rose-400" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fill-in-the-blank */}
              {questions[currentIndex].type === 'fill-blank' && (
                <div className="space-y-4">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-slate-950 border border-slate-900 px-3 py-1 rounded-full">
                    {questions[currentIndex].card.tag}
                  </span>
                  
                  <div>
                    <p className="text-slate-400 text-xs font-semibold">{questions[currentIndex].prompt}</p>
                    <p className="text-base italic text-slate-200 mt-2 bg-slate-950/40 p-4 rounded-xl border border-slate-900 leading-relaxed font-serif">
                      "{questions[currentIndex].sentence}"
                    </p>
                  </div>

                  <form onSubmit={handleSubmitFill} className="space-y-3 pt-2">
                    <input
                      type="text"
                      disabled={isAnswerSubmitted}
                      value={fillAnswer}
                      onChange={(e) => setFillAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 text-sm focus:outline-none focus:border-accent-500 font-semibold"
                    />

                    {!isAnswerSubmitted && (
                      <button
                        type="submit"
                        disabled={!fillAnswer.trim()}
                        className="w-full bg-accent-600 hover:bg-accent-500 text-white font-bold py-2.5 rounded-xl text-xs transition disabled:opacity-50"
                      >
                        Submit Answer
                      </button>
                    )}
                  </form>

                  {isAnswerSubmitted && (
                    <div className={`p-4 rounded-xl border flex items-start gap-2.5 ${
                      isAnswerCorrect ? 'bg-emerald-950/20 border-emerald-900 text-emerald-300' : 'bg-rose-950/20 border-rose-900 text-rose-300'
                    }`}>
                      {isAnswerCorrect ? (
                        <Check className="h-5 w-5 text-emerald-400 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-rose-400 mt-0.5" />
                      )}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wide">
                          {isAnswerCorrect ? 'Correct!' : 'Incorrect'}
                        </h4>
                        <p className="text-xs mt-1 text-slate-300">
                          Correct word: <span className="font-bold text-white underline select-all">{questions[currentIndex].card.word}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">Meaning: {questions[currentIndex].card.meaning}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Word Matching Game Layout */}
              {questions[currentIndex].type === 'matching' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-white">Word Matching Game</h3>
                    <span className="text-xs text-slate-400 font-medium">Pairs matched: {matchedIds.size} / 5</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Column - Words */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Words</h4>
                      {matchingWords.map((w) => {
                        const isSelected = selectedWordId === w.id;
                        const isMatched = matchedIds.has(w.id);
                        
                        let cardStyle = "bg-slate-900/40 border-slate-900 hover:border-slate-800 text-white";
                        if (isMatched) {
                          cardStyle = "bg-emerald-950/20 border-emerald-900 text-slate-500 opacity-60 pointer-events-none";
                        } else if (isSelected) {
                          cardStyle = mismatchFlash
                            ? "bg-rose-950/30 border-rose-600 text-rose-300 animate-pulse"
                            : "bg-accent-950/20 border-accent-600 text-accent-300 shadow-md shadow-accent-950/25";
                        }

                        return (
                          <button
                            key={w.id}
                            disabled={isMatched}
                            onClick={() => handleWordMatchClick(w.id)}
                            className={`w-full text-center p-3 rounded-xl border text-xs font-bold transition duration-150 cursor-pointer ${cardStyle}`}
                          >
                            <span>{w.word}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Column - Meanings */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Meanings</h4>
                      {matchingMeanings.map((m) => {
                        const isSelected = selectedMeaningId === m.id;
                        const isMatched = matchedIds.has(m.id);
                        
                        let cardStyle = "bg-slate-900/40 border-slate-900 hover:border-slate-800 text-slate-300";
                        if (isMatched) {
                          cardStyle = "bg-emerald-950/20 border-emerald-900 text-slate-500 opacity-60 pointer-events-none";
                        } else if (isSelected) {
                          cardStyle = mismatchFlash
                            ? "bg-rose-950/30 border-rose-600 text-rose-300 animate-pulse"
                            : "bg-accent-950/20 border-accent-600 text-accent-300 shadow-md shadow-accent-950/25";
                        }

                        return (
                          <button
                            key={m.id}
                            disabled={isMatched}
                            onClick={() => handleMeaningMatchClick(m.id)}
                            className={`w-full text-left p-3 rounded-xl border text-[11px] leading-snug transition duration-150 cursor-pointer ${cardStyle}`}
                          >
                            <span>{m.meaning}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {mismatchFlash && (
                    <div className="text-center text-xs font-semibold text-rose-400 animate-pulse">
                      Mismatch! Selection reset.
                    </div>
                  )}
                </div>
              )}

              {/* Show dictionary references on answered question */}
              {isAnswerSubmitted && questions[currentIndex].type !== 'matching' && (
                <div className="pt-4 border-t border-slate-900 space-y-3.5">
                  {/* Dictionary lookups */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Check definitions:</span>
                    {dictionaries.map((dict) => (
                      <a
                        key={dict.name}
                        href={getDictUrl(dict.url, questions[currentIndex].card.word)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white bg-slate-900 py-1.5 px-3 rounded-lg border border-slate-850 transition"
                      >
                        {dict.name} <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>

                  {/* Next Question button */}
                  <button
                    onClick={handleNextQuestion}
                    className="w-full flex items-center justify-center gap-1 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Abort button inside active quiz */}
          <div className="text-center">
            <button
              onClick={() => {
                if (confirm("Are you sure you want to stop this quiz? Your active session progress will not be logged.")) {
                  setQuizStarted(false);
                }
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-300"
            >
              Stop Quiz
            </button>
          </div>

        </div>
      )}

      {/* Quiz Finished Summary View */}
      {quizFinished && (
        <div className="glass rounded-2xl p-6 border-slate-800 text-left max-w-xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center space-y-3">
            <div className="mx-auto h-16 w-16 bg-emerald-950/40 border border-emerald-900 rounded-2xl flex items-center justify-center text-emerald-400 animate-bounce">
              <Award className="h-9 w-9 text-emerald-400" />
            </div>
            
            <h3 className="text-2xl font-extrabold text-white tracking-tight">Quiz Finished!</h3>
            
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-extrabold text-white">{userScore}</span>
              <span className="text-slate-400 font-bold text-xl">/ {questions.length}</span>
            </div>
            
            <p className="text-slate-400 text-xs">
              Score: <span className="font-bold text-white">{Math.round((userScore / questions.length) * 100)}%</span>. 
              Quiz stats successfully logged to your study dashboard and streak updated!
            </p>
          </div>

          {/* Detailed Performance Review Section */}
          <div className="pt-4 border-t border-slate-900 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Question Breakdown</h4>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400">
                <input
                  type="checkbox"
                  checked={showOnlyMissedRetry}
                  onChange={(e) => setShowOnlyMissedRetry(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-accent-500 focus:ring-accent-500 cursor-pointer h-4 w-4"
                />
                Show missed words only
              </label>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {quizResults
                .filter(res => !showOnlyMissedRetry || !res.correct)
                .map((res, index) => (
                  <div key={index} className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl flex items-start justify-between text-xs gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 select-all">{res.card.word}</span>
                        <span className="text-[9.5px] text-slate-500 italic uppercase">({res.card.tag})</span>
                      </div>
                      <p className="text-slate-400 leading-normal">{res.card.meaning}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {res.correct ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/50">
                          <Check className="h-3 w-3" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/20 px-2 py-0.5 rounded border border-rose-900/50">
                          <X className="h-3 w-3" /> Missed
                        </span>
                      )}
                      
                      <div className="flex gap-1">
                        {dictionaries.slice(0, 2).map((dict) => (
                          <a
                            key={dict.name}
                            href={getDictUrl(dict.url, res.card.word)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] font-bold text-slate-400 hover:text-white bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900 transition flex items-center gap-0.5"
                          >
                            {dict.name.slice(0, 4)} <ExternalLink className="h-2 w-2" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {userScore < questions.length ? (
              <button
                onClick={handleRetryMissed}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-850 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Retry Missed ({questions.length - userScore})
              </button>
            ) : (
              <button
                onClick={() => setQuizStarted(false)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-850 font-bold py-2.5 rounded-xl text-xs transition"
              >
                Start New Quiz
              </button>
            )}
            
            <button
              onClick={() => setQuizStarted(false)}
              className="bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1"
            >
              Finish & Return
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
