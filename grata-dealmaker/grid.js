const GRID_COLS = 10;
const GRID_ROWS = 15;
const RECT_SIZE = 30;

const CELL_MARGIN = RECT_SIZE / 8;
const CELL_SIZE = RECT_SIZE + CELL_MARGIN;
const CELL_RADIUS = RECT_SIZE / 4;

const CANVAS_WIDTH = GRID_COLS * CELL_SIZE + CELL_MARGIN;
const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE + CELL_MARGIN;

const GRID_RENDER_OFFSET = CELL_SIZE / 2 + CELL_MARGIN / 2;
const CELL_SPEED = 4;

const getPos = (gridX, gridY, offset = 0) => ({
  x: offset + CELL_SIZE * gridX,
  y: offset + CELL_SIZE * gridY,
});

// array of rows, each with an object for each col
let grid = [];

const newCell = (gridX, gridY) => {
  const { x: startX, y: startY } = getPos(gridX, gridY);
  const cell = {
    gridX,
    gridY,
    sprite: new Sprite(startX, startY),
    colorFade: 1,
  };
  cell.sprite.width = CELL_SIZE;
  cell.sprite.height = CELL_SIZE;
  cell.sprite.draw = () => {
    if (!cell.active && !DEBUG_MODE) return;

    noStroke();
    if (!cell.active) fill("lightgray");
    else fill(lerpColor(mediumBlue, darkBlue, cell.colorFade));
    rect(
      GRID_RENDER_OFFSET,
      GRID_RENDER_OFFSET,
      RECT_SIZE,
      RECT_SIZE,
      CELL_RADIUS
    );

    if (cell.colorFade < 1) cell.colorFade += COLOR_FADE_SPEED;
  };
  cell.sprite.removeColliders();
  return cell;
};

const setupCells = () => {
  for (row = 0; row < GRID_ROWS; row++) {
    grid.push([]);
    for (col = 0; col < GRID_COLS; col++) {
      // grid[row].push({});
      grid[row].push(newCell(col, row));
    }
  }
};

const getActiveGridCells = () => {
  const activeCells = [];
  grid.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col.active) activeCells.push({ gridX: colIndex, gridY: rowIndex });
    });
  });
  return activeCells;
};

const isCellColliding = ({ gridX, gridY }) => {
  //   check bounds
  if (gridX < 0 || gridY < 0) return true;
  if (gridX > GRID_COLS - 1 || gridY > GRID_ROWS - 1) return true;

  //   check active cells
  return grid[gridY][gridX].active;
};

// check each cell of shapeArray for a collision or border hit
const hasCollision = (player) => {
  const { shapeArray, gridX, gridY } = player;
  // get active shape cells
  const cellsToCheck = getActiveShapeCells(shapeArray, { gridX, gridY });

  // check for out-of-bounds cells or cells over existing active grid cells
  if (cellsToCheck.some(isCellColliding)) return true;

  return false;
};

// background grid
const drawGrid = () => {
  stroke(240);
  fill(255);
  for (row = 0; row < GRID_ROWS; row++) {
    for (col = 0; col < GRID_COLS; col++) {
      const y = row * CELL_SIZE + CELL_MARGIN;
      const x = col * CELL_SIZE + CELL_MARGIN;
      rect(x, y, RECT_SIZE, RECT_SIZE, CELL_RADIUS);
    }
  }
};

const shiftCell = (cell, newRow) => {
  const distance = newRow - cell.gridY;
  cell.gridY = newRow;
  const { x, y } = getPos(cell.gridX, newRow);
  if (cell.active) cell.sprite.moveTo(x, y, CELL_SPEED * distance);
  else {
    cell.sprite.x = x;
    cell.sprite.y = y;
  }
};

const collectCompletedRows = () => {
  const completedRows = grid.filter((row) => row.every((cell) => cell.active));
  if (!completedRows.length) return false;

  completedRows.forEach((row) => {
    //     offset particles by row completed
    const offset = GRID_ROWS - 1 - grid.indexOf(row);
    initParticles(offset);
  });

  //   remove all sprites in the rows
  completedRows.forEach((row) => {
    row.forEach((cell) => {
      cell.sprite.remove();
      cell.active = false;
    });
  });

  //   remove completed rows
  grid = grid.filter((row) => !completedRows.includes(row));

  //   add fresh rows to top
  completedRows.forEach((_, index) => {
    const newRow = [];
    for (let col = 0; col < GRID_COLS; col++) {
      newRow.push(newCell(col, completedRows.length - 1 - index));
    }
    grid.unshift(newRow);
  });

  //   shift all cells
  grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      shiftCell(cell, rowIndex);
    });
  });

  //   update score
  addRowScore(completedRows.length);

  return true;
};

const embedCells = (activeCells, onCompletedRows) => {
  activeCells.forEach(({ gridX, gridY }) => {
    try {
      grid[gridY][gridX].active = true;
      grid[gridY][gridX].colorFade = 0;
    } catch (error) {
      console.error(error);
      console.log("broke on:", gridY, gridX);
      console.log(activeCells);
      a;
      console.log(grid);
    }
  });

  //   collect completed rows
  const wasCompleted = collectCompletedRows();
  if (wasCompleted) onCompletedRows?.();
};
