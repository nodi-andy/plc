import { globalApp, NodiEnums } from "./enums.mjs";

export default class NodeWork {
  static registered_node_types = {}; //nodetypes by string
  static Nodes = {}; //node types by classname
  static events =  {
    moveNodeOnGrid : NodeWork.moveNodeOnGrid,
    setNodeOnGrid : NodeWork.setNodeOnGrid,
    setNodeIDOnGrid : NodeWork.setNodeIDOnGrid,
    rotateNode : NodeWork.rotateNode,
    setNodework : NodeWork.setNodework,
    updateNode : NodeWork.updateNode,
    addNode : NodeWork.addNode,
    updateInputs : NodeWork.updateInputs,
    removeNode : NodeWork.removeNode,
    clear : NodeWork.clear
  }

  static engines =  {
    "local": (node, order)=> {
                      if(NodeWork[order.cmd]) NodeWork[order.cmd](node, order.data);
                    },
    "serial": (node, order) => {
                      console.log("Forward:Serial : ", order);
                      if (window.serialwriter) { // send to server
                        const encoder = new TextEncoder();
                  
                        window.serialwriter.write(encoder.encode(JSON.stringify([order.cmd, order.data])));
                      } 
                      
                    },
    "socketIO": (node, order) => {
      console.log("Forward:socketIO : ", order);
       if (window.socketIO.emit) { // send to IoT
        window.socketIO.emit(order.cmd, order);
       } 
      
    }
                    
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
      for (var i in NodeWork.prototype) {
        if (!base_class.prototype[i]) {
          base_class.prototype[i] = NodeWork.prototype[i];
        }
      }
    }

    prev = this.registered_node_types[classType];
    if (prev) console.log("replacing node type: " + classType);
    else {
      //warnings
      if (base_class.prototype.onPropertyChange) {
        console.warn("node class " + classType + " has onPropertyChange method, it must be called onPropertyChanged with d at the end");
      }
    }

