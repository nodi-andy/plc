export const NodiEnums = {
  CANVAS_GRID_SIZE: 64,
  POS_SEP: "x",
  NODE_TITLE_COLOR: "#999",
  NODE_TEXT_COLOR: "#AAA",
  NODE_SUBTEXT_SIZE: 36,
  NODE_DEFAULT_COLOR: "#333",
  NODE_DEFAULT_BGCOLOR: "#444",
  DEFAULT_SHADOW_COLOR: "rgba(0,0,0,0.5)",

  RIGHT: 0,
  UP: 1,
  LEFT: 2,
  DOWN: 3,
  CENTER: 5,
  NORMAL_TITLE: 0,
  NO_TITLE: 1,

  toGrid(p) {
    return [Math.floor(p[0] / NodiEnums.CANVAS_GRID_SIZE), Math.floor(p[1] / NodiEnums.CANVAS_GRID_SIZE)];
  },
  toCanvas(p) {
    return [p[0] * NodiEnums.CANVAS_GRID_SIZE, p[1] * NodiEnums.CANVAS_GRID_SIZE];
  },
  dirToVec : [{ x: 1, y: 0 },{ x: 0, y: 1 },{ x: -1, y: 0 },{ x: 0, y: -1 }],
  dirToAng : [0, 90, 180, 270],
  dirToRad : [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2],
  allVec : [{ x: 0, y: 0 },{ x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: -1 }, { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 } , { x: 1, y: 1 }],
  nbVec : [{ x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: -1 }, { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 } , { x: 1, y: 1 }]
};



export var globalApp = {};
globalApp.debug = false;

console.dlog = (...args) => {
  if (globalApp.debug) console.log(...args);
};

//timer that works everywhere
if (typeof performance != "undefined") {
  NodiEnums.getTime = performance.now.bind(performance);
} else if (typeof Date != "undefined" && Date.now) {
  NodiEnums.getTime = Date.now.bind(Date);
} else if (typeof process != "undefined") {
  NodiEnums.getTime = function () {
    var t = process.hrtime();
    return t[0] * 0.001 + t[1] * 1e-6;
  };
} else {
  NodiEnums.getTime = function getTime() {
    return new Date().getTime();
  };
}
