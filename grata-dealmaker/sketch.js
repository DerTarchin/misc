let pause = true;

const reset = () => {
  gameOver = false;
  pause = false;
  score = 0;
  player = undefined;
  autoMoveIntervalFrequency = 30;
  autoMoveIntervalFrame = 0;
  manualDownButtonLockedFrame = 0;
  lockAllActionsFrame = 0;
  particles = [];
  resetGrid();
  setupCells();
  spawnPlayer();
}

function setup() {
  lightBlue = color(38, 217, 202);
  mediumBlue = color(0, 163, 208);
  darkBlue = color(16, 114, 189);

  Canvas(CANVAS_WIDTH, CANVAS_HEIGHT);

  reset();
  pause = true;

  // (allows for controls from grata-search)
  window.addEventListener(
    "message",
    (e) => {
      if(e.data?.src !== POST_MESSAGE_ID) return;
      const { action, value } = e.data;
      if(action === 'pause') pause = value;
      if(action === 'reset') reset();
    },
    false,
  );
}

function mousePressed() {
  pause = false
}

function draw() {  
  // if (kb.presses("p")) pause = !pause;
  clear();
  background(255);
  drawGrid();

  particles = particles.filter(p => !p.finished());
  particles.forEach(p => {
    p.update();
    p.show();
  })
  
  if (gameOver || !player || pause) return;

  // if (kb.presses("arrowUp")) moveUp();
  if (kb.presses("arrowDown")) moveToBottom();
  if (kb.presses("arrowLeft")) moveLeft();
  if (kb.presses("arrowRight")) moveRight();
  if (kb.presses("a")) rotateLeft();
  if (kb.presses("d")) rotateRight();

  if (frameCount % autoMoveIntervalFrequency === autoMoveIntervalFrame) {
    if (isPlayerAtBottom()) {
      embedCells(getActiveShapeCells(player.shapeArray, player));
      respawnPlayer();
      increaseGameSpeed();
    } else moveDown();
  }
}
