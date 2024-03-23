const BASE_ROW_SCORE = 10;
const BASE_BONUS_SCORE = 0.5;
const COMBO_MULTIPLIER = 1;
const BONUS_MULTIPLIER = 0.1;
const SCORE_MULTIPLIER = 1e6;

let score = 0;

const updateScore = (newPoints, type) => {
  score += newPoints;
  // console.log(`+$${formatNumber(newPoints * SCORE_MULTIPLIER, 1)}`);
  // console.log(`Score: $${formatNumber(score * SCORE_MULTIPLIER, 1)}`);
  window.top?.postMessage({ src: POST_MESSAGE_ID, new_score: score, new_points: newPoints, point_type: type }, '*');
};

const addRowScore = (rows) => {
  const multiplier = rows * COMBO_MULTIPLIER;
  updateScore(rows * BASE_ROW_SCORE, 'row');
};

const addSpeedBonus = (distanceMoved) => {
  if(distanceMoved < 4) return;
  const multiplier = distanceMoved * BONUS_MULTIPLIER;
  updateScore(distanceMoved * BASE_BONUS_SCORE * multiplier, 'bonus');
};

const endGame = () => {
  gameOver = true;
  window.top?.postMessage({ src: POST_MESSAGE_ID, action: 'end-game' }, '*');
}
