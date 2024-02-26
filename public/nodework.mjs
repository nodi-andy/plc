import { NodiEnums } from "./enums.mjs";
import Node from "./node.mjs";
import Vector2 from "./vector2.mjs";

export default class NodeWork {
  static debug = false;
  static registered_node_types = {}; //nodetypes by string
  static Nodes = {}; //node types by classname


  constructor(o) {
    if (NodeWork.debug) console.log("Graph created");
    this.clear();
    if (o) this.setNodework(o);

    this.orders = [];
    this.nodes = [];
    this.socketOut = null;
    this.engine = {name: "local", send: (order)=> {
      if(this[order.cmd]) this[order.cmd](order.data);
    }};
    this.plattform = (typeof window !== 'undefined') ? "browser" : "server" ;
    this.events =  {
      moveNodeOnGrid : null,
      addExistingNode : null,
      rotateNode : this.rotateNode,
      nodePicked : null,
      updateNode : this.updateNode,
      updatePos : null,
      createNode : this.createNode,
      updateInputs : this.updateInputs,
      nodeMoved : null,
      propUpdated : null,
      removeNode : null,
      clear : null
    }
  }

  static getFirstNullIndex(arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == null) {
        return i;
      }
    }
    return arr.length; // If no null item is found
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
    var prev = this.registered_node_types[classType];
    if (prev) console.log("replacing node type: " + classType);
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

  cmd(msg) {
    this.orders.push(msg);
  }

  publish(event, data) {
    if (this.socketOut) this.socketOut(event, data);
  }

  setSocketOut(socket) {
    this.socketOut = socket;
  }

  createNode(msg, socket) {
    this.nodes[msg.node.nodeID] = msg.node;
    msg.node.engine = this.engine;
    msg.node.owner = socket?.id;
    msg.node.moving = false;
    msg.nodeID = msg.node.nodeID;
    this.setNodeIDOnGrid(msg.pos[0], msg.pos[1], msg.nodeID);
    this.publish("createNode", msg);
    return msg.node;
  }

  rotateNode(msg) {
    let node = this.getNodeOnGrid(msg.x, msg.y);
    if (node) {
      node.direction = (node.direction + 1) % 4;
      this.updateNBs(msg.x, msg.y);
    }
    this.publish("rotateNode", msg);
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
    this.cleanUpOutputs = [];

    //timing
    this.globaltime = 0;
    this.runningtime = 0;
    this.elapsed_time = 0.01;
    this.last_update_time = 0;
    this.starttime = 0;
  }


  addExistingNode(msg) {
    if (msg?.nodeID == null || msg?.pos == null) return;
    this.setNodeIDOnGrid(msg.pos[0], msg.pos[1], msg.nodeID);
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

    this.publish("moveNodeOnGrid", msg);
  }

  removeNode(msg) {
    this.setNodeIDOnGrid(msg.pos[0], msg.pos[1], null);
    this.publish("removeNode", msg);
  }

  updateNode(msg) {
    if (typeof msg.properties == "object") {
      Object.keys(msg.properties).forEach((key) => {
        Node.updateProp(this.nodes[msg.nodeID], msg.prop, key, msg.properties[key]);
      })
    } else {
      Node.updateProp(this.nodes[msg.nodeID], msg.prop, "value", msg.properties);
    }
  }

  updateInputs(msg) {
    Object.keys(msg.properties).forEach((key) => {
      Node.updateInputs(this.nodes[msg.nodeID], key, msg.properties[key]);
    })
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
    this.setNodeIDOnGrid(x, y, node?.nodeID);
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
    this.updateNBs(x, y);
  }

  updateNBs(x, y) {
    NodiEnums.allVec.forEach((nb) => {
      let nbNode = this.getNodeOnGrid(x + nb.x, y + nb.y);
      if (nbNode) {
        let nodeClass = NodeWork.getNodeType(nbNode.type);
        if (nodeClass.reconnect) nodeClass.reconnect(nbNode, this, [x + nb.x, y + nb.y]);
      }
    });
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

  run() {
    try {
      let order = this.orders.shift();
      if (order) {
        if(order.data?.nodeID != null) {
          this.nodes[order.data.nodeID].orders.push(order);
        } else {
          this.engine.send(order);
        }
      }

      this.nodes.forEach((node) => {
        if (!node) return;
        let curType = NodeWork.getNodeType(node.type);
        if (node.movingTo) {
          let curPos = new Vector2(node.pos[0], node.pos[1]);
          let target = new Vector2(node.movingTo[0], node.movingTo[1]);
          let moveVector = new Vector2(node.movingTo[0] - node.pos[0], node.movingTo[1] - node.pos[1])
            .normalize()
            .multiplyScalar(5);
          //console.log("Dist: ", curPos.distanceTo(target));
          if (curPos.distanceTo(target) > 5) {
            node.pos[0] += moveVector.x;
            node.pos[1] += moveVector.y;
          } else {
            node.pos[0] = target.x;
            node.pos[1] = target.y;
            delete node.movingTo;
          }
  
          io.emit("updatePos", { nodeID: node.nodeID, pos: node.pos });
          //console.log("JA", moveVector);
        }
  
        let order = node.orders.shift();
        if (order) {
          node.engine.send(order);
        }

        if (node.plattform == this.plattform) {
          let results = curType?.run && curType.run(node, this);
          if (this.socketOut && results?.length) {
            //console.log(c)
            results.forEach((propName) => {
                  this.socketOut("updateNode", { nodeID: node.nodeID, prop: propName, properties: this.nodes[node.nodeID].properties[propName] });
              });
          }
        }
      });

      this.cleanUpOutputs.forEach((cleanUp) => {
        let node = this.nodes[cleanUp[0]];
        if (!node) return;
        let prop = node.properties[cleanUp[1]];
        if (!prop) return;
        prop.outValue = null;
        this.cleanUpOutputs = [];
      });
    } catch (e) {
      console.log(e);
    }
  }

  
}
