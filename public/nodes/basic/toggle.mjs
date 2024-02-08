import Node from "../../node.mjs";
import NodeWork from "../../nodework.mjs";

export default class WidgetToggle extends Node {
  static type = "basic/toggle";
  static title = "";
  static defaultOutput = "value";

  static setup(node) {
    let props = node.properties;
    Node.setProperty(props, "value", { value: 0, input: false });
    Node.setProperty(props, "press", { value: 1, input: false, autoInput: true });
    Node.setProperty(props, "release", {value: 0, input: false, autoInput: true });
    Node.setProperty(props, "state", { value: 0, autoInput: true});
    Node.setProperty(props, "toggle");
    Node.setProperty(props, "label", { value: "", autoInput: true });
    Node.setProperty(props, "port", {  input: false });
    Node.setProperty(props, "color", { value: "red", input: false, autoInput: true });
    WidgetToggle.reset(props);
  }

  static run(node) {
    let props = node.properties;
    let ret = [];
    for (let prop of Object.values(props)) {
      if (prop.autoInput && prop.inpValue !== null) {
        for (const inputKeys of Object.keys(prop.inpValue)) {
          prop.value = prop.inpValue[inputKeys].val;
          delete prop.inpValue[inputKeys];
        }
      }
    }

    let newState;
    let valueUpdate = false;
    let maxVal = -Infinity;

    for (const valueInputs of Object.values(props.toggle.inpValue)) {
      if (valueInputs.update === true) valueUpdate = true;
      maxVal = Math.max(maxVal, valueInputs.val);
      valueInputs.update = false;
    }

    if (valueUpdate) {
      newState = props.state.value ? 0 : 1;
    }

    if (Object.keys(props.state.inpValue).length !== 0) {
      newState = Object.values(props.state.inpValue).reduce(
        (a, b) => {
          b.val = Number(b.val);
          b.update = false;
          if (typeof b.val === "number" && !isNaN(b.val)) {
            return Math.max(a.val, b.val);
          }
          return a.val;
        },
        { val: 0, update: false }
      );
    }

    if (Object.keys(props.value?.inpValue).length) {
      if (props.state?.value == 1 && props.value.inpValue.update) {
        props.value.outValue = props.value.inpValue;
        props.value.inpValue.udpate = false;
        ret.push("state");
      }
    } else {
      if (newState == 0 && props.state.value == 1) {
        props.value.outValue = props.release.value;
        props.state.value = newState;
        ret.push("state");
        ret.push("value");
      }
      if (newState == 1 && props.state.value == 0) {
        props.value.outValue = props.press.value;
        props.state.value = newState;
        ret.push("state");
        ret.push("value");
      }

    }

    return ret;
  }

  static reset(prop) {
    prop.value.value = prop.release.value;
    prop.value.outValue = prop.value.value;
  }

  static onDrawForeground(node, ctx) {
    var size = node.size[1] * 0.5;
    var margin = 0.25;
    var y = node.size[1] * 0.25;
    var x = node.size[0] * 0.25;

    ctx.fillStyle = "#AAA";
    ctx.fillRect(x, y, size, size);

    ctx.fillStyle = node.properties.state.value ? node.properties.color.value : "#000";
    ctx.fillRect(x + size * margin, y + size * margin, size * (1 - margin * 2), size * (1 - margin * 2));

    if (node.properties.label.length) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#AAA";
      ctx.fillText(node.properties.label.value, node.size[0] * 0.5, 10);
    }
  }

  static updateProp(node, name, val) {
    node.properties[name].value = val;
    window.nodes.update(node.nodeID, node.properties);
  }

  static onMouseDown(node, e, local_pos) {
    if (
      local_pos[0] > node.size[0] * 0.25 &&
      local_pos[1] > node.size[0] * 0.25 &&
      local_pos[0] < node.size[0] * 0.75 &&
      local_pos[1] < node.size[1] * 0.75
    ) {
      window.nodes.update(node.nodeID, { toggle: { inpValue: 1 } });
      return true;
    }
    return false;
  }
}

NodeWork.registerNodeType(WidgetToggle);
