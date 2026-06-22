/**
 * Helper to shuffle an array (Fisher-Yates)
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates distractors (wrong options) for multiple choice questions.
 * Tries to find cards with the same tag. If fewer than 3, fills with cards from other tags.
 * 
 * @param {Object} targetCard - The target card being tested
 * @param {Array} vocab - The entire vocabulary deck
 * @param {number} count - Number of distractors needed (default 3)
 */
export function getDistractors(targetCard, vocab, count = 3) {
  // Filter other cards
  const otherCards = vocab.filter(card => card.id !== targetCard.id);
  
  // Cards with same tag
  let sameTagCards = otherCards.filter(card => card.tag === targetCard.tag);
  
  if (sameTagCards.length >= count) {
    return shuffleArray(sameTagCards).slice(0, count);
  }
  
  // Fallback: fill up with cards from other tags
  const differentTagCards = otherCards.filter(card => card.tag !== targetCard.tag);
  const combined = [...sameTagCards, ...shuffleArray(differentTagCards)];
  return combined.slice(0, count);
}

/**
 * Formats a fill-in-the-blank sentence by hiding the target word.
 * Uses case-insensitive and whole-word regex matching.
 * 
 * @param {string} word - The vocabulary word
 * @param {string} sentence - The example sentence
 * @returns {string} The sentence with the word replaced by "_____"
 */
export function blankOutWord(word, sentence) {
  // Clean word for regex
  const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match whole word case-insensitively
  const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
  return sentence.replace(regex, '_____');
}

/**
 * Generates quiz questions based on selected tag, count, and type.
 * 
 * @param {Array} vocab - List of vocabulary cards
 * @param {string} tag - Tag filter ('all' or specific tag)
 * @param {number} qCount - Number of questions to generate
 * @param {string} qType - 'mc-word-to-meaning' | 'mc-meaning-to-word' | 'fill-blank' | 'matching' | 'mixed'
 */
export function generateQuiz(vocab, tag, qCount = 5, qType = 'mixed') {
  let deck = [...vocab];
  
  // Filter by tag
  if (tag !== 'all') {
    deck = deck.filter(card => card.tag === tag);
  }
  
  if (deck.length === 0) {
    return [];
  }
  
  // Shuffle cards and take up to qCount
  const selectedCards = shuffleArray(deck).slice(0, qCount);
  
  // For 'matching' quiz, we handle it as a single question containing matching pairs
  if (qType === 'matching') {
    return [{
      type: 'matching',
      cards: selectedCards, // Cards to match (normally N, e.g. 5)
    }];
  }
  
  // Generate individual questions for other types
  const questions = selectedCards.map((card, index) => {
    // Determine active type for this question if 'mixed' is selected
    let activeType = qType;
    if (qType === 'mixed') {
      const types = ['mc-word-to-meaning', 'mc-meaning-to-word', 'fill-blank'];
      // If card example sentence is empty, don't use fill-blank
      const allowedTypes = card.example ? types : ['mc-word-to-meaning', 'mc-meaning-to-word'];
      activeType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    }
    
    if (activeType === 'mc-word-to-meaning') {
      const distractors = getDistractors(card, vocab, 3);
      const options = shuffleArray([
        { id: card.id, text: card.meaning, isCorrect: true },
        ...distractors.map(d => ({ id: d.id, text: d.meaning, isCorrect: false }))
      ]);
      
      return {
        id: `q-${index}-${Date.now()}`,
        type: 'mc-word-to-meaning',
        card: card,
        prompt: `Choose the correct meaning for the word:`,
        focusText: card.word,
        options,
        correctOptionId: card.id
      };
    } 
    
    else if (activeType === 'mc-meaning-to-word') {
      const distractors = getDistractors(card, vocab, 3);
      const options = shuffleArray([
        { id: card.id, text: card.word, isCorrect: true },
        ...distractors.map(d => ({ id: d.id, text: d.word, isCorrect: false }))
      ]);
      
      return {
        id: `q-${index}-${Date.now()}`,
        type: 'mc-meaning-to-word',
        card: card,
        prompt: `Which word matches this meaning?`,
        focusText: card.meaning,
        options,
        correctOptionId: card.id
      };
    } 
    
    else {
      // fill-blank
      const blankedSentence = blankOutWord(card.word, card.example);
      return {
        id: `q-${index}-${Date.now()}`,
        type: 'fill-blank',
        card: card,
        prompt: `Fill in the blank using the correct word:`,
        sentence: blankedSentence,
        correctAnswer: card.word.trim()
      };
    }
  });
  
  return questions;
}
