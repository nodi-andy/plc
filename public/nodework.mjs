import { NodiEnums } from "./enums.mjs";
import Node from "./node.mjs";
import LLink from "./link.mjs";
import Vector2 from "./vector2.mjs";

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
      this.configure(o);
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

  /**
   * Create a node of a given type with a name. The node is not attached to any graph yet.
   * @method createNode
   * @param {String} type full name of the node class. p.e. "math/sin"
   * @param {String} name a name to distinguish from other nodes
   * @param {Object} options to set options
   */

  static createNode(type, title, options) {
    var base_class = this.registered_node_types[type];
    if (!base_class) {
      if (NodeWork.debug) console.log('GraphNode type "' + type + '" not registered.');
      return null;
    }

    var node = { type: base_class.type, type2: base_class.type };

    if (!node.properties) {
      node.properties = {};
    }
    base_class.setup(node);

    node.size = Node.computeSize(node.properties);
    node.pos = NodiEnums.DEFAULT_POSITION.concat();

    for (var i in options) {
      node.properties[i] = options[i];
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
    this.links = [];

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
  addNode(node) {
    if (!node) return;

    this.nodes[node.nodeID] = node;
    this.nodeDropped({nodeID: node.nodeID, moveTo: node.pos});
  }

  nodeDropped(msg) {
    if (!msg) return;
    let node = this.nodes[msg.nodeID];
    node.moving = false;
    
    let next_gridPos = NodiEnums.toGrid(msg.moveTo);
    if (this.getNodeOnGrid(next_gridPos[0], next_gridPos[1]) == null) {
      this.setNodeOnGrid(node.gridPos[0], node.gridPos[1], null);
      this.setNodeOnGrid(next_gridPos[0], next_gridPos[1], node);
    }
    node.pos = NodiEnums.toCanvas(node.gridPos);
    let nodeClass = NodeWork.getNodeType(node.type);
    if (nodeClass.replace) nodeClass.replace(node, this);
  }

  /* The node is on the mouse cursor and not on the field any more */
  pickNode(msg) {
    let node = this.nodes[msg.nodeID];
    node.drag_start_pos = msg.drag_start_pos;
  }

  addLink(link) {
    this.links[link.linkID] = link;
    this.nodes[link.to].properties[link.toSlot].links.push(link.linkID);
    this.nodes[link.from].properties[link.fromSlot].links.push(link.linkID);
  }

  nodeRemoved(nodeID) {
    this.nodes[nodeID] = null;
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
    let node = this.getNodeById(this.nodesByPos[x + "-" + y]);
    if (node) {
      return node;
    } else {
      return null;
    }
  }

  setNodeOnGrid(x, y, node) {
    if (node == null) {
      delete this.nodesByPos[x + "-" + y];
    } else {
      node.gridPos = [x, y];
      this.nodesByPos[x + "-" + y] = node.nodeID;
    }
  }

  /**
   * Checks that the node type matches the node type registered, used when replacing a nodetype by a newer version during execution
   * this replaces the ones using the old version with the new version
   * @method checkNodeTypes
   */
  checkNodeTypes() {
    for (var i = 0; i < this.nodes.length; i++) {
      var node = this.nodes[i];
      var ctor = NodeWork.registered_node_types[node.type];
      if (node.constructor == ctor) {
        continue;
      }
      console.log("node being replaced by newer version: " + node.type);
      var newnode = NodeWork.createNode(node.type);
      this.nodes[i] = newnode;
      newnode.configure(node.serialize());
    }
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

  /**
   * Destroys a link
   * @method removeLink
   * @param {Number} link_id
   */
  removeLink(link_id) {
    var link = this.links[link_id];
    if (!link) return;

    var node = this.getNodeById(link.to);
    if (node) {
      node.properties[link.toSlot].links.filter((v) => {
        v == link.to;
      });
    }

    node = this.getNodeById(link.from);
    if (node) {
      node.properties[link.fromSlot].links.filter((v) => {
        v == link.from;
      });
    }

    delete this.links[link_id];
  }

  serialize() {
    var data = {
      nodes: this.nodes,
      nodesByPos: this.nodesByPos,
      links: this.links,
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
  configure(data) {
    if (!data) return;

    this.clear();
    this.nodes = data.nodes;
    this.nodesByPos = data.nodesByPos;
    this.links = data.links;
    return false;
  }
}
