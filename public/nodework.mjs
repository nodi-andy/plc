import { NodiEnums } from "./enums.mjs";
import Node from "./node.mjs";


function getFirstNullIndex(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == null) {
      return i;
    }
  }
  return arr.length; // If no null item is found
}

export default class NodeWork {
  static debug = false;
  static registered_node_types = {}; //nodetypes by string
  static Nodes = {}; //node types by classname

  constructor(o) {
    if (NodeWork.debug) {
      console.log("Graph created");
    }
    this.clear();
    if (o) {
      this.setNodework(o);
    }
  }
  /**
   * Register a node class so it can be listed when the user wants to create a new one
   * @method registerNodeType
   * @param {String} type name of the node and path
   * @param {Class} base_class class containing the structure of a node
   */

  static registerNodeType(base_class) {
    if (!base_class.prototype) {
      throw "Cannot register a simple object, it must be a class with a prototype";
    }

    if (NodeWork.debug) {
      console.log("Node registered: " + base_class.type);
    }

    let classType = base_class.type;
    if (base_class.type2) classType = base_class.type2;
    var categories = classType.split("/");
    var classname = base_class.name;

    base_class.category = categories[0];
    base_class.elementName = categories[1];

    //info.name = name.substr(pos+1,name.length - pos);

    //extend class
    if (base_class.prototype) {
      //is a class
      for (var i in Node.prototype) {
        if (!base_class.prototype[i]) {
          base_class.prototype[i] = Node.prototype[i];
        }
      }
    }

    var prev = this.registered_node_types[classType];
    if (prev) console.log("replacing node type: " + classType);
    else {
      //warnings
      if (base_class.prototype.onPropertyChange) {
        console.warn(
          "LiteGraph node class " +
            classType +
            " has onPropertyChange method, it must be called onPropertyChanged with d at the end"
        );
      }
    }

    this.registered_node_types[classType] = base_class;
    if (base_class.constructor.name) {
      this.Nodes[classname] = base_class;
    }
  }

  /**
   * removes a node type from the system
   * @method unregisterNodeType
   * @param {String|Object} type name of the node or the node constructor itself
   */
  static unregisterNodeType(type) {
    var base_class = type.constructor === String ? this.registered_node_types[type] : type;
    if (!base_class) throw "node type not found: " + type;
    delete this.registered_node_types[base_class.type];
    if (base_class.constructor.name) delete this.Nodes[base_class.constructor.name];
  }

  /**
   * Removes all previously registered node's types
   */
  static clearRegisteredTypes() {
    this.registered_node_types = {};
    this.Nodes = {};
  }


  createNode(msg, socket) {
    if (typeof window !== 'undefined') {
      if (msg.node) {
          this.nodes[msg.node.nodeID] = msg.node;
          msg.nodeID = msg.node.nodeID;
          this.setNodeIDOnGrid(msg.pos[0], msg.pos[1], msg.nodeID);
      } else {
        msg.type = msg.type.toLowerCase()
        var base_class = NodeWork.getNodeType(msg.type);
        if (!base_class) {
          if (NodeWork.debug) console.log('GraphNode type "' + msg.type + '" not registered.');
          return null;
        }

        var node = { type: base_class.type, type2: base_class.type, properties : {}};

        base_class.setup(node);

        node.size = Node.computeSize(node.properties);

        for (var i in msg.options) {
          node.properties[i] = msg.options[i];
        }
        node.device = "server";
        msg.node = node;
        window.sendToServer("createNode", msg);
      }
    } else {
      msg.node.nodeID = getFirstNullIndex(this.nodes);
      msg.node.owner = socket.id;
      msg.node.moving = false;
      this.nodes[msg.node.nodeID] = msg.node;
      msg.nodeID = msg.node.nodeID;
      this.setNodeIDOnGrid(msg.pos[0], msg.pos[1], msg.nodeID);
      if (msg.node.device == "nodi.box" && global.iot) {
        global.iot.emit("createNode", msg);
      } else {
        global.io.emit("createNode", msg);
      }
    }
    return node;
  }

  /**
   * Returns a registered node type with a given name
   * @method getNodeType
   * @param {String} type full name of the node class. p.e. "math/sin"
   * @return {Class} the node class
   */
  static getNodeType(type) {
    return this.registered_node_types[type];
  }

  //separated just to improve if it doesn't work
  static cloneObject(obj, target) {
    if (obj == null) {
      return null;
    }
    var r = JSON.parse(JSON.stringify(obj));
    if (!target) {
      return r;
    }

    for (var i in r) {
      target[i] = r[i];
    }
    return target;
  }

  /**
   * Removes all nodes from this graph
   * @method clear
   */
  clear() {
    this.nodes = [];
    this.nodesByPos = {};

    //timing
    this.globaltime = 0;
    this.runningtime = 0;
    this.elapsed_time = 0.01;
    this.last_update_time = 0;
    this.starttime = 0;

    //notify canvas to redraw
    this.change();
  }

