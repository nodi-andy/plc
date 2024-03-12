import NodeWork from "../../nodework.mjs";

export default class SerialPort extends NodeWork {
  static type = "remote/serial";
  static title = "COM";

  static onDrawForeground(node, ctx) {
    let props = node.properties;
    
  }

  static setup(node) {
    let props = node.properties;
  }

  static run(node) {
    let ret = [];
    return ret;
  }



}

NodeWork.registerNodeType(SerialPort);
