//bounding overlap, format: [ startx, starty, width, height ]
Math.overlapBounding = function (a, b) {
  var A_end_x = a[0] + a[2];
  var A_end_y = a[1] + a[3];
  var B_end_x = b[0] + b[2];
  var B_end_y = b[1] + b[3];

  if (a[0] > B_end_x || a[1] > B_end_y || A_end_x < b[0] || A_end_y < b[1]) {
    return false;
  }
  return true;
};

Math.isInsideRectangle = function (x, y, left, top, width, height) {
  if (left < x && left + width > x && top < y && top + height > y) {
    return true;
  }
  return false;
};

Math.distance = function (a, b) {
  return Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]));
};

Math.clamp = function (v, a, b) {
  return a > v ? a : b < v ? b : v;
};

/**
 * returns the bounding of the object, used for rendering purposes
 * bounding is: [topleft_cornerx, topleft_cornery, width, height]
 * @method getBounding
 * @return {Float32Array[4]} the total size
 */
Math.getBounding = (node) => {
  let out = [0, 0, 0, 0];
  if (node.pos) {
    out[0] = node.pos[0] - 4;
    out[1] = node.pos[1] - 4;
  }
  if (node.size) {
    out[2] = node.size[0] + 4;
    out[3] = node.size[1] + 4;
  }
  return out;
}

  /**
 * checks if a point is inside the shape of a node
 * @method isPointInside
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
Math.isPointInside = (node, x, y, margin) => {
  if (!node) return false;
  margin = margin || 0;

  var margin_top = 0;
  if (
    node.pos[0] - 4 - margin < x &&
    node.pos[0] + node.size[0] + 4 + margin > x &&
    node.pos[1] - margin_top - margin < y &&
    node.pos[1] + node.size[1] + margin > y
  ) {
    return true;
  }
  return false;
}