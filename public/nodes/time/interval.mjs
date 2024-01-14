import { NodiEnums } from "../../enums.mjs";
import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

class TimeInterval extends Node {
  static type = "time/interval";
  static title = "T";
  static on_color = "#AAA";
  static off_color = "#222";

  constructor() {
    super();
    this.properties = {};
    TimeInterval.setup(this.properties);
  }

  static setup(node) {
    let props = node.properties;
    Node.setProperty(props, "state");
    Node.setProperty(props, "enable", {value: 1, autoInput: true});
    Node.setProperty(props, "press", { value: 1 });
    Node.setProperty(props, "release", { value: 0 });
    Node.setProperty(props, "ton", { value: 500 });
    Node.setProperty(props, "toff", { value: 500 });
    Node.setProperty(props, "value");
    Node.setProperty(props, "lastOn");
    Node.setProperty(props, "lastOff");
    this.type = Node.type;
    TimeInterval.reset(props);
  }

  static run(node) {
    let props = node.properties;
    var now = NodiEnums.getTime();
    let ret = false;
    for(let propKey in props) {
      let prop = props[propKey];
      if (prop.autoInput && prop.inpValue != null) {
          prop.value = prop.inpValue;
          prop.inpValue = null;
          ret = true;
      }
    }

    if (props.state.value == null) props.state.value = 0;

    var dON = now - props.lastOn.value;
    var dOFF = now - props.lastOff.value;
    if (props.state.value == 0 && dOFF > props.toff.value && props.enable.value) {
      props.lastOn.value = now;
      props.state.value = 1;
      props.state.outValue = 1;
      props.value.value = props.release.value;
      props.value.outValue = props.release.value;
      console.log("ton");
      ret = true;
    } else if (props.state.value == 1 && dON > props.ton.value && props.enable.value) {
      props.lastOff.value = now;
      props.state.value = 0;
      props.state.outValue = 0;
      props.value.value = props.press.value;
      props.value.outValue = props.press.value;
      console.log("toff");
      ret = true;
    }

    return ret;
  }

  static reset(props) {
    props.state.value = 0;
  }

  onDrawBackground() {
    this.boxcolor = this.triggered ? TimeInterval.on_color : TimeInterval.off_color;
    this.triggered = false;
  }
}

NodeWork.registerNodeType(TimeInterval);
