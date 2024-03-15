import { NodiEnums } from "./enums.mjs";
import Node from "./node.mjs";
import Vector2 from "./vector2.mjs";

export default class NodeWork extends Node {
  static debug = false;
  static registered_node_types = {}; //nodetypes by string
  static Nodes = {}; //node types by classname
  static events =  {
    moveNodeOnGrid : NodeWork.moveNodeOnGrid,
    setNodeOnGrid : NodeWork.setNodeOnGrid,
    rotateNode : NodeWork.rotateNode,
    setNodework : NodeWork.setNodework,
    updateNode : this.updateNode,
    createNode : NodeWork.createNode,
    updateInputs : this.updateInputs,
    removeNode : NodeWork.removeNode,
    clear : NodeWork.clear
  }

  static engines =  {
    "browser": (node, order)=> {
                      if(NodeWork[order.cmd]) NodeWork[order.cmd](node, order.data);
                    },
    "serial": (node, order) => {
                      console.log("Forward:Serial : ", order);
                      if (window.serialwriter) { // send to server
                        const encoder = new TextEncoder();
                  
                        window.serialwriter.write(encoder.encode(JSON.stringify([order.cmd, order.data])));
                      } 
                      
                      // if (websocket.send && websocket.readyState == 1) { // send to IoT
                        //  websocket.send(JSON.stringify([cmd, obj]));
                        // } 
                    }
  }

  constructor(id) {
    super();
    if (NodeWork.debug) console.log("Graph created");
    NodeWork.clear(this);
    if (id) this.nodeID = id;

    this.socketOut = null;
    this.type = "basic/subnode";
    this.size = [NodiEnums.CANVAS_GRID_SIZE, NodiEnums.CANVAS_GRID_SIZE];
  }

