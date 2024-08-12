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
    addNode : NodeWork.addNode,
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
    if (!arr || arr.length == null) return 0;
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
    return !type || this.registered_node_types[type];
  }
  static updateNodeList() {
    window.list = {};
    for (let nodeClassName in NodeWork.registered_node_types) {
      let nodeClass = NodeWork.registered_node_types[nodeClassName];
      if (window.list[nodeClass.category] == null) window.list[nodeClass.category] = [];
      window.list[nodeClass.category].push(nodeClass.elementName);
    }
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
          if (value.type == "network/serial") {
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
    storedNW.nodes.forEach(n => {
      let nodeClass = NodeWork.getNodeType(n.type);
      if (nodeClass.reset) nodeClass.reset(n);
    })

    return storedNW;
  }

  static cmd(nw, msg) {
    if (nw?.orders) nw.orders.push(msg);
  }

  static publish(nw, event, data) {
    if (nw.socketOut) nw.socketOut(event, data);
  }

  static addNode(parentNode, msg, socket) {
    let allowNode = true;
    msg.type = msg.type.toLowerCase();
    if (msg.type == "network/serial" && window.serialport) {
      NodeWork.Nodes["ComPort"].openSerial();
    } 
    if (msg.type == "network/serial" && window.serialport == null) {
      allowNode = false
    }
    if (allowNode == false) return;

    //NodeWork.clear(msg.node);
    if (msg.nodeID == null) msg.nodeID = NodeWork.getFirstNullIndex(parentNode.nodes);
    if (msg.type == "network/serial") {
      window.serialNodeWork = msg.node;
      msg.node.engine = {name: "serial"};
    } 

    if (msg.node == null) {
      msg.node = {};
      msg.node.engine = {name:"browser"};
      msg.node.nodesByPos = {};
      msg.node.orders = [];
      msg.node.nodes = [];
      msg.node.properties = {};
      msg.node.type = msg.type;
      msg.node.pos = msg.pos;
      msg.node.size = [NodiEnums.CANVAS_GRID_SIZE, NodiEnums.CANVAS_GRID_SIZE];
      msg.node.parent = parentNode;
      msg.node.owner = socket?.id;
      msg.node.moving = false;
      msg.node.nodeID = msg.nodeID;
      NodeWork.getNodeType(msg.type).setup(msg.node);
      parentNode.nodes[msg.nodeID] = msg.node;
    }
    
    NodeWork.setNodeIDOnGrid(parentNode, msg.pos[0], msg.pos[1], msg.node.nodeID);
    NodeWork.publish("addNode", msg);
    return msg.node;
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
    node.properties = {};
    if (node.engine == null) node.engine = {name: "browser"};
  }

  static setNodeOnGrid(nw, msg) {
    if (msg?.nodeID == null || msg?.pos == null) return;
    NodeWork.setNodeIDOnGrid(nw, msg.pos[0], msg.pos[1], msg.nodeID);
  }

  static moveNodeOnGrid(nw, msg) {
    if (!msg) return;

    let node = nw.nodes[msg.id];
    if (!node) return;

    NodeWork.replaceNodeOnGrid(nw, msg)

    if (NodeWork.getNodeType(node.type).moveable) {
      node.comingFrom = [msg.from[0], msg.from[1]];
      node.pos = [msg.to[0], msg.to[1]];
    }
    //this.publish("moveNodeOnGrid", msg);
  }

  static replaceNodeOnGrid(nw, msg) {
    let next_gridPos = msg.to;
    if (NodeWork.getNodeOnGrid(nw, next_gridPos[0], next_gridPos[1]) == null) {
      if (msg.from) {
        NodeWork.setNodeIDOnGrid(nw, msg.from[0], msg.from[1], null);
      }
      NodeWork.setNodeIDOnGrid(nw, msg.to[0], msg.to[1], msg.id);
    }
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
    if (nw.nodesByPos) {
      return nw.nodesByPos[x + NodiEnums.POS_SEP + y];
    }
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
      if (nodeClass?.reconnect) nodeClass.reconnect(nbNode, nw, [x, y]);
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
          NodeWork.reconnectByPos(nw, x, y);
        }
      }
    } catch (e) {
      e;
    }
    return false;
  }

  static run(nw) {
    if (nw == null) return;
    let order = nw?.orders?.shift();
    if (order) {
       NodeWork.engines[nw.engine.name](nw, order);
    }
    if (nw.engine?.name != null && nw.engine.name != "browser") return;
    nw.nodes?.forEach((node) => {
      if (!node) return;
      let curType = NodeWork.getNodeType(node.type);
      if (node.comingFrom) {
        node.targetPos = new Vector2(node.pos[0], node.pos[1]);
        let startPos = new Vector2(node.comingFrom[0], node.comingFrom[1]);
        if (!node.offset) 
          node.offset = node.targetPos.clone().sub(startPos).negate();


        node.currentPos = node.targetPos.clone().sub(node.offset);

        let distance = node.targetPos.clone().sub(node.currentPos);
        const step = 0.2;
        let dir = distance.clone().normalize().multiplyScalar(step);
        //console.log("Dist: ", curPos.distanceTo(target));
        if (distance.length() > step) {
          node.offset.sub(dir);
        } else {
          delete node.offset;
          delete node.comingFrom;
        }

        //io.emit("updatePos", { nodeID: node.nodeID, pos: node.pos });
        //console.log("JA", moveVector);
      }

      let order = node?.orders?.shift();
      if (order) {
        NodeWork.engines[nw.engine.name](node, order);
      }

      let results = [];
      let runFunc = node.run;
      if (!runFunc) runFunc = curType?.run;
      if (runFunc /*&& (curType.type == "basic/connector" || this.checkValueUpdate(node.properties)) : run always*/) {
        results = runFunc(node, nw);
        NodeWork.run(node);
      } 

      if (nw.socketOut && results?.length) {
        //console.log(c)
        results.forEach((propName) => {
          nw.socketOut("updateNode", { nodeID: node.nodeID, prop: propName, properties: this.nodes[node.nodeID].properties[propName] });
        });
      }
    });
  }

  static updateProp(node, name, val) {
      node.properties[name].inpValue = val;
      window.update(node.nodeID, node.properties);
  }

  static reselect(node) {
      window.currentNodeWork = node;
      window.showParent(true);
      return true;
  }
}
