import seedVocab from './vocab.json';
import seedClauses from './clauses.json';
import seedGrammar from './grammar.json';
import seedRubrics from './rubrics.json';
import seedErrors from './errors.json';
import seedExternalLinks from './external-links.json';
import seedImmersionSources from './immersion-sources.json';
import { getTodayStr } from '../utils/srs';

// Storage keys
const KEYS = {
  VOCAB: 'eng_study_vocab',
  PROGRESS: 'eng_study_progress',
  STUDY_LOGS: 'eng_study_study_logs', // for focused study hours
  IMMERSION_LOGS: 'eng_study_immersion_logs',
  WRITING_LOGS: 'eng_study_writing_logs',
  CLAUSE_LOGS: 'eng_study_clause_logs',
  QUIZ_LOGS: 'eng_study_quiz_logs'
};

/**
 * Get yesterday's date string in YYYY-MM-DD
 */
function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

/**
 * Determines if a given date string falls in the current ISO week (Mon-Sun).
 */
export function isDateInCurrentWeek(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  
  // getDay() is 0 for Sunday, 1 for Monday, etc.
  const day = now.getDay();
  // Calculate offset to get to Monday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return d >= monday && d <= sunday;
}

/**
 * Initializes localStorage with seed data if it doesn't already exist.
 */
export function initializeDB() {
  if (!localStorage.getItem(KEYS.VOCAB)) {
    localStorage.setItem(KEYS.VOCAB, JSON.stringify(seedVocab));
  }
  
  if (!localStorage.getItem(KEYS.PROGRESS)) {
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify({
      phase: 1, // 1, 2, or 3
      phaseOverridden: false,
      startDate: getTodayStr(),
      milestones: {
        phase1: false, // End of Month 2: read business articles 80% comprehension
        phase2: false, // End of Month 4: draft simple NDA unaided
        phase3: false  // End of Month 6: read SaaS/AI agreement and audit risk
      },
      streak: 0,
      lastActiveDate: null
    }));
  }

  if (!localStorage.getItem(KEYS.STUDY_LOGS)) {
    localStorage.setItem(KEYS.STUDY_LOGS, JSON.stringify([]));
  }

  if (!localStorage.getItem(KEYS.IMMERSION_LOGS)) {
    localStorage.setItem(KEYS.IMMERSION_LOGS, JSON.stringify([]));
  }

  if (!localStorage.getItem(KEYS.WRITING_LOGS)) {
    localStorage.setItem(KEYS.WRITING_LOGS, JSON.stringify([]));
  }

  if (!localStorage.getItem(KEYS.CLAUSE_LOGS)) {
    localStorage.setItem(KEYS.CLAUSE_LOGS, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(KEYS.QUIZ_LOGS)) {
    localStorage.setItem(KEYS.QUIZ_LOGS, JSON.stringify([]));
  }
}

// Vocabulary operations
export function getVocab() {
  initializeDB();
  return JSON.parse(localStorage.getItem(KEYS.VOCAB));
}

export function saveVocab(vocab) {
  localStorage.setItem(KEYS.VOCAB, JSON.stringify(vocab));
}

export function addCustomWord(wordData) {
  const vocab = getVocab();
  const newCard = {
    id: `custom-${Date.now()}`,
    word: wordData.word.trim(),
    meaning: wordData.meaning.trim(),
    example: wordData.example.trim(),
    tag: wordData.tag,
    source: wordData.source?.trim() || 'User Added',
    sightings: wordData.sightings || 0,
    srs: {
      interval: 0,
      repetition: 0,
      easeFactor: 2.5,
      dueDate: null
    }
  };
  vocab.push(newCard);
  saveVocab(vocab);
  return newCard;
}

