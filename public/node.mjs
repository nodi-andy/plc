import { NodiEnums } from "./enums.mjs";
import LLink from "./link.mjs";

export class Node {
  constructor(title) {
    this.title = title;
    this.update = false;
    this.device = "server";
    this.properties = {}; //for the values
    this.setSize([NodiEnums.NODE_WIDTH, 64], false);
    this.graph = null;
    this.update = false;
    this.type = null;
  }

  configure(info) {
    if (this.graph) {
      this.graph._version++;
    }
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

  serialize() {
    //create serialization object
    var o = {
      id: this.id,
      type: this.type,
      pos: this.pos,
      size: this.size,
      order: this.order,
    };

    //special case for when there were errors
    if (this.constructor === Node && this.last_serialization) {
      return this.last_serialization;
    }

    if (this.title && this.title != this.constructor.title) {
      o.title = this.title;
    }


    if (!o.type) {
      o.type = this.constructor.type;
    }

    if (this.color) o.color = this.color;

    if (this.bgcolor) o.bgcolor = this.bgcolor;

    if (this.boxcolor) o.boxcolor = this.boxcolor;

    if (this.onSerialize && this.onSerialize(o)) {
      console.warn(
        "node onSerialize shouldnt return anything, data should be stored in the object pass in the first parameter"
      );
    }

    return o;
  }

  /* Creates a clone of this node */
  clone() {
    let node = new Node();
    let data = {...this};
    for(let key in data) {
      node[key] = data[key];
    }

    return node;
  }
  /**
   * serialize and stringify
   * @method toString
   */
  toString() {
    return JSON.stringify(this.serialize());
  }
  /**
   * get the title string
   * @method getTitle
   */
  getTitle() {
    return this.title || this.constructor.title;
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

  getInputIndexByName(name) {
    return Object.values(this.properties)
      .filter((obj) => obj.input == true)
      .findIndex((el) => el.name === name);
  }

  getInputByIndex(index) {
    return Object.values(this.properties).filter((obj) => obj.input == true)[index];
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
        var target_node = this.graph.getNodeById(link.target_id);
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
        link.origin_slot -= 1;
      }
    }

    if (this.onOutputRemoved) {
      this.onOutputRemoved(slot);
    }
  }

  addInputByName(name) {
    this.updateProperties(name, "input", true);
    let prop = this.properties[name];
    this.addInput(name, prop.defaultValue, prop.label);
    window.sendToServer("addInput", {
      nodeID: this.id,
      newData: { input: this.properties[name] },
    });

    window.updateEditDialog();
  }

  addOutputByName(name) {
    this.updateProperties(name, "output", true);

    let prop = this.properties[name];
    this.addOutput(name, prop.type, null, prop.label);
    window.updateEditDialog();
  }
  /**
   * add a new input slot to use in this node
   * @method addInput
   * @param {string} name
   * @param {string} type string defining the input type ("vec3","number",...), it its a generic one use 0
   * @param {Object} extra_info this can be used to have special properties of an input (label, color, position, etc)
   */
  addInput(name, defaultValue, label, extra_info) {
    defaultValue = defaultValue || 0;
    label = label || name;
    var input = { name: name, link: [], label: label };
    if (extra_info) {
      for (var i in extra_info) {
        input[i] = extra_info[i];
      }
    }

    Node.getInputs(this.properties).push(input);

    if (this.onInputAdded) {
      this.onInputAdded(input);
    }

    return input;
  }

  removeInputByName(name) {
    this.updateProperties(name, "input", false);

    let slot = Node.getInputs(this.properties).findIndex((item) => item.name === name);
    if (slot >= 0) {
      this.removeInput(slot);
    }
    window.updateEditDialog();
  }

  removeOutputByName(name) {
    this.updateProperties(name, "output", false);
    let slot = Node.getOutputs(this.properties).findIndex((item) => item.name === name);
    if (slot >= 0) {
      this.removeOutput(slot);
    }
    window.updateEditDialog();
  }

