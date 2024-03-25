const PLAYER_SIZE = CELL_SIZE * 4;
const PLAYER_RENDER_OFFSET = PLAYER_SIZE / 2 + CELL_MARGIN / 2;
const PLAYER_SPEED = 10;

let player;

const spawnPlayer = () => {
  const rotation = ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];
  const shape =
    debugShape ?? ShapeNames[Math.floor(Math.random() * ShapeNames.length)];
  const shapeArray = Shapes[shape][rotation];
  const gridX = 3;
  let gridY = 0;
  //   check if every row is greater than 0
  if (getActiveShapeCells(shapeArray).every(({ gridY: row }) => row))
    gridY = -1;
  // before spawning player, check if game is over
  if (hasCollision({ shapeArray, gridX, gridY })) {
    endGame();
    return;
  }

  player = {
    rotation: rotation,
    gridX,
    gridY,
    sprite: new Sprite(
      CANVAS_WIDTH / 2 - PLAYER_RENDER_OFFSET,
      gridY * CELL_SIZE
    ),
    shape,
    shapeArray,
    fadeColor: 1,
  };

  player.sprite.width = PLAYER_SIZE;
  player.sprite.height = PLAYER_SIZE;
  player.sprite.draw = drawPlayer;
  player.sprite.removeColliders();
};

const respawnPlayer = () => {
  player.sprite.remove();
  spawnPlayer();
};

const getClosestFloorCell = () => {
  //   get bottom-most active shape cells for each shape col
  const relevantShapeCells = getBottomCellForEachColumn(
    player.shapeArray,
    player
  );

  //   no matter what, if a part of the shape is touching the floor, return that
  const cellTouchingBorder = relevantShapeCells.find(
    ({ gridY }) => gridY === GRID_ROWS - 1
  );
  if (cellTouchingBorder) {
    return {
      cell: { gridX: cellTouchingBorder.gridX, gridY: GRID_ROWS },
      distance: 1,
    };
  }

  const activeCols = relevantShapeCells.map(({ gridX }) => gridX);
  //   get highest available grid cells
  const relevantGridCells = getActiveGridCells().filter((cell) => {
    const shapeCellsInCol = relevantShapeCells.filter(
      ({ gridX }) => gridX === cell.gridX
    );
    return (
      shapeCellsInCol.length &&
      shapeCellsInCol.every(({ gridY }) => gridY < cell.gridY)
    );
  });

  if (!relevantGridCells.length) {
    //     get bottom-most cell of shape
    const lowestCell = relevantShapeCells.reduce(
      (lowest, curr) => (lowest.gridY < curr.gridY ? curr : lowest),
      relevantShapeCells[0]
    );
    return {
      cell: { gridX: lowestCell.gridX, gridY: GRID_ROWS },
      distance: GRID_ROWS - lowestCell.gridY,
    };
  }

  //   get distances between the bottom-most shape cell with highest active grid cell
  let closestGridCell, distance;
  relevantShapeCells.forEach((shapeCell) => {
    const gridCellsCol = relevantGridCells.filter(
      ({ gridX }) => gridX === shapeCell.gridX
    );
    const closestGridCellY = min(gridCellsCol.map(({ gridY }) => gridY));
    const currCellDistance = closestGridCellY - shapeCell.gridY;
    const currCell = gridCellsCol.find(
      ({ gridY }) => gridY === closestGridCellY
    );

    if (!closestGridCell) {
      closestGridCell = currCell;
      distance = currCellDistance;
    } else if (distance > currCellDistance) {
      closestGridCell = currCell;
      distance = currCellDistance;
    }
    // if distances are equal, use highest one
    else if (
      distance === currCellDistance &&
      closestGridCell.gridX > currCell.gridX
    ) {
      closestGridCell = currCell;
      distance = currCellDistance;
    }
  });

  return { cell: closestGridCell, distance };
};

//   check if player is at bottom
const isPlayerAtBottom = () => getClosestFloorCell().distance === 1;

const move = (speed = PLAYER_SPEED) => {
  if (!player) return;
  const { x, y } = getPos(player.gridX, player.gridY);
  return player.sprite.moveTo(x, y, speed);
};

const moveUp = () => {
  if (!player) return;
  const nextRow = player.gridY - 1;
  if (hasCollision({ ...player, gridY: nextRow })) return;
  player.gridY = nextRow;
  move();
};

const moveDown = (a) => {
  if (!player) return;
  const nextRow = player.gridY + 1;
  if (hasCollision({ ...player, gridY: nextRow })) return;
  player.gridY = nextRow;
  move();
};