  /**
   * Returns the amount of time the graph has been running in milliseconds
   * @method getTime
   * @return {number} number of milliseconds the graph has been running
   */
  getTime() {
    return this.globaltime;
  }

  /**
   * Returns the amount of time it took to compute the latest iteration. Take into account that this number could be not correct
   * if the nodes are using graphical actions
   * @method getElapsedTime
   * @return {number} number of milliseconds it took the last cycle
   */
  getElapsedTime() {
    return this.elapsed_time;
  }

  /**
   * Adds a new node instance to this graph
   * @method add
   * @param {Node} node the instance of the node
   */
  addNode(msg) {
    if (!msg.node) return;
    this.nodes[msg.node.nodeID] = msg.node;
    this.addExistingNode(msg);
  }

  addExistingNode(msg) {
    if (msg?.nodeID == null || msg?.pos == null) return;

    if (typeof window !== 'undefined' && msg.done == true) {
      this.setNodeIDOnGrid(msg.pos[0], msg.pos[1], msg.nodeID);
    } else if (typeof window !== 'undefined' && msg.done == undefined) {
      window.sendToServer("addExistingNode", msg);
    } else {
      this.setNodeIDOnGrid(msg.pos[0], msg.pos[1], msg.nodeID);
      msg.done = true;
      global.io.emit("addExistingNode", msg);
    }
  }

  moveNodeOnGrid(msg) {
    if (!msg) return;
    let node = this.nodes[msg.id];
    node.moving = false;
    
    let next_gridPos = msg.to;
    if (this.getNodeOnGrid(next_gridPos[0], next_gridPos[1]) == null) {
      if (msg.from) {
        this.setNodeOnGrid(msg.from[0], msg.from[1], null);
      }
      this.setNodeOnGrid(msg.to[0], msg.to[1], node);
    }
  }

  /* The node is on the mouse cursor and not on the field any more */
  pickNode(msg) {
    let node = this.nodes[msg.nodeID];
    node.drag_start_pos = msg.drag_start_pos;
  }

  removeNode(msg) {
    if (typeof window !== 'undefined' && msg.done == true) {
      this.setNodeIDOnGrid(msg.pos[0], msg.pos[1], null);
    } else if (typeof window !== 'undefined' && msg.done == undefined) {
      window.sendToServer("removeNode", msg);
    } else {
      this.setNodeIDOnGrid(msg.pos[0], msg.pos[1], null);
      msg.done = true;
      global.io.emit("removeNode", msg);
    }
  }

  updateProp(nodeID, prop) {
    Node.updateProp(this.nodes[nodeID], prop);
  }
  /**
   * Returns a node by its id.
   * @method getNodeById
   * @param {Number} id
   */
  getNodeById(id) {
    if (id == null) return null;
    return this.nodes[id];
  }

  getNodeOnPos(x, y) {
    let gridPos = [];
    gridPos[0] = Math.floor(x / NodiEnums.CANVAS_GRID_SIZE);
    gridPos[1] = Math.floor(y / NodiEnums.CANVAS_GRID_SIZE);
    return this.getNodeOnGrid(gridPos[0], gridPos[1]);
  }

  getNodeOnGrid(x, y) {
    let node = this.getNodeById(this.getNodeIDOnGrid(x, y));
    if (node) {
      return node;
    } else {
      return null;
    }
  }

  setNodeOnGrid(x, y, node) {
    if (node == null) {
      delete this.nodesByPos[x + NodiEnums.POS_SEP + y];
    } else {
      node.gridPos = [x, y];
      this.setNodeIDOnGrid(x, y, node.nodeID);
    }
  }

  getNodeIDOnGrid(x, y) {
    return this.nodesByPos[x + NodiEnums.POS_SEP + y];
  }

  setNodeIDOnGrid(x, y, id) {
    if (id == null) {
      delete this.nodesByPos[x + NodiEnums.POS_SEP + y];
    } else {
      this.nodesByPos[x + NodiEnums.POS_SEP + y] = id;
    }

    NodiEnums.allVec.forEach(nb => {
      let nbNode = this.getNodeOnGrid(x + nb.x, y + nb.y);
      if (nbNode) {
        let nodeClass = NodeWork.getNodeType(nbNode.type);
        if (nodeClass.reconnect) nodeClass.reconnect(nbNode, this, [x + nb.x, y + nb.y]);
      }
    });
  }


  /* Called when something visually changed (not the graph!) */
  change() {
    if (NodeWork.debug) {
      console.log("Graph changed");
    }
    if (this.on_change) {
      this.on_change(this);
    }
  }

  serialize() {
    var data = {
      nodes: this.nodes,
      nodesByPos: this.nodesByPos,
      version: NodiEnums.VERSION,
    };

    return data;
  }

  /**
   * Configure a graph from a JSON string
   * @method configure
   * @param {String} str configure a graph from a JSON string
   * @param {Boolean} returns if there was any error parsing
   */
  setNodework(data) {
    if (!data) return;

    this.clear();
    this.nodes = data.nodes;
    this.nodesByPos = data.nodesByPos;
    return false;
  }
}
