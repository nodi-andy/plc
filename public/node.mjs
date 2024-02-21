import { NodiEnums } from "./enums.mjs";

export default class Node {
  
  /* Creates a clone of this node */
  static clone(node) {
    let data = { ...node };
    for (let key in data) {
      node[key] = data[key];
    }

    return node;
  }

  /**
   * sets the value of a property
   * @method setProperty
   * @param {String} name
   * @param {*} value
   */
  static setProperty(properties, name, info) {
    if (!properties) return;

    if (!properties[name]) properties[name] = {};

    var prop = properties[name];
    prop.name = name;
    prop.inpValue = {};
    prop.value = null;
    prop.outValue = null;
    for (let i in info) {
      prop[i] = info[i];
    }
  }

  static updateProp(node, propName, propType, value) {
    if (typeof propType === "object") {
      Object.keys(propType).forEach((subPropName) => {
        let p = node.properties[propName][subPropName];
        if (typeof p === "object") {
          node.properties[propName][subPropName]["user"] = {val: subPropName[propName], update: true};
        } else {
          node.properties[propName][subPropName] = subPropName[propName];
        }
      })
    } else {
      node.properties[propName][propType] = value;
    }
  }

  static updateInputs(node, key, prop) {
      node.properties[key]["inpValue"]["user"] = {val: prop["inpValue"], update: true};
  }

  static updateValues(node, key, prop) {
    node.properties[key]["value"] = {val: prop["value"], update: true};
  }

  static updateOutputs(node, key, prop) {
    node.properties[key]["outValue"] = {val: prop["outValue"], update: true};
  }


  /**
   * changes node size and triggers callback
   * @method setSize
   * @param {vec2} size
   */
  static setSize(node, size, update = true) {
    if (size == null) return;
    if (!node.fixsize) {
      node.size = [
        NodiEnums.CANVAS_GRID_SIZE * Math.round(size[0] / NodiEnums.CANVAS_GRID_SIZE),
        NodiEnums.CANVAS_GRID_SIZE * Math.round(size[1] / NodiEnums.CANVAS_GRID_SIZE),
      ];
    }
    if (update) window.sendToNodework("setSize", { nodeID: node.nodeID, size: node.size });
  }

  static updateProperties(node, name, type, val) {
    node.properties[name][type] = val;
    let prop = {};
    prop[name] = {};
    prop[name][type] = val;
    window.sendToNodework("updateNode", {
      nodeID: node.nodeID,
      properties: prop
    });
  }

  /* Force align to grid */
  static alignToGrid(node) {
    node.gridPos = NodiEnums.toGrid(node.pos);
    node.pos = NodiEnums.toCanvas(node.gridPos);
  }

  static setPos(node, x, y) {
    node.pos[0] = x;
    node.pos[1] = y;
    Node.alignToGrid(node);
  }
}
