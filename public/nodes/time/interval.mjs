import { NodiEnums } from "../../enums.mjs";
import NodeWork from "../../nodework.mjs";
import { Node } from "../../node.mjs";

class TimeInterval extends Node {
  static type = "time/interval";
  static title = "T";
  static desc = "Interval";
  static on_color = "#AAA";
  static off_color = "#222";

  constructor() {
    super();
    this.properties = {};
    TimeInterval.setup(this.properties);
  }

  static setup(prop) {
    Node.setProperty(prop, "state", { output: true });
    Node.setProperty(prop, "press", { value: 1 });
    Node.setProperty(prop, "release");
    Node.setProperty(prop, "ton", { value: 500 });
    Node.setProperty(prop, "toff", { value: 500 });
    Node.setProperty(prop, "value");
    Node.setProperty(prop, "lastOn");
    Node.setProperty(prop, "lastOff");
    this.type = Node.type;
    TimeInterval.reset(prop);
  }

  static run(prop) {
    var now = NodiEnums.getTime();
    for (let input in prop) {
      if (prop[input].inpValue != null) {
        prop[input].value = parseInt(prop[input].inpValue);
        prop[input].inpValue = null;
      }
    }

    if (prop.state.value == null) prop.state.value = 0;

    var dON = now - prop.lastOn.value;
    var dOFF = now - prop.lastOff.value;
    if (prop.state.value == 0 && dOFF > prop.toff.value) {
      prop.lastOn.value = now;
      prop.state.value = 1;
      prop.state.outValue = 1;
      prop.value.value = prop.release.value;
      prop.value.outValue = prop.release.value;
      console.log("ton");
      return true;
    } else if (prop.state.value == 1 && dON > prop.ton.value) {
      prop.lastOff.value = now;
      prop.state.value = 0;
      prop.state.outValue = 0;
      prop.value.value = prop.press.value;
      prop.value.outValue = prop.press.value;
      console.log("toff");
      return true;
    }

    return false;
  }

  static reset(prop) {
    prop.state.value = 0;
  }

  onExecute(props) {
    return Node.run(props);
  }

  onDrawBackground() {
    this.boxcolor = this.triggered ? TimeInterval.on_color : TimeInterval.off_color;
    this.triggered = false;
  }
}

NodeWork.registerNodeType(TimeInterval);