  static getFirstNullIndex(arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == null) {
        return i;
      }
    }
    return arr.length; // If no null item is found
  }

  static registerNodeType(base_class) {
    if (!base_class.prototype) {
      throw "Cannot register a simple object, it must be a class with a prototype";
    }

    if (NodeWork.debug) {
      console.log("Node registered: " + base_class.type);
    }

    let classType = base_class.type;
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

    prev = this.registered_node_types[classType];
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

  static unregisterNodeType(type) {
    var base_class = type.constructor === String ? this.registered_node_types[type] : type;
    if (!base_class) throw "node type not found: " + type;
    delete this.registered_node_types[base_class.type];
    if (base_class.constructor.name) delete this.Nodes[base_class.constructor.name];
  }

  static getNodeType(type) {
    return this.registered_node_types[type];
  }

  static processMethodsAndObjects(obj, parent, type) {
    // Loop through each property of the object
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (key == "parent") continue;
      
      // Check if the property is an object
      if (typeof value === 'object' && value !== null) {
        // If it's an object, recursively process this object
        if (type == "unlink") {
          delete value.parent;
          if (value?.engine?.name == "serial") {
            value.nodes = [];
            value.nodesByPos = {};
            value.orders = [];
            continue;
          } 
        } else {
          if (value.type != null) value.parent = parent
          if (value.type == "remote/serial") {
            NodeWork.Nodes["ComPort"].openSerial();
            window.serialNodeWork = value;
          }
        }

        NodeWork.processMethodsAndObjects(value, obj, type);
      }
    }
  }

  static save(nw) {
    let saveNW = structuredClone(nw);
    NodeWork.processMethodsAndObjects(saveNW, null, "unlink");
      localStorage["nodework"] = JSON.stringify(saveNW); 
      
      window.showSnackbar("Nodework saved in browser");
  }

  static load() {
    window.showSnackbar("Loaded nodework" );
    let storedNW = JSON.parse(localStorage["nodework"]);
    NodeWork.processMethodsAndObjects(storedNW, null, "link");

    return storedNW;
  }

  static cmd(nw, msg) {
    nw.orders.push(msg);
  }

  static publish(nw, event, data) {
    if (nw.socketOut) nw.socketOut(event, data);
  }

  static createNode(node, msg, socket) {
    //NodeWork.clear(msg.node);
    node.nodes[msg.node.nodeID] = msg.node;
    msg.node.engine = node.engine;
    if (msg.node.type == "remote/serial") {
      window.serialNodeWork = msg.node;
      msg.node.engine = {name: "serial"};
      msg.node.nodesByPos = {};
      msg.node.orders = [];
      msg.node.nodes = [];
      node.nodes[msg.node.nodeID] = msg.node;
    } 
    node.nodes[msg.node.nodeID].parent = node;
    msg.node.owner = socket?.id;
    msg.node.moving = false;
    msg.nodeID = msg.node.nodeID;
    NodeWork.setNodeIDOnGrid(node, msg.pos[0], msg.pos[1], msg.nodeID);
    NodeWork.publish("createNode", msg);
    return msg.node;
  }

  static sendToEngine(engine, node, data) {
    NodeWork.engines[engine.name](node, data);
  }

  static rotateNode(nw, msg) {
    let node = NodeWork.getNodeOnGrid(nw, msg.pos[0], msg.pos[1]);
    if (node) {
      node.direction = (node.direction + 1) % 4;
      NodeWork.updateNBs(nw, msg.pos[0], msg.pos[1]);
    }
    //this.publish("rotateNode", msg);
  }

  /**
   * Removes all child nodes
   */
  static clear(node) {
    node.nodes = [];
    node.nodesByPos = {};
    node.orders = [];
    if (node.engine == null) node.engine = {name: "browser"};
  }

  static setNodeOnGrid(node, msg) {
    if (msg?.nodeID == null || msg?.pos == null) return;
    node.setNodeIDOnGrid(msg.pos[0], msg.pos[1], msg.nodeID);
  }

  static moveNodeOnGrid(nw, msg) {
    if (!msg) return;

    let node = nw.nodes[msg.nodeID];
    if (node.moving) node.moving = false;

    let next_gridPos = msg.to;
    if (NodeWork.getNodeOnGrid(nw, next_gridPos[0], next_gridPos[1]) == null) {
      if (msg.from) {
        NodeWork.setNodeIDOnGrid(nw, msg.from[0], msg.from[1], null);
      }
      NodeWork.setNodeIDOnGrid(nw, msg.to[0], msg.to[1], node.nodeID);
    }

    //this.publish("moveNodeOnGrid", msg);
  }

  static removeNode(nw, msg) {
    NodeWork.setNodeIDOnGrid(nw, msg.pos[0], msg.pos[1], null);
    //this.publish("removeNode", msg);
  }

  static updateNode(nw, msg) {
    if (typeof msg.properties == "object") {
      Object.keys(msg.properties).forEach((key) => {
        Node.updateProp(nw.nodes[msg.nodeID], msg.prop, key, msg.properties[key]);
      })
    } else {
      Node.updateProp(nw.nodes[msg.nodeID], msg.prop, "value", msg.properties);
    }
  }

  static updateInputs(nw, msg) {
    Object.keys(msg.properties).forEach((key) => {
      Node.updateInputs(nw.nodes[msg.nodeID], key, msg.properties[key]);
    })
  }
  
  static getNodeById(nw, id) {
    if (id == null) return null;
    return nw.nodes[id];
  }

  static getNodeOnPos(node, x, y) {
    let gridPos = [];
    gridPos[0] = Math.floor(x / NodiEnums.CANVAS_GRID_SIZE);
    gridPos[1] = Math.floor(y / NodiEnums.CANVAS_GRID_SIZE);
    return NodeWork.getNodeOnGrid(node, gridPos[0], gridPos[1]);
  }

  static getNodeOnGrid(nw, x, y) {
    let node = NodeWork.getNodeById(nw, NodeWork.getNodeIDOnGrid(nw, x, y));
    if (node) {
      return node;
    } else {
      return null;
    }
  }

  static getNodeIDOnGrid(nw, x, y) {
    return nw.nodesByPos[x + NodiEnums.POS_SEP + y];
  }

  static setNodeIDOnGrid(node, x, y, id) {
    if (id == null) {
      delete node.nodesByPos[x + NodiEnums.POS_SEP + y];
    } else {
      node.nodesByPos[x + NodiEnums.POS_SEP + y] = id;
    }
    NodeWork.updateNBs(node, x, y);
  }

  static reconnectByPos(nw, x, y){
    let nbNode = NodeWork.getNodeOnGrid(nw, x, y);
    if (nbNode) {
      let nodeClass = NodeWork.getNodeType(nbNode.type);
      if (nodeClass.reconnect) nodeClass.reconnect(nbNode, nw, [x, y]);
    }
  }

  static updateNBs(node, x, y) {
    NodiEnums.allVec.forEach((nb) => {
      NodeWork.reconnectByPos(node, x + nb.x, y + nb.y)
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

  static setNodework(nw, data) {
    if (!data) return;
    try {
      //NodeWork.clear(this);
      for(let nodeID in data.nodes) {
        // TBD: decide the node structure
        let node = data.nodes[nodeID];
        
        if (data.nodes[nodeID].node) {
          node = data.nodes[nodeID].node;
          node.type = data.nodes[nodeID].type;
        }
        if (Object.keys(node).length === 0 || node.type == null) continue;

        let curType = NodeWork.getNodeType(node.type);
        curType.setup(node);

        node.parent = nw;
        node.orders = [];
        node.engine = nw.engine;
        node.size = [NodiEnums.CANVAS_GRID_SIZE, NodiEnums.CANVAS_GRID_SIZE];
        nw.nodes[node.nodeID] = node;
      }
      
      if (data.nodesByPos) {
        nw.nodesByPos = data.nodesByPos;
        for(let nodePos in nw.nodesByPos) {
          let [x , y] = nodePos.split(NodiEnums.POS_SEP);
          x = parseInt(x);
          y = parseInt(y);
          nw.reconnectByPos(x, y);
        }
      }
    } catch (e) {
      e;
    }
    return false;
  }

  static run(nw) {
    try {
      let order = nw.orders.shift();
      if (order) {
        if(order.data?.nodeID != null) {
          nw.nodes[order.data.nodeID].orders.push(order);
        } else {
          NodeWork.sendToEngine(nw.engine, nw, order);
        }
      }
      if (nw.engine.name != "browser") return;
      nw.nodes?.forEach((node) => {
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
  
          //io.emit("updatePos", { nodeID: node.nodeID, pos: node.pos });
          //console.log("JA", moveVector);
        }
  
        let order = node.orders.shift();
        if (order) {
          NodeWork.sendToEngine(nw.engine, nw, order);
        }

        let results = curType?.run && curType.run(node, nw);
        if (nw.socketOut && results?.length) {
          //console.log(c)
          results.forEach((propName) => {
            nw.socketOut("updateNode", { nodeID: node.nodeID, prop: propName, properties: this.nodes[node.nodeID].properties[propName] });
          });
        }
      });

    } catch (e) {
      console.log(e);
    }
  }


  static updateProp(node, name, val) {
      node.properties[name].inpValue = val;
      window.nodes.update(node.nodeID, node.properties);
  }

  static onMouseUp(node) {
      window.nodeWork = node;
      window.canvas.setGraph(node);
      window.showParent(true);
      return true;
  }
}