const moveRight = () => {
  if (!player || frameCount <= lockAllActionsFrame) return;
  const nextCol = player.gridX + 1;
  if (hasCollision({ ...player, gridX: nextCol })) return;

  manualDownButtonLockedFrame = frameCount + 2;
  player.gridX = nextCol;
  move();
};

const moveLeft = () => {
  if (!player || frameCount <= lockAllActionsFrame) return;
  const nextCol = player.gridX - 1;
  if (hasCollision({ ...player, gridX: nextCol })) return;
  
  manualDownButtonLockedFrame = frameCount + 2;
  player.gridX = nextCol;
  move();
};

const moveToBottom = () => {
  const { distance } = getClosestFloorCell();

  if(frameCount <= lockAllActionsFrame || frameCount <= manualDownButtonLockedFrame) return;
  lockAllActionsFrame = frameCount + distance + 3;

  //   move down, but not beyond the bottom of the screen
  const heightOfShape = getHeightOfShape(player.shapeArray, player);
  player.gridY = min(player.gridY + distance - 1, GRID_ROWS - heightOfShape);

  //   restart frame counting so that interval starts with this move
  autoMoveIntervalFrame = (frameCount % autoMoveIntervalFrequency) - 1;
  if (autoMoveIntervalFrame < 0)
    autoMoveIntervalFrame = autoMoveIntervalFrequency - 1;

  //   move player to new position quickly and embed/restart
  move(PLAYER_SPEED * distance).then(() => {
    embedCells(getActiveShapeCells(player.shapeArray, player), () => {
      addSpeedBonus(distance - 1);
    });
    increaseGameSpeed();
    respawnPlayer();
  });
};

const drawPlayer = () => {
  const offset = CELL_SIZE / 2 + CELL_MARGIN / 2;
  drawShape(player.shapeArray, offset, offset, player.fadeColor);
  if (player.fadeColor < 1) player.fadeColor += COLOR_FADE_SPEED;

  // debug border
  if (DEBUG_MODE) {
    noFill();
    strokeWeight(1);
    stroke(0);
    rect(PLAYER_RENDER_OFFSET, PLAYER_RENDER_OFFSET, PLAYER_SIZE, PLAYER_SIZE);
  }
};

const rotatePlayer = (rotation = player.rotation) => {
  player.rotation = rotation;
  player.shapeArray = rotate(player.shape, rotation);
  player.fadeColor = 0;
};

// check if rotated form is offscreen and can be pushed into view
// returns true if safe, false if unsafe to perform rotation
const adjustPositionFromRotation = (rotation) => {
  const shapeArray = rotate(player.shape, rotation);
  const cellsToCheck = getActiveShapeCells(shapeArray, player);
  const newPositionData = {
    shapeArray,
    gridX: player.gridX,
    gridY: player.gridY,
  };

  // check if against a border, shift if necessary and allowed
  const needToMoveUp = cellsToCheck.some(({ gridY }) => gridY >= GRID_ROWS);
  if (needToMoveUp) return false; // do not allow shifting up
  const needToMoveRight = cellsToCheck.some(({ gridX }) => gridX === -1);
  const needToMoveLeft = cellsToCheck.some(({ gridX }) => gridX >= GRID_COLS);
  const needToMoveDown = cellsToCheck.some(({ gridY }) => gridY === -1);
  const needToMove = needToMoveRight || needToMoveLeft || needToMoveDown;
  if (!needToMove) {
    // if borders are safe, check for cell collisions
    return !hasCollision(newPositionData);
  }

  // shift shape 1 left or right and check again if it is safe
  // if so, keep the position and rotation

  if (needToMoveRight || needToMoveLeft)
    newPositionData.gridX += needToMoveRight ? 1 : -1;
  if (needToMoveDown || needToMoveUp)
    newPositionData.gridY += needToMoveDown ? 1 : -1;

  //   return false if it collides
  if (hasCollision(newPositionData)) return false;

  //   save the new position and return true ("safe")
  player.gridX = newPositionData.gridX;
  player.gridY = newPositionData.gridY;
  move();
  return true;
};

const rotateLeft = () => {
  if (!player) return;
  const newRotation = player.rotation === 0 ? 270 : player.rotation - 90;
  const isSafeMove = adjustPositionFromRotation(newRotation);
  if (!isSafeMove) return;

  rotatePlayer(newRotation);
};

const rotateRight = () => {
  if (!player) return;
  const newRotation = player.rotation === 270 ? 0 : player.rotation + 90;
  const isSafeMove = adjustPositionFromRotation(newRotation);
  if (!isSafeMove) return;

  rotatePlayer(newRotation);
};
