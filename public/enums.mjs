export const NodiEnums = {
  CANVAS_GRID_SIZE: 64,

  NODE_TITLE_HEIGHT: 24,
  NODE_SLOT_HEIGHT: 64,
  NODE_WIDGET_HEIGHT: 20,
  NODE_WIDTH: 64,
  NODE_TITLE_COLOR: "#999",
  NODE_SELECTED_TITLE_COLOR: "#FFF",
  NODE_TEXT_SIZE: 14,
  NODE_TEXT_COLOR: "#AAA",
  NODE_SUBTEXT_SIZE: 12,
  NODE_DEFAULT_COLOR: "#333",
  NODE_DEFAULT_BGCOLOR: "#353535",
  NODE_DEFAULT_BOXCOLOR: "#666",
  NODE_BOX_OUTLINE_COLOR: "#FFF",
  DEFAULT_SHADOW_COLOR: "rgba(0,0,0,0.5)",

  WIDGET_OUTLINE_COLOR: "#666",
  WIDGET_TEXT_COLOR: "#DDD",

  LINK_COLOR: "#6B6",
  CONNECTING_LINK_COLOR: "#AFA",

  DEFAULT_POSITION: [32, 32], //default node position

  //enums
  INPUT: 1,
  OUTPUT: 2,
  EVENT: -1, //for outputs

  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
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
  nbVec : [{ x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: -1 }, { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 } , { x: 1, y: 1 }]
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
