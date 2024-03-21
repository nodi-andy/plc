import { NodiEnums } from "../../enums.mjs";
import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

class TimeInterval extends Node {
  static type = "time/interval";
  static title = "T";
  static on_color = "#AAA";
  static off_color = "#222";
  static defaultInput = "enable";
  static defaultOutput = "value";

  constructor() {
    super();
    this.properties = {};
    TimeInterval.setup(this.properties);
  }

  static setup(node) {
    let props = node.properties;
    Node.setProperty(props, "enable", {value: 1, autoInput: true});
    Node.setProperty(props, "ton", { value: 500 , autoInput: true});
    Node.setProperty(props, "toff", { value: 500 , autoInput: true});
    Node.setProperty(props, "value");
    Node.setProperty(props, "lastOn", { visible: false});
    Node.setProperty(props, "lastOff", { visible: false});
    this.type = Node.type;
    TimeInterval.reset(props);
  }

  static run(node) {
    let props = node.properties;
    var now = NodiEnums.getTime();
    let ret = false;
    for (let prop of Object.values(props)) {
      if (prop.autoInput && prop.inpValue !== null) {
        for (const inputKeys of Object.keys(prop.inpValue)) {
          prop.value = prop.inpValue[inputKeys].val;
          delete prop.inpValue[inputKeys];
        }
      }
    }

    if (props.value.value == null) props.value.value = 0;

    var dON = now - props.lastOn.value;
    var dOFF = now - props.lastOff.value;
    if (props.value.value == 0 && dOFF > props.toff.value && props.enable.value) {
      props.lastOn.value = now;
      props.value.value = 1;
      props.value.outValue = {val:1, update: true};
      props.value.update = true;
      //console.log("ton");
      ret = true;
    } else if (props.value.value == 1 && dON > props.ton.value && props.enable.value) {
      props.lastOff.value = now;
      props.value.value = 0;
      props.value.outValue = {val:0, update: true};
      props.value.update = true;
      //console.log("toff");
      ret = true;
    }

    return ret;
  }

  static reset(props) {
    props.value.value = 0;
  }

  onDrawBackground() {
    this.boxcolor = this.triggered ? TimeInterval.on_color : TimeInterval.off_color;
    this.triggered = false;
  }
}

NodeWork.registerNodeType(TimeInterval);
