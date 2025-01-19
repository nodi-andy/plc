import { NodiEnums } from "../../enums.mjs";
import NodeWork from "../../nodework.mjs";

class TimeInterval extends NodeWork {
  static type = "time/interval";
  static title = "🕑";
  static on_color = "#AAA";
  static off_color = "#222";
  static defaultInput = "enable";
  static defaultOutput = "value";
  static drawBase = false;

  constructor() {
    super();
    this.properties = {};
    TimeInterval.setup(this.properties);
  }

  static setup(node) {
    let props = node.properties;
    NodeWork.setProperty(props, "enable", {value: 1, autoInput: true});
    NodeWork.setProperty(props, "ton", { value: 500 , autoInput: true});
    NodeWork.setProperty(props, "toff", { value: 500 , autoInput: true});
    NodeWork.setProperty(props, "value");
    NodeWork.setProperty(props, "lastOn", { visible: false});
    NodeWork.setProperty(props, "lastOff", { visible: false});
    this.type = NodeWork.type;
    TimeInterval.reset(node);
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
      props.value.outValue = {val:1, update: 1};
      props.value.update = 1;
      //console.log("ton");
      ret = true;
    } else if (props.value.value == 1 && dON > props.ton.value && props.enable.value) {
      props.lastOff.value = now;
      props.value.value = 0;
      props.value.outValue = {val:0, update: 1};
      props.value.update = 1;
      //console.log("toff");
      ret = true;
    }
    for (const prop of Object.values(node.properties)) {
      if (prop.outValue?.update > 1) prop.outValue.update = 0;
  }
    return ret;
  }

  static reset(node) {
    node.properties.value.value = 0;
    node.properties.lastOn.value = 0;
    node.properties.lastOff.value = 0;
  }

  static onDrawForeground(node, ctx) {
    var x = node.size[0] * 0.5;
    var h = node.size[1];

    ctx.textAlign = "center";
    ctx.font = (h * 0.6).toFixed(1) + "px Arial";
    ctx.fillStyle = "#000";
    if (this?.title?.length) ctx.fillText(this.title, x, h);
}

}

NodeWork.registerNodeType(TimeInterval);
