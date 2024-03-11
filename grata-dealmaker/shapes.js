const ROTATIONS = [0, 90, 180, 270];

const DemoArray = [
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
];
const Demo = {
  0: DemoArray,
  90: DemoArray,
  180: DemoArray,
  270: DemoArray,
};

const LeftAngle = {
  0: [
    [0, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 0],
  ],
  90: [
    [0, 0, 0, 1],
    [0, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  180: [
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 1],
    [0, 0, 0, 0],
  ],
  270: [
    [0, 0, 0, 0],
    [0, 1, 1, 1],
    [0, 1, 0, 0],
    [0, 0, 0, 0],
  ],
};

const RightAngle = {
  0: [
    [0, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0],
  ],
  90: [
    [0, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 0],
  ],
  180: [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0],
  ],
  270: [
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
};

const BlockArray = [
  [0, 1, 1, 0],
  [0, 1, 1, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];
const Block = {
  0: BlockArray,
  90: BlockArray,
  180: BlockArray,
  270: BlockArray,
};

const Hump = {
  0: [
    [0, 0, 1, 0],
    [0, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  90: [
    [0, 0, 1, 0],
    [0, 0, 1, 1],
    [0, 0, 1, 0],
    [0, 0, 0, 0],
  ],
  180: [
    [0, 0, 0, 0],
    [0, 1, 1, 1],
    [0, 0, 1, 0],
    [0, 0, 0, 0],
  ],
  270: [
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 0],
  ],
};

const HorizontalLine = [
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];
const Line = {
  0: [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],
  90: HorizontalLine,
  180: [
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
  ],
  270: HorizontalLine,
};

const ZigV = [
  [0, 1, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 0],
];
const ZigH = [
  [0, 0, 0, 0],
  [0, 1, 1, 0],
  [1, 1, 0, 0],
  [0, 0, 0, 0],
];
const Zig = {
  0: ZigV,
  90: ZigH,
  180: ZigV,
  270: ZigH,
};

const ZagV = [
  [0, 0, 1, 0],
  [0, 1, 1, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 0],
];
const ZagH = [
  [0, 0, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 1, 1],
  [0, 0, 0, 0],
];
const Zag = {
  0: ZagV,
  90: ZagH,
  180: ZagV,
  270: ZagH,
};

const Shapes = {
  // Demo: Demo,
  LeftAngle: LeftAngle,
  RightAngle: RightAngle,
  Block: Block,
  Hump: Hump,
  Line: Line,
  Zig: Zig,
  Zag: Zag,
};
const ShapeNames = Object.keys(Shapes);

// rotation = 0, 90, 180, 270
const rotate = (shapeName, rotation) => Shapes[shapeName][rotation];

const drawShape = (shapeArray, x, y, fadeColor=1) => {
  fill(lerpColor(lightBlue, mediumBlue, fadeColor));
  noStroke();
  for (let row = 0; row < shapeArray.length; row++) {
    for (let col = 0; col < shapeArray[row].length; col++) {
      if (!shapeArray[row][col]) continue;

      const shapeX = col * CELL_SIZE + x;
      const shapeY = row * CELL_SIZE + y;

      rect(
        shapeX,
        shapeY,
        CELL_SIZE - CELL_MARGIN,
        CELL_SIZE - CELL_MARGIN,
        CELL_RADIUS
      );
    }
  }
};

// const getBorderCells = (shapeArray) => ({
//   top: shapeArray[0],
//   right: shapeArray.map((row) => row[row.length - 1]),
//   bottom: shapeArray[shapeArray.length - 1],
//   left: shapeArray.map((row) => row[0]),
// });

const getActiveShapeCells = (shapeArray, offset) => {
  const activeCells = [];
  for (row = 0; row < shapeArray.length; row++) {
    for (col = 0; col < shapeArray[row].length; col++) {
      if (shapeArray[row][col]) {
        activeCells.push({
          gridX: (offset?.gridX ?? 0) + col,
          gridY: (offset?.gridY ?? 0) + row,
        });
      }
    }
  }
  return activeCells;
};

const getActiveShapeRows = (shapeArray, offset) =>
  getActiveShapeCells(shapeArray, offset).map(({ gridY }) => gridY);

const getHeightOfShape = (shapeArray, offset) => {
  const activeRows = getActiveShapeRows(shapeArray, offset);
  return max(activeRows) - min(activeRows) + 1;
};

const getStartingRowRelativeToShape = (shapeArray, offset) => {
  let startingRow = shapeArray.length - 1;
  const activeRows = getActiveShapeRows(shapeArray, offset);
  shapeArray.forEach((row, rowIndex) => {
    if (rowIndex < startingRow && activeRows.includes(rowIndex))
      startingRow = rowIndex;
  });
  return startingRow;
};

const getBottomCellForEachColumn = (shapeArray, offset) => {
  const bottomCells = [];
  for (col = 0; col < shapeArray[0].length; col++) {
    let bottomCell;
    shapeArray.forEach((row, rowIndex) => {
      if (row[col])
        bottomCell = {
          gridX: (offset?.gridX ?? 0) + col,
          gridY: (offset?.gridY ?? 0) + rowIndex,
        };
    });
    if (bottomCell) bottomCells.push(bottomCell);
  }
  return bottomCells;
};

let debugShape;