// Progress and Streak operations
export function getProgress() {
  initializeDB();
  const progress = JSON.parse(localStorage.getItem(KEYS.PROGRESS));
  
  // Calculate automated phase if not overridden
  if (!progress.phaseOverridden) {
    const start = new Date(progress.startDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Phase 1: Weeks 0-8 (0-56 days)
    // Phase 2: Weeks 8-16 (57-112 days)
    // Phase 3: Weeks 16+ (113+ days)
    if (diffDays <= 56) {
      progress.phase = 1;
    } else if (diffDays <= 112) {
      progress.phase = 2;
    } else {
      progress.phase = 3;
    }
  }

  // Check if streak is broken (last active date was before yesterday)
  const todayStr = getTodayStr();
  const yesterdayStr = getYesterdayStr();
  if (progress.lastActiveDate && progress.lastActiveDate !== todayStr && progress.lastActiveDate !== yesterdayStr) {
    progress.streak = 0;
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
  }

  return progress;
}

export function saveProgress(progress) {
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
}

export function updateMilestone(milestoneId, completed) {
  const progress = getProgress();
  progress.milestones[milestoneId] = completed;
  saveProgress(progress);
  return progress;
}

export function overridePhase(phaseNum) {
  const progress = getProgress();
  progress.phase = phaseNum;
  progress.phaseOverridden = true;
  saveProgress(progress);
  return progress;
}

/**
 * Helper to record activity and update streak
 */
export function recordActivity() {
  const progress = getProgress();
  const todayStr = getTodayStr();
  const yesterdayStr = getYesterdayStr();

  if (progress.lastActiveDate === todayStr) {
    // Already active today, streak stays the same
    return progress;
  } else if (progress.lastActiveDate === yesterdayStr) {
    // Active yesterday, increment streak
    progress.streak += 1;
  } else {
    // Streak broken or first activity, start at 1
    progress.streak = 1;
  }
  
  progress.lastActiveDate = todayStr;
  saveProgress(progress);
  return progress;
}

// Logging operations (Focused Study & Immersion)
export function getStudyLogs() {
  initializeDB();
  return JSON.parse(localStorage.getItem(KEYS.STUDY_LOGS));
}

export function addStudyLog(minutes, description, focusArea = 'vocab') {
  const logs = getStudyLogs();
  const newLog = {
    id: `study-${Date.now()}`,
    date: getTodayStr(),
    minutes: parseInt(minutes) || 0,
    description: description.trim(),
    focusArea // vocab, grammar, writing, legal
  };
  logs.push(newLog);
  localStorage.setItem(KEYS.STUDY_LOGS, JSON.stringify(logs));
  recordActivity();
  return newLog;
}

export function getImmersionLogs() {
  initializeDB();
  return JSON.parse(localStorage.getItem(KEYS.IMMERSION_LOGS));
}

export function addImmersionLog(sourceId, minutes, phrasesCaptured = []) {
  const logs = getImmersionLogs();
  const newLog = {
    id: `immersion-${Date.now()}`,
    date: getTodayStr(),
    sourceId,
    minutes: parseInt(minutes) || 0,
    phrasesCaptured // array of { phrase: string, meaning: string }
  };
  logs.push(newLog);
  localStorage.setItem(KEYS.IMMERSION_LOGS, JSON.stringify(logs));
  recordActivity();
  return newLog;
}

// Writing practice logs
export function getWritingLogs() {
  initializeDB();
  return JSON.parse(localStorage.getItem(KEYS.WRITING_LOGS));
}

export function addWritingLog(promptId, text, wordCount, rubricAnswers) {
  const logs = getWritingLogs();
  const newLog = {
    id: `writing-${Date.now()}`,
    date: getTodayStr(),
    promptId,
    text,
    wordCount,
    rubricAnswers // object of item_id -> boolean
  };
  logs.push(newLog);
  localStorage.setItem(KEYS.WRITING_LOGS, JSON.stringify(logs));
  recordActivity();
  return newLog;
}

// Clause analysis logs
export function getClauseLogs() {
  initializeDB();
  return JSON.parse(localStorage.getItem(KEYS.CLAUSE_LOGS));
}

export function addClauseLog(clauseText, checklistAnswers, matchingClauseId) {
  const logs = getClauseLogs();
  const newLog = {
    id: `clause-${Date.now()}`,
    date: getTodayStr(),
    clauseText,
    checklistAnswers, // object of questions -> answers
    matchingClauseId
  };
  logs.push(newLog);
  localStorage.setItem(KEYS.CLAUSE_LOGS, JSON.stringify(logs));
  recordActivity();
  return newLog;
}

// Quiz logs
export function getQuizLogs() {
  initializeDB();
  return JSON.parse(localStorage.getItem(KEYS.QUIZ_LOGS)) || [];
}

export function addQuizLog(score, total, tag, type) {
  const logs = getQuizLogs();
  const newLog = {
    id: `quiz-${Date.now()}`,
    date: getTodayStr(),
    score,
    total,
    tag,
    type
  };
  logs.push(newLog);
  localStorage.setItem(KEYS.QUIZ_LOGS, JSON.stringify(logs));
  recordActivity();
  return newLog;
}

// Weekly hour aggregation
export function getWeeklyHours() {
  const studyLogs = getStudyLogs();
  const immersionLogs = getImmersionLogs();
  
  let focusedMinutes = 0;
  let immersionMinutes = 0;
  
  studyLogs.forEach(log => {
    if (isDateInCurrentWeek(log.date)) {
      focusedMinutes += log.minutes;
    }
  });
  
  immersionLogs.forEach(log => {
    if (isDateInCurrentWeek(log.date)) {
      immersionMinutes += log.minutes;
    }
  });
  
  return {
    focused: parseFloat((focusedMinutes / 60).toFixed(1)),
    immersion: parseFloat((immersionMinutes / 60).toFixed(1)),
    focusedTarget: 6.5, // 6-7 hours midpoint
    immersionTarget: 4.5, // 4-5 hours midpoint
    total: parseFloat(((focusedMinutes + immersionMinutes) / 60).toFixed(1))
  };
}

// Static Seed Data Getters (Read-only reference)
export function getStaticClauses() {
  return seedClauses;
}

export function getStaticGrammar() {
  return seedGrammar;
}

export function getStaticRubrics() {
  return seedRubrics;
}

export function getStaticErrors() {
  return seedErrors;
}

export function getExternalLinks() {
  return seedExternalLinks;
}

export function getImmersionSources() {
  return seedImmersionSources;
}

// JSON Backup / Import & Export
export function exportData() {
  const data = {
    vocab: getVocab(),
    progress: getProgress(),
    studyLogs: getStudyLogs(),
    immersionLogs: getImmersionLogs(),
    writingLogs: getWritingLogs(),
    clauseLogs: getClauseLogs(),
    quizLogs: getQuizLogs()
  };
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.vocab && Array.isArray(data.vocab)) {
      localStorage.setItem(KEYS.VOCAB, JSON.stringify(data.vocab));
    }
    if (data.progress) {
      localStorage.setItem(KEYS.PROGRESS, JSON.stringify(data.progress));
    }
    if (data.studyLogs && Array.isArray(data.studyLogs)) {
      localStorage.setItem(KEYS.STUDY_LOGS, JSON.stringify(data.studyLogs));
    }
    if (data.immersionLogs && Array.isArray(data.immersionLogs)) {
      localStorage.setItem(KEYS.IMMERSION_LOGS, JSON.stringify(data.immersionLogs));
    }
    if (data.writingLogs && Array.isArray(data.writingLogs)) {
      localStorage.setItem(KEYS.WRITING_LOGS, JSON.stringify(data.writingLogs));
    }
    if (data.clauseLogs && Array.isArray(data.clauseLogs)) {
      localStorage.setItem(KEYS.CLAUSE_LOGS, JSON.stringify(data.clauseLogs));
    }
    if (data.quizLogs && Array.isArray(data.quizLogs)) {
      localStorage.setItem(KEYS.QUIZ_LOGS, JSON.stringify(data.quizLogs));
    }
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

export function resetAllData() {
  localStorage.removeItem(KEYS.VOCAB);
  localStorage.removeItem(KEYS.PROGRESS);
  localStorage.removeItem(KEYS.STUDY_LOGS);
  localStorage.removeItem(KEYS.IMMERSION_LOGS);
  localStorage.removeItem(KEYS.WRITING_LOGS);
  localStorage.removeItem(KEYS.CLAUSE_LOGS);
  localStorage.removeItem(KEYS.QUIZ_LOGS);
  initializeDB();
}