    this.registered_node_types[classType] = base_class;
    if (base_class.constructor.name) {
      this.Nodes[classname] = base_class;
    }
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
    nw.nodes.forEach((n) => {
      if (n.init) delete n.init;
      if (n.run) delete n.run;
      if (n.onDrawForeground) delete n.onDrawForeground;
    })
    let saveNW = structuredClone(nw);
    NodeWork.processMethodsAndObjects(saveNW, null, "unlink");
    localStorage["nodework"] = JSON.stringify(saveNW); 
    nw.nodes.forEach((node) => {
      node.init = new Function('node', node.initStr);
      node.init.bind(node);
      node.init();

      
      node.init = new Function('node', node.initStr);
      node.init.bind(node);
      
      node.run = new Function('node', node.runStr);
      node.run.bind(node);

      node.onDrawForeground = new Function('node', 'ctx', node.drawStr);
      node.onDrawForeground.bind(node);
    })
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
    if(!msg) return;
    if (nw?.orders) nw.orders.push(msg);
  }


  static addNode(parentNode, msg) {
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
    if (msg.nodeID == null) msg.nodeID = NodeWork.getFirstNullIndex(globalApp.data[parentNode.roomId].nodeContainer);
    if (msg.type == "network/serial") {
      window.serialNodeWork = msg.node;
      msg.node.engine = {name: "serial"};
    } 

    if (msg.node == null) {
      msg.node = {};
      msg.node.engine = msg.engine || globalApp.data[parentNode.roomId].engine;
      msg.node.nodesByPos = {};
      msg.node.orders = [];
      msg.node.nodes = [];
      msg.node.properties = {};
      msg.node.type = msg.type;
      msg.node.pos = msg.pos;
      msg.node.size = [NodiEnums.CANVAS_GRID_SIZE, NodiEnums.CANVAS_GRID_SIZE];
      msg.node.parent = parentNode.nodeID;
      msg.node.platform = parentNode.platform || "server";
      msg.node.owner = msg.owner;
      msg.node.roomId = msg.roomId;
      msg.node.moving = false;
      msg.node.nodeID = msg.nodeID;
      NodeWork.getNodeType(msg.type).setup(msg.node);
    }
    
    parentNode.nodes[msg.nodeID] = msg.node.nodeID;

    let container = globalApp.data[parentNode.roomId]?.nodeContainer;
    if (!container) container = globalApp.data.nodeContainer;
    container[msg.nodeID] = msg.node;
    NodeWork.setNodeIDOnGrid(parentNode, msg);
    if (parentNode.socketOut) parentNode.socketOut("addNode", {data: msg});
    return msg.node;
  }

  static rotateNode(nw, msg) {
    let node = NodeWork.getNodeOnGrid(nw, msg.pos[0], msg.pos[1]);
    if (node) {
      node.direction = (node.direction + 1) % 4;
      NodeWork.updateNBs(nw, msg.pos[0], msg.pos[1]);
    }
  }

  /**
   * Removes all child nodes
   */
  static clear(node) {
    if (!node) node = {}
    node.nodes = [];
    node.nodesByPos = {};
    node.orders = [];
    node.properties = {};
    if (node.engine == null) node.engine = {name: "client"};
    return node;
  }

  static setProperty(properties, name, info) {
    if (!properties) return;
    if (properties[name]) return;
    
    properties[name] = {};

    var prop = properties[name];
    if (!prop.name) prop.name = name;
    if (!prop.inpValue) prop.inpValue = {};
    if (!prop.value) prop.value = null;
    if (!prop.outValue) prop.outValue = {};
    for (let i in info) {
      prop[i] = info[i];
    }
  }

  static clone(node) {
    let data = { ...node };
    for (let key in data) {
      node[key] = data[key];
    }

    return node;
  }

  static checkValueUpdate(props) {
    return Object.values(props).some(prop =>
        prop.inpValue && Object.values(prop.inpValue).some(input => input.update === 1)
    );
  }

  static setNodeOnGrid(nw, msg) {
    if (msg?.nodeID == null || msg?.pos == null) return;
    NodeWork.setNodeIDOnGrid(nw, msg);
  }

  static updateProp(node, propName, propType, value) {
    if (!node) return;
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



  static updateValues(node, key, prop) {
    node.properties[key]["value"] = {val: prop["value"], update: 1};
  }

  static updateOutputs(node, key, prop) {
    node.properties[key]["outValue"] = {val: prop["outValue"], update: 1};
  }

  static moveNodeOnGrid(nw, msg) {
    if (!msg) return;
    let container = globalApp.data[nw.roomId]?.nodeContainer;
    if (!container) container = globalApp.data.nodeContainer

    let parent = container[msg.parentID];

    if (!parent) return;

    if (NodeWork.getNodeOnGrid(parent, msg.to[0], msg.to[1]) == null) {
      if (msg.from) {
        NodeWork.setNodeIDOnGrid(parent, msg);
      }
      NodeWork.setNodeIDOnGrid(parent, msg);
    }
    container[msg.id].pos = msg.to;


    if (parent.socketOut) parent.socketOut("moveNodeOnGrid", {data: msg});

  }

  static removeNode(nw, msg) {

    let container = globalApp.data[nw.roomId]?.nodeContainer;
    if (!container) container = globalApp.data.nodeContainer
    // Find the node by ID
    let parent = container[msg.parentID];
    let node = container[msg.nodeID];
    
    if (!node) {
        console.warn(`Node with ID ${msg.nodeID} not found.`);
        return;
    }

    // Remove the node from nodesByPos
    delete parent.nodesByPos[node.pos[0] + NodiEnums.POS_SEP + node.pos[1]];
    
    // Remove the node from nodes array
    delete parent.nodes[msg.nodeID];
    delete container[msg.nodeID];

    if (parent.socketOut) parent.socketOut("removeNode", {data: {parentID: msg.parentID, nodeID: msg.nodeID}});

    console.log(`Node with ID ${msg.nodeID} removed.`);
  }

  static updateNode(nw, msg) {
    if (typeof msg.properties == "object" && msg.properties != null) {
      Object.keys(msg.properties).forEach((key) => {
        NodeWork.updateProp(globalApp.data.nodeContainer[msg.nodeID], msg.prop, key, msg.properties[key]);
      })
    } else {
      NodeWork.updateProp(globalApp.data.nodeContainer[msg.nodeID], msg.prop, "value", msg.properties);
    }
  }

  static updateInputs(nw, msg) {
    console.log("[updateInputs]");
    let node = globalApp.data[nw.roomId].nodeContainer[msg.nodeID];
    let key = Object.keys(msg.properties)[0];
    if (node.properties[key])
      node.properties[key]["inpValue"]["user"] = {val: msg.properties[key].inpValue, update: 1};
    else {
      console.log("error");
    }
  }
  
  static getNodeById(nw, id) {
    if (id == null) return null;
    let container = globalApp.data[nw.roomId]?.nodeContainer || globalApp.data.nodeContainer;
    return container[id];
  }

  static getNodeOnPos(node, x, y) {
    let gridPos = [];
    gridPos[0] = Math.floor(x / NodiEnums.CANVAS_GRID_SIZE);
    gridPos[1] = Math.floor(y / NodiEnums.CANVAS_GRID_SIZE);
    return NodeWork.getNodeOnGrid(node, gridPos[0], gridPos[1]);
  }

  static getNodeOnGrid(nw, x, y) {
    let node = NodeWork.getNodeById(nw, NodeWork.getNodeIDOnGrid(nw, x, y));
    return node;
  }

  static getNodeIDOnGrid(nw, x, y) {
    if (nw.nodesByPos) {
      return nw.nodesByPos[x + NodiEnums.POS_SEP + y];
    }
  }

  static setNodeIDOnGrid(parentNode, msg) {
    if (msg.nodeID == null) {
      delete parentNode.nodesByPos[msg.pos[0] + NodiEnums.POS_SEP + msg.pos[1]];
    } else {
      parentNode.nodesByPos[msg.pos[0] + NodiEnums.POS_SEP + msg.pos[1]] = msg.nodeID;
    }
    NodeWork.updateNBs(parentNode, msg.pos[0], msg.pos[1]);
    if (parentNode.socketOut) parentNode.socketOut("setNodeIDOnGrid", msg);
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
    globalApp.data.nodeContainer = data.nodelist;
    window.rootNode = globalApp.data.nodeContainer[data.nodeworkID];
    window.currentNodeWork = window.rootNode;
    window.currentNodeWork.platform = globalApp.platform;

    data.nodelist.forEach((n) => 
    {
      if(!n) return;
      n.platform = globalApp.platform;
    })
    /*
    try {
      //NodeWork.clear(this);
      for(let nodeID of data.nodes) {
        if (!nodeID) continue;
        let node = globalApp.data.nodeContainer[nodeID];
        if (!node) continue;
      
        if (Object.keys(node).length === 0 || node.type == null) continue;

        let curType = NodeWork.getNodeType(node.type);
        curType.setup(node);

        node.parent = nw.nodeID;
        node.orders = [];
        node.engine = nw.engine;
        node.size = [NodiEnums.CANVAS_GRID_SIZE, NodiEnums.CANVAS_GRID_SIZE];
        nw.nodes[node.nodeID] = nodeID;
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
    return false;*/
  }

  static run(nw) {
    if (nw == null) return;
    let order = nw?.orders?.shift();
    if (order) {
      order.data.parentID = nw.nodeID;
       NodeWork.engines[nw.engine.name == nw.platform ? "local" : "socketIO"](nw, order);
    }

    if (nw.engine?.name !== nw.platform)  return;
    nw.nodes?.forEach((nodeID) => {
      let node = globalApp.data[nw.roomId].nodeContainer[nodeID];
      if (!node) return;
      if (node.engine?.name !== node.platform)  return;

      let curType = NodeWork.getNodeType(node.type);
      /*if (node.comingFrom) {
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
      }*/

      let order = node?.orders?.shift();
      if (order) {
        NodeWork.engines[nw.engine.name == nw.platform ? "local" : "socketIO"](node, order);
      }

      let results = [];
      let runFunc = node.run;
      if (!runFunc) runFunc = curType?.run;
      if (runFunc && node.engine?.name == node.platform) {
        runFunc = runFunc.bind(node);
        results = runFunc(node, nw);
        NodeWork.run(node);
      } 

      if (nw.socketOut && results?.length) {
        //console.log(c)
        results.forEach((propName) => {
          nw.socketOut("updateNode", {data: { nodeID: node.nodeID, prop: propName, properties: node.properties[propName].value }});
        });
      }
    });
  }

  static reselect(node) {
    let nodeClass = NodeWork.getNodeType(node?.type);

    if (nodeClass.isParent) {
      window.currentNodeWork = node;
      window.showParent(true);
      return true;
    }
  }
  
  static findNodes(targetNode, range, filterFunc = null) {

    let container = globalApp.data[targetNode.roomId]?.nodeContainer;
    if (!container) container = globalApp.data.nodeContainer;
    let nw = container[targetNode.parent];
    if (!nw) return [];
    let nodesWithinRange = [];

    nw.nodes.forEach((nodeID) => {
        let node = container[nodeID];
        if (node && node.nodeID !== targetNode.nodeID) {
            let distance = Math.hypot(
                node.pos[0] - targetNode.pos[0],
                node.pos[1] - targetNode.pos[1]
            );

            if (distance <= range) {
                // Apply custom filter function if provided
                if (filterFunc && typeof filterFunc === 'function') {
                    if (filterFunc(node)) {
                        nodesWithinRange.push(node.nodeID);
                    }
                } else {
                    nodesWithinRange.push(node.nodeID);
                }
            }
        }
    });

    return nodesWithinRange;
}



}