let pause = false;

function setup() {
  lightBlue = color(38, 217, 202);
  mediumBlue = color(0, 163, 208);
  darkBlue = color(16, 114, 189);

  Canvas(CANVAS_WIDTH, CANVAS_HEIGHT);

  setupCells();

  //   debug grid
  // const prefillGrid = [
  //   // 4
  //   [5,2], [6,2], [5,3], [4,4], [5,4], [6,4],
  //   // 0
  //   [4,6], [5,6], [6,6], [4,7], [6,7], [4,8], [5,8], [6,8],
  //   // 4
  //   [5,10], [6,10], [5,11], [4,12], [5,12], [6,12],
  // ].forEach(cell => {
  //   grid[cell[1]][cell[0]].active = true;
  // });

  //   debug shape
  // debugShape = "LeftAngle";
  
  // gameOver = true;

  spawnPlayer();
}

function draw() {  
  if (kb.presses("p")) pause = !pause;
  if (pause) return;

  clear();
  background(255);

  drawGrid();

  // if (kb.presses("arrowUp")) moveUp();
  if (kb.presses("arrowDown")) moveToBottom();
  if (kb.presses("arrowLeft")) moveLeft();
  if (kb.presses("arrowRight")) moveRight();
  if (kb.presses("a")) rotateLeft();
  if (kb.presses("d")) rotateRight();

  if (gameOver) return;

  if (frameCount % autoMoveIntervalFrequency === autoMoveIntervalFrame) {
    if (isPlayerAtBottom()) {
      embedCells(getActiveShapeCells(player.shapeArray, player));
      respawnPlayer();
      increaseGameSpeed();
    } else moveDown();
  }
  
  particles = particles.filter(p => !p.finished());
  particles.forEach(p => {
    p.update();
    p.show();
  })
}
