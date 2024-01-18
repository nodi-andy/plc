import { NodiEnums } from "./enums.mjs";

export default class Node {
  constructor() {
    this.update = false;
    this.device = "server";
    this.properties = {}; //for the values
    this.graph = null;
    this.update = false;
    this.type = null;
  }

  configure(info) {
    for (var j in info) {
      if (j == "properties") {
        //i don't want to clone properties, I want to reuse the old container
        for (var k in info.properties) {
          this.properties[k] = info.properties[k];
          if (this.onPropertyChanged) {
            this.onPropertyChanged(k, info.properties[k]);
          }
        }
        continue;
      }
    }

    if (this.widgets) {
      for (let i = 0; i < this.widgets.length; ++i) {
        var w = this.widgets[i];
        if (!w) continue;
        if (w.options && w.options.property && this.properties[w.options.property])
          w.value = JSON.parse(JSON.stringify(this.properties[w.options.property]));
      }
      if (info.widgets_values) {
        for (let i = 0; i < info.widgets_values.length; ++i) {
          if (this.widgets[i]) {
            this.widgets[i].value = info.widgets_values[i];
          }
        }
      }
    }

    if (this.onConfigure) {
      this.onConfigure(info);
    }
  }

  /* Creates a clone of this node */
  static clone(node) {
    let data = { ...node };
    for (let key in data) {
      node[key] = data[key];
    }

    return node;
  }
  /**
   * serialize and stringify
   * @method toString
   */
  toString() {
    return JSON.stringify(this);
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
    prop.value = null;
    prop.label = name;
    prop.input = false;
    prop.output = false;
    for (let i in info) {
      prop[i] = info[i];
    }
  }

  // Execution *************************
  /**
   * sets the output data
   * @method setOutputData
   * @param {number} slot
   * @param {*} data
   */
  setOutputData(slot, data) {
    if (slot == -1 || slot >= Node.getOutputs(this.properties).length) {
      return;
    }

    var output_info = Node.getOutputs(this.properties)[slot];
    if (!output_info) {
      return;
    }

    //store data in the output itself in case we want to debug
    output_info._data = data;
  }

  /**
   * Retrieves the input data (data traveling through the connection) from one slot
   * @method getInputData
   * @param {number} slot
   * @param {boolean} force_update if set to true it will force the connected node of this slot to output data into this link
   * @return {*} data or if it is not connected returns undefined
   */
  getInputData(slot) {
    return Node.getInputs(this.properties)[slot].value;
  }


  getInputByName(name) {
    let slot = this.properties[name];
    return slot.input ? slot : null;
  }

  static getInputIndexByName(node, name) {
    return Object.values(node.properties)
      .filter((obj) => obj.input == true)
      .findIndex((el) => el.name === name);
  }

  static getInputByIndex(node, index) {
    return Object.values(node.properties).filter((obj) => obj.input == true)[index];
  }

  static getOutputByIndex(node, index) {
    return Object.values(node.properties).filter((obj) => obj.output == true)[index];
  }
  /**
   * tells you the last output data that went in that slot
   * @method getOutputData
   * @param {number} slot
   * @return {Object}  object or null
   */
  getOutputData(slot) {
    if (!Node.getOutputs(this.properties)) {
      return null;
    }
    if (slot >= Node.getOutputs(this.properties).length) {
      return null;
    }

    var info = Node.getOutputs(this.properties)[slot];
    return info.value;
  }

  getOutputByName(name) {
    let slot = this.properties[name];
    return slot.output ? slot : null;
  }

  removeProperty(name) {
    delete this.properties[name];
  }
  //connections

  static updateProp(node, prop) {
    node.properties[prop.name] = prop;
  }

  static addInput(node, name) {
    node.properties[name].input = true;
    window.sendToServer("updateProp", {
      nodeID: node.nodeID,
      prop: node.properties[name]
    });
  }

  static addOutput(node, name) {
    node.properties[name].output = true;
    window.sendToServer("updateProp", {
      nodeID: node.nodeID,
      prop: node.properties[name]
    });
  }

  static removeInput(node, name) {
    node.properties[name].input = false;
    window.sendToServer("updateProp", {
      nodeID: node.nodeID,
      prop: node.properties[name]
    });
  }

  static removeOutput(node, name) {
    node.properties[name].output = false;
    window.sendToServer("updateProp", {
      nodeID: node.nodeID,
      prop: node.properties[name]
    });
  }

  static getInputs(prop) {
    if (prop) {
      return Object.values(prop).filter((obj) => obj.input == true);
    } else {
      return [];
    }
  }

  static getOutputs(prop) {
    if (prop) {
      return Object.values(prop).filter((obj) => obj.output == true);
    } else {
      return [];
    }
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
    if (update) window.sendToServer("setSize", { nodeID: node.nodeID, size: node.size });
  }

  static updateProperties(node, name, type, val) {
    node.properties[name][type] = val;
    window.sendToServer("updateNode", {
      nodeID: node.nodeID,
      newData: { properties: node.properties },
    });
  }

  /**
   * computes the minimum size of a node according to its inputs and output slots
   * @method computeSize
   * @param {number} minHeight
   * @return {number} the total size
   */
  static computeSize(node) {
    if (node.fixsize) {
      return node.fixsize;
    }

    var rows = Math.max(Node.getInputs(node.properties).length, Node.getOutputs(node.properties).length);
    if (rows < 1) rows = 1;
    var size = [0, 0];
    rows = Math.max(rows, 1);


    size[0] = Math.max(size[0], NodiEnums.NODE_WIDTH);

    size[1] = rows * NodiEnums.NODE_WIDTH;


    if (node.min_height && size[1] < node.min_height) {
      size[1] = node.min_height;
    }

    return size;
  }


  // returns the center of a connection point in canvas coords
  // @method getConnectionPos
  // @param {boolean} is_input true if if a input slot, false if it is an output
  // @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
  // @param {vec2} out [optional] a place to store the output, to free garbage
  // @return {[x,y]} the position

  static getConnectionPos(node, is_input, slot_number, out) {
    out = out || new Float32Array(2);

    var num_slots = 0;
    if (is_input && Node.getInputs(node.properties)) {
      num_slots = Node.getInputs(node.properties).length;
    }
    if (!is_input && Node.getOutputs(node.properties)) {
      num_slots = Node.getOutputs(node.properties).length;
    }

    if (!is_input && num_slots > slot_number && Node.getOutputs(node.properties)[slot_number].pos) {
      out[0] = node.pos[0] + Node.getOutputs(node.properties)[slot_number].pos[0];
      out[1] = node.pos[1] + Node.getOutputs(node.properties)[slot_number].pos[1];
      return out;
    }

    out[0] = node.pos[0];
    out[1] = node.pos[1] + (slot_number + 0.5) * NodiEnums.NODE_SLOT_HEIGHT;
    return out;
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
