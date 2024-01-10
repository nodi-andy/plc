import { NodiEnums } from "./enums.mjs";
import LLink from "./link.mjs";

export default class Node {
  constructor(title) {
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

    for (let i = 0; i < Node.getInputs(this.properties).length; ++i) {
      var input = Node.getInputs(this.properties)[i];
      var link_info = this.graph ? this.graph.links[input.link] : null;
      if (this.onConnectionsChange) this.onConnectionsChange(NodiEnums.INPUT, i, true, link_info, input); //link_info has been created now, so its updated

      if (this.onInputAdded) this.onInputAdded(input);
    }

    for (let i = 0; i < Node.getOutputs(this.properties).length; ++i) {
      var output = Node.getOutputs(this.properties)[i];
      if (!output.links) {
        continue;
      }
      for (let j = 0; j < output.links.length; ++j) {
        let link_info = this.graph ? this.graph.links[output.links[j]] : null;
        if (this.onConnectionsChange) this.onConnectionsChange(NodiEnums.OUTPUT, i, true, link_info, output); //link_info has been created now, so its updated
      }

      if (this.onOutputAdded) this.onOutputAdded(output);
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
    prop.links = [];
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

  /**
   * returns the node connected in the input slot
   * @method getInputNode
   * @param {number} slot
   * @return {Node} node or null
   */
  getInputNode(slot) {
    if (slot >= Node.getInputs(this.properties).length) {
      return null;
    }
    var input = Node.getInputs(this.properties)[slot];
    if (!input || input.link === null) {
      return null;
    }
    var link_info = this.graph.links[input.link];
    if (!link_info) {
      return null;
    }
    return this.graph.getNodeById(link_info.origin_id);
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

  /**
   * retrieves all the nodes connected to this output slot
   * @method getOutputNodes
   * @param {number} slot
   * @return {array}
   */
  getOutputNodes(slot) {
    if (!Node.getOutputs(this.properties) || Node.getOutputs(this.properties).length == 0) {
      return null;
    }

    if (slot >= Node.getOutputs(this.properties).length) {
      return null;
    }

    var output = Node.getOutputs(this.properties)[slot];
    if (!output.links || output.links.length == 0) {
      return null;
    }

    var r = [];
    for (var i = 0; i < output.links.length; i++) {
      var link_id = output.links[i];
      var link = this.graph.links[link_id];
      if (link) {
        var target_node = this.graph.getNodeById(link.to);
        if (target_node) {
          r.push(target_node);
        }
      }
    }
    return r;
  }

  removeProperty(name) {
    delete this.properties[name];
  }
  //connections
  /**
   * add a new output slot to use in this node
   * @method addOutput
   * @param {string} name
   * @param {string} type string defining the output type ("vec3","number",...)
   * @param {Object} extra_info this can be used to have special properties of an output (label, special color, position, etc)
   */
  addOutput(name, type, extra_info, label) {
    label = label || name;
    var output = { name: name, type: type, links: null, label: label };
    if (extra_info) {
      for (var i in extra_info) {
        output[i] = extra_info[i];
      }
    }

    Node.getOutputs(this.properties).push(output);
    if (this.onOutputAdded) {
      this.onOutputAdded(output);
    }

    return output;
  }

  /**
   * remove an existing output slot
   * @method removeOutput
   * @param {number} slot
   */
  removeOutput(slot) {
    this.disconnectOutput(slot);
    Node.getOutputs(this.properties).splice(slot, 1);
    for (var i = slot; i < Node.getOutputs(this.properties).length; ++i) {
      if (!Node.getOutputs(this.properties)[i] || !Node.getOutputs(this.properties)[i].links) {
        continue;
      }
      var links = Node.getOutputs(this.properties)[i].links;
      for (var j = 0; j < links.length; ++j) {
        var link = this.graph.links[links[j]];
        if (!link) {
          continue;
        }
        link.toSlot -= 1;
      }
    }

    if (this.onOutputRemoved) {
      this.onOutputRemoved(slot);
    }
  }

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
   * connect this node output to the input of another node
   * @method connect
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @param {Node} node the target node
   * @param {number_or_string} fromSlot the input slot of the target node (could be the number of the slot or the string with the name of the slot, or -1 to connect a trigger)
   * @return {Object} the link_info is created, otherwise null
   */
  connect(slot, target_node, fromSlot, id) {
    var link_info = new LLink(id, "number", this.id, slot, target_node, fromSlot);

    //add to graph links list
    this.graph.links[link_info.id] = link_info;

    return link_info;
  }

  /**
   * disconnect one output to an specific node
   * @method disconnectOutput
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @param {Node} target_node the target node to which this slot is connected [Optional, if not target_node is specified all nodes will be disconnected]
   * @return {boolean} if it was disconnected successfully
   */
  disconnectOutput(link) {
    var output = this.getOutputByName(link.toSlot);
    if (!output) {
      return false;
    }

    var link_id = link.linkID;
    if (link_id != null && output && output.links) {
      // Find the index of the value you want to remove
      let indexToRemove = output.links.indexOf(link_id);

      // Check if the value exists in the array
      if (indexToRemove !== -1) {
        // Use splice to remove the value
        output.links.splice(indexToRemove, 1);
        console.log(`Removed ${link_id} from the array.`);
      } else {
        console.log(`${link_id} not found in the array.`);
      }
    } //link != null

    return true;
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

  /**
   * checks if a point is inside a node slot, and returns info about which slot
   * @method getSlotInPosition
   * @param {number} x
   * @param {number} y
   * @return {Object} if found the object contains { input|output: slot object, slot: number, link_pos: [x,y] }
   */
  getSlotInPosition(x, y) {
    //search for inputs
    var link_pos = new Float32Array(2);
    if (Node.getInputs(this.properties)) {
      for (var i = 0, l = Node.getInputs(this.properties).length; i < l; ++i) {
        var input = Node.getInputs(this.properties)[i];
        Node.getConnectionPos(true, i, link_pos);
        if (Math.isInsideRectangle(x, y, link_pos[0] - 10, link_pos[1] - 5, 20, 10)) {
          return { input: input, slot: i, link_pos: link_pos };
        }
      }
    }

    if (Node.getOutputs(this.properties)) {
      for (let i = 0, l = Node.getOutputs(this.properties).length; i < l; ++i) {
        var output = Node.getOutputs(this.properties)[i];
        Node.getConnectionPos(node, false, i, link_pos);
        if (Math.isInsideRectangle(x, y, link_pos[0] - 10, link_pos[1] - 5, 20, 10)) {
          return { output: output, slot: i, link_pos: link_pos };
        }
      }
    }

    return null;
  }

  // returns the center of a connection point in canvas coords
  // @method getConnectionPos
  // @param {boolean} is_input true if if a input slot, false if it is an output
  // @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
  // @param {vec2} out [optional] a place to store the output, to free garbage
  // @return {[x,y]} the position

  static getConnectionPos(node, is_input, slot_number, out) {
    out = out || new Float32Array(2);
    if (node.type == "control/junction") {
      out = [node.pos[0] + 8, node.pos[1] + 8];
      return out;
    }
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
