// Game Settings and settable Constants
const DEBUG_MODE = false;
let activeStart;
let activeEnd;
let settledStart;
let settledEnd;
let particleColor;
let gameOver = false;
let autoMoveIntervalFrequency = 30;
let autoMoveIntervalFrame = 0;
let manualDownButtonLockedFrame = 0;
let lockAllActionsFrame = 0;

const POST_MESSAGE_ID = 'grata-lead-gen-game';

const COLOR_FADE_SPEED = 0.05;

// Host passes ?theme=classic|intel|intel-dark before first paint, then postMessage { theme }.
// ?dark=true remains the older intel-dark signal.
const SCHEMES = {
  // Classic Grata: white page, primary-200 grid, primary-500 blocks.
  classic: {
    surface: [255, 255, 255],
    empty: [235, 242, 255],
    active: [36, 100, 227],
    settled: [36, 100, 227],
    sparkle: [119, 159, 238],
  },
  // Intelligence light: app surface gray-50, secondary-soft grid, brand blocks.
  intel: {
    surface: [249, 250, 251],
    empty: [226, 238, 242],
    active: [21, 94, 117],
    settled: [115, 168, 188],
    sparkle: [38, 217, 202],
  },
  // Intelligence dark: app surface, brand-950 grid, brand-400 / brand-700 blocks.
  "intel-dark": {
    surface: [2, 2, 3],
    empty: [12, 33, 40],
    active: [71, 142, 167],
    settled: [0, 79, 100],
    sparkle: [115, 168, 188],
  },
};

const readInitialScheme = () => {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get("theme");
  if (SCHEMES[theme]) return theme;
  if (params.get("dark") === "true") return "intel-dark";
  return "classic";
};

let scheme = readInitialScheme();
let palette = SCHEMES[scheme];
let paletteReady = false;

const syncDocumentTheme = () => {
  document.documentElement.classList.toggle("is-intel", scheme === "intel");
  document.documentElement.classList.toggle("is-intel-dark", scheme === "intel-dark");
};

const applyPalette = () => {
  activeStart = color(...palette.sparkle);
  activeEnd = color(...palette.active);
  settledStart = color(...palette.sparkle);
  settledEnd = color(...palette.settled);
  particleColor = color(...palette.sparkle);
  paletteReady = true;
};

const setScheme = (next) => {
  if (!SCHEMES[next]) return;
  scheme = next;
  palette = SCHEMES[next];
  syncDocumentTheme();
  if (paletteReady) applyPalette();
};

const paintCanvasBackground = () => {
  const [red, green, blue] = palette.surface;
  background(red, green, blue);
};

const paintEmptyCell = () => {
  const [red, green, blue] = palette.empty;
  noStroke();
  fill(red, green, blue);
};

syncDocumentTheme();

// utils and other constants

const increaseGameSpeed = () => {
  if (autoMoveIntervalFrequency <= 15) return;
  autoMoveIntervalFrequency -= 1;
  autoMoveIntervalFrame = min(
    autoMoveIntervalFrame,
    autoMoveIntervalFrequency - 1
  );
};

const NUMBER_RANGES = [
  { divider: 1e18, suffix: "P", word: "P" },
  { divider: 1e15, suffix: "E", word: "E" },
  { divider: 1e12, suffix: "T", word: " Trillion" },
  { divider: 1e9, suffix: "B", word: " Billion" },
  { divider: 1e6, suffix: "M", word: " Million" },
  { divider: 1e3, suffix: "K", word: "K" },
];

// parses out a number from a string or number
// exported values include number validation, commas and more
const getNumberProperties = (num) => {
  const invalid = {};
  if (typeof num === "string") num = num.trim();

  // check if empty string or undefined
  if (num !== 0 && !num) return invalid;

  // check if it's just a non-digit char
  if ((num + "").length === 1 && isNaN(num)) return invalid;
  let _num = (num + "").replace(/,/g, "");

  // replace full word with suffix abbreviations
  NUMBER_RANGES.forEach((range) => {
    if (_num.toLowerCase().includes(range.word.toLowerCase()))
      _num = _num.toLowerCase().replace(range.word.toLowerCase(), range.suffix);
  });

  // split character at end
  let suffix = _num[_num.length - 1].toUpperCase();
  if (suffix.match(/^[A-Z]+$/)) _num = _num.substring(0, _num.length - 1);
  else suffix = null;

  // check if not a number
  if (isNaN(+_num)) return invalid;

  // check incorrect suffix
  if (suffix && !NUMBER_RANGES.map((r) => r.suffix).includes(suffix))
    return invalid;

  // return values - it's a number!
  const multiplier = suffix
    ? NUMBER_RANGES.find((r) => r.suffix === suffix)?.divider || 1
    : 1;

  // create comma val
  const comma = (+_num * multiplier + "").split(".");
  comma[0] = comma[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // add fixed decimal points if they existed in original value
  const originalDecimal =
    typeof num === "string" && !suffix ? num.split(".")[1] : "";
  if (originalDecimal && originalDecimal !== comma[1])
    comma[1] = originalDecimal;

  return {
    valid: true,
    string: num + "",
    number: +_num,
    value: +_num * multiplier,
    comma: comma.join("."),
    suffix,
    multiplier,
  };
};

const formatNumber = (num, decimals, fixedDecimals) => {
  const toFixedCount =
    fixedDecimals && fixedDecimals === true ? decimals : fixedDecimals;
  const _num = getNumberProperties(num);
  if (!_num.valid) return num;

  for (var i = 0; i < NUMBER_RANGES.length; i++) {
    if (Math.abs(_num.value) >= NUMBER_RANGES[i].divider) {
      const prefix = (_num.value / NUMBER_RANGES[i].divider).toFixed(
        toFixedCount || decimals
      );
      const condensed = `${toFixedCount ? prefix : parseFloat(prefix)}${
        NUMBER_RANGES[i].suffix
      }`;
      if (prefix.replace("-", "").split(".")[0].length > 3 + decimals) {
        // special case 999878584 --> 1000M (should now become 1B)
        if (!decimals)
          return formatNumber(
            getNumberProperties(condensed).value,
            0,
            toFixedCount
          );
        return formatNumber(_num.value, decimals - 1, toFixedCount);
      }
      return condensed;
    }
  }
  if (toFixedCount) return `${_num.value.toFixed(toFixedCount)}`;
  return `${_num.value}`;
};
