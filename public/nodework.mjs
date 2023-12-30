import { NodiEnums } from "./enums.mjs";
import Node from "./node.mjs";
import LLink from "./link.mjs";

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

    var categories = base_class.type.split("/");
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

    var prev = this.registered_node_types[base_class.type];
    if (prev) console.log("replacing node type: " + base_class.type);
    else {
      //warnings
      if (base_class.prototype.onPropertyChange) {
        console.warn(
          "LiteGraph node class " +
            base_class.type +
            " has onPropertyChange method, it must be called onPropertyChanged with d at the end"
        );
      }
    }

    this.registered_node_types[base_class.type] = base_class;
    if (base_class.constructor.name) {
      this.Nodes[classname] = base_class;
    }
    if (NodeWork.onNodeTypeRegistered) {
      NodeWork.onNodeTypeRegistered(base_class.type, base_class);
    }
    if (prev && NodeWork.onNodeTypeReplaced) {
      NodeWork.onNodeTypeReplaced(base_class.type, base_class, prev);
    }

    //warnings
    if (base_class.prototype.onPropertyChange) {
      console.warn(
        "LiteGraph node class " +
          base_class.type +
          " has onPropertyChange method, it must be called onPropertyChanged with d at the end"
      );
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

    var node = { type: base_class.type };

    if (!node.properties) {
      node.properties = {};
    }
    base_class.setup(node.properties);

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

  getNextID() {
    for (let i = 0; i < Number.MAX_SAFE_INTEGER; i++) {
      if (this.nodes[i] == null && this.links[i] == null) {
        return i;
      }
    }
  }
  /**
   * Adds a new node instance to this graph
   * @method add
   * @param {Node} node the instance of the node
   */
  addNode(node) {
    if (!node) return;

    this.nodes[node.nodeID] = node;
    Node.alignToGrid(node);
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

  /**
   * Returns the top-most node in this position of the canvas
   * @method getNodeOnPos
   * @param {number} x the x coordinate in canvas space
   * @param {number} y the y coordinate in canvas space
   * @param {Array} nodes_list a list with all the nodes to search from, by default is all the nodes in the graph
   * @return {Node} the node at this position or null
   */
  getNodeOnPos(x, y, nodes_list, margin) {
    var nRet = null;
    for (var i = nodes_list.length - 1; i >= 0; i--) {
      var n = this.nodes[nodes_list[i]];
      if (Math.isPointInside(n, x, y, margin)) {
        return n;
      }
    }
    return nRet;
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

  /**
   * Creates a Object containing all the info about this graph, it can be serialized
   * @method serialize
   * @return {Object} value of the node
   */
  serialize() {
    var nodes_info = [];
    for (var i = 0, l = this.nodes.length; i < l; ++i) {
      nodes_info.push(this.nodes[i].serialize());
    }

    //pack link info into a non-verbose format
    var links = [];
    for (i in this.links) {
      //links is an OBJECT
      var link = this.links[i];
      if (!link.serialize) {
        //weird bug I havent solved yet
        console.warn("weird LLink bug, link info is not a LLink but a regular object");
        var link2 = new LLink();
        for (var j in link) {
          link2[j] = link[j];
        }
        this.links[i] = link2;
        link = link2;
      }

      links.push(link.serialize());
    }

    var data = {
      nodes: nodes_info,
      links: links,
      config: this.config,
      version: NodiEnums.VERSION,
    };

    if (this.onSerialize) this.onSerialize(data);

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
    this.links = data.links;
    this.canvas.setDirty(true, true);
    return false;
  }
}
