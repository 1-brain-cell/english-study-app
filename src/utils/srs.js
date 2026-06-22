/**
 * SM-2 Spaced Repetition Algorithm
 * Updates ease factor, repetition count, interval, and next due date based on user rating.
 * 
 * @param {Object} card - The vocabulary card object
 * @param {number} q - Quality of response (0-5)
 * @returns {Object} Updated card object
 */
export function sm2(card, q) {
  const updated = JSON.parse(JSON.stringify(card));
  
  if (!updated.srs) {
    updated.srs = { interval: 0, repetition: 0, easeFactor: 2.5, dueDate: null };
  }

  // Adjust repetitions and intervals based on quality score
  if (q < 3) {
    updated.srs.repetition = 0;
    updated.srs.interval = 1;
  } else {
    updated.srs.repetition += 1;
    if (updated.srs.repetition === 1) {
      updated.srs.interval = 1;
    } else if (updated.srs.repetition === 2) {
      updated.srs.interval = 6;
    } else {
      updated.srs.interval = Math.round(updated.srs.interval * updated.srs.easeFactor);
    }
  }

  // Adjust ease factor
  updated.srs.easeFactor = Math.max(
    1.3,
    updated.srs.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );

  // Set due date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + updated.srs.interval);
  updated.srs.dueDate = dueDate.toISOString().split('T')[0];

  return updated;
}

/**
 * Returns the current date in YYYY-MM-DD format in local timezone.
 */
export function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Filters and returns vocab cards for today's review session.
 * Includes:
 * 1. Due cards: cards with dueDate <= today
 * 2. New cards: cards that have never been reviewed (dueDate is null), limited by a daily cap.
 * 
 * @param {Array} vocab - List of all vocabulary cards
 * @param {number} newCardCap - Daily cap for new cards (default 15)
 * @returns {Object} { dueCards: Array, newCards: Array, totalReviewable: number }
 */
export function getReviewQueue(vocab, newCardCap = 15) {
  const todayStr = getTodayStr();

  // Due cards are those that have a due date in the past or today
  const dueCards = vocab.filter(card => 
    card.srs && 
    card.srs.dueDate && 
    card.srs.dueDate <= todayStr
  );

  // New cards are those that have never been studied (dueDate is null or srs properties are default 0)
  const newCards = vocab.filter(card => 
    !card.srs || 
    !card.srs.dueDate
  );

  // Take up to newCardCap new cards
  const limitedNewCards = newCards.slice(0, newCardCap);

  return {
    dueCards,
    newCards: limitedNewCards,
    totalReviewable: dueCards.length + limitedNewCards.length,
    allNewCardsCount: newCards.length
  };
}