  /**
   * remove an existing input slot
   * @method removeInput
   * @param {number} slot
   */
  removeInput(slot) {
    this.disconnectInput(slot);
    var slot_info = Node.getInputs(this.properties).splice(slot, 1);
    for (var i = slot; i < Node.getInputs(this.properties).length; ++i) {
      if (!Node.getInputs(this.properties)[i]) {
        continue;
      }
      var link = this.graph.links[Node.getInputs(this.properties)[i].link];
      if (!link) {
        continue;
      }
      link.target_slot -= 1;
    }
    if (this.onInputRemoved) {
      this.onInputRemoved(slot, slot_info[0]);
    }
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
   * @param {number_or_string} target_slot the input slot of the target node (could be the number of the slot or the string with the name of the slot, or -1 to connect a trigger)
   * @return {Object} the link_info is created, otherwise null
   */
  connect(slot, target_node, target_slot, id) {
    if (!this.graph) {
      //could be connected before adding it to a graph
      console.log(
        "Connect: Error, node doesn't belong to any graph. Nodes must be added first to a graph before connecting them."
      ); //due to link ids being associated with graphs
      return null;
    }

    var link_info = new LLink(id, "number", this.id, slot, target_node, target_slot);

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
    var output = this.getOutputByName(link.origin_slot);
    if (!output) {
      return false;
    }

    var link_id = link.id;
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
   * disconnect one input
   * @method disconnectInput
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @return {boolean} if it was disconnected successfully
   */
  disconnectInput(link) {
    var input = this.getInputByName(link.target_slot);
    if (!input) return false;
    if (!input.links) return false;

    var link_id = link.id;
    if (link_id != null) {
      // Find the index of the value you want to remove
      let indexToRemove = input.links.indexOf(link_id);

      // Check if the value exists in the array
      if (indexToRemove !== -1) {
        // Use splice to remove the value
        input.links.splice(indexToRemove, 1);
        console.log(`Removed ${link_id} from the array.`);
      } else {
        console.log(`${link_id} not found in the array.`);
      }
    } //link != null

    return true;
  }

  setDirtyCanvas(a, b) {
    this.canvas.setDirty(a, b);
  }

  /**
   * changes node size and triggers callback
   * @method setSize
   * @param {vec2} size
   */
  setSize(size, update = true) {
    if (size == null) return;
    if (!this.fixsize) {
      this.size = [
        NodiEnums.CANVAS_GRID_SIZE * Math.round(size[0] / NodiEnums.CANVAS_GRID_SIZE),
        NodiEnums.CANVAS_GRID_SIZE * Math.round(size[1] / NodiEnums.CANVAS_GRID_SIZE),
      ];
    }
    if (this.onResize) this.onResize(this.size);
    if (update) window.sendToServer("setSize", { nodeID: this.id, size: this.size });
  }

  updateProperties(name, type, val) {
    this.properties[name][type] = val;
    window.sendToServer("updateNode", {
      nodeID: this.id,
      newData: { properties: this.properties },
    });
  }

  /**
   * computes the minimum size of a node according to its inputs and output slots
   * @method computeSize
   * @param {number} minHeight
   * @return {number} the total size
   */
  computeSize(props) {
    if (this.fixsize) {
      this.size = this.fixsize;
      return this.fixsize;
    }
    if (this.constructor.size) {
      return this.constructor.size.concat();
    }

    var rows = Math.max(Node.getInputs(props).length, Node.getInputs(props).length);
    if (rows < 1) rows = 1;
    var size = [0, 0];
    rows = Math.max(rows, 1);
    var font_size = NodiEnums.NODE_TEXT_SIZE; //although it should be graphcanvas.inner_text_font size

    var input_width = 0;
    var output_width = 0;

    for (var i = 0, l = Node.getInputs(props).length; i < l; ++i) {
      var input = Node.getInputs(props)[i];
      var text = input.label || input.name || "";
      var text_width = compute_text_size(text);
      if (input_width < text_width) {
        input_width = text_width;
      }
    }

    for (let i = 0, l = Node.getOutputs(props).length; i < l; ++i) {
      var output = Node.getOutputs(props)[i];
      let text = output.label || output.name || "";
      let text_width = compute_text_size(text);
      if (output_width < text_width) {
        output_width = text_width;
      }
    }

    size[0] = Math.max(input_width + output_width + 10, 32);
    size[0] = Math.max(size[0], NodiEnums.NODE_WIDTH);

    size[1] = (this.constructor.slot_start_y || 0) + rows * NodiEnums.NODE_SLOT_HEIGHT;

    function compute_text_size(text) {
      if (!text) {
        return 0;
      }
      return font_size * text.length * 0.6;
    }

    if (this.constructor.min_height && size[1] < this.constructor.min_height) {
      size[1] = this.constructor.min_height;
    }

    size[1] += 6; //margin

    return size;
  }
  
  /**
   * returns the bounding of the object, used for rendering purposes
   * bounding is: [topleft_cornerx, topleft_cornery, width, height]
   * @method getBounding
   * @return {Float32Array[4]} the total size
   */
  getBounding(out) {
    out = out || new Float32Array(4);
    out[0] = this.pos[0] - 4;
    out[1] = this.pos[1] - NodiEnums.NODE_TITLE_HEIGHT;
    out[2] = this.size[0] + 4;
    out[3] = this.size[1] + NodiEnums.NODE_TITLE_HEIGHT;

    if (this.onBounding) {
      this.onBounding(out);
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
  isPointInside(x, y, margin) {
    margin = margin || 0;

    var margin_top = 0;
    if (
      this.pos[0] - 4 - margin < x &&
      this.pos[0] + this.size[0] + 4 + margin > x &&
      this.pos[1] - margin_top - margin < y &&
      this.pos[1] + this.size[1] + margin > y
    ) {
      return true;
    }
    return false;
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
        this.getConnectionPos(true, i, link_pos);
        if (Math.isInsideRectangle(x, y, link_pos[0] - 10, link_pos[1] - 5, 20, 10)) {
          return { input: input, slot: i, link_pos: link_pos };
        }
      }
    }

    if (Node.getOutputs(this.properties)) {
      for (let i = 0, l = Node.getOutputs(this.properties).length; i < l; ++i) {
        var output = Node.getOutputs(this.properties)[i];
        this.getConnectionPos(false, i, link_pos);
        if (Math.isInsideRectangle(x, y, link_pos[0] - 10, link_pos[1] - 5, 20, 10)) {
          return { output: output, slot: i, link_pos: link_pos };
        }
      }
    }

    return null;
  }

  //
  // returns the center of a connection point in canvas coords
  // @method getConnectionPos
  // @param {boolean} is_input true if if a input slot, false if it is an output
  // @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
  // @param {vec2} out [optional] a place to store the output, to free garbage
  // @return {[x,y]} the position

  getConnectionPos(is_input, slot_number, out) {
    out = out || new Float32Array(2);
    if (this.type == "control/junction") {
      out = [this.pos[0] + 8, this.pos[1] + 8];
      return out;
    }
    var num_slots = 0;
    if (is_input && Node.getInputs(this.properties)) {
      num_slots = Node.getInputs(this.properties).length;
    }
    if (!is_input && Node.getOutputs(this.properties)) {
      num_slots = Node.getOutputs(this.properties).length;
    }

    if (!is_input && num_slots > slot_number && Node.getOutputs(this.properties)[slot_number].pos) {
      out[0] = this.pos[0] + Node.getOutputs(this.properties)[slot_number].pos[0];
      out[1] = this.pos[1] + Node.getOutputs(this.properties)[slot_number].pos[1];
      return out;
    }

    //horizontal distributed slots
    if (this.horizontal) {
      out[0] = this.pos[0] + (slot_number + 0.5) * (this.size[0] / num_slots);
      if (is_input) {
        out[1] = this.pos[1] - NodiEnums.NODE_TITLE_HEIGHT;
      } else {
        out[1] = this.pos[1] + this.size[1];
      }
      return out;
    }

    //default vertical slots
    if (is_input) {
      out[0] = this.pos[0];
    } else {
      out[0] = this.pos[0] + this.size[0];
    }
    out[1] = this.pos[1] + (slot_number + 0.5) * NodiEnums.NODE_SLOT_HEIGHT + (this.constructor.slot_start_y || 0);
    return out;
  }
  /* Force align to grid */
  alignToGrid() {
    let gridSize = NodiEnums.CANVAS_GRID_SIZE;
    if (this.type == "control/junction") gridSize /= 4;
    if (this.size[0] >= gridSize) {
      this.pos[0] = gridSize * Math.round(this.pos[0] / gridSize);
    } else {
      this.pos[0] = gridSize * (Math.round(this.pos[0] / gridSize) + 0.5) - this.size[0] / 2;
    }
    if (this.size[1] >= gridSize) {
      this.pos[1] = gridSize * Math.round(this.pos[1] / gridSize);
    } else {
      this.pos[1] = gridSize * (Math.round(this.pos[1] / gridSize) + 0.5) - this.size[1] / 2;
    }
  }
  setPos(x, y) {
    this.pos[0] = x;
    this.pos[1] = y;
    this.alignToGrid();
  }
}