// Game Settings and settable Constants
const DEBUG_MODE = false;
let lightBlue;
let mediumBlue;
let darkBlue;
let gameOver = false;
let autoMoveIntervalFrequency = 30;
let autoMoveIntervalFrame = 0;
let manualDownButtonLockedFrame = 0;
let lockAllActionsFrame = 0;

const POST_MESSAGE_ID = 'grata-lead-gen-game';

const COLOR_FADE_SPEED = 0.05;

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
