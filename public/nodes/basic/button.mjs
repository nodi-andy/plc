import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class Button extends Node {
  static type = "basic/button";
  static title = " ";
  static margin = 12;
  static defaultOutput = "value";
  static defaultInput = "press";

  static onDrawForeground(node, ctx) {
    let props = node.properties;
    if (props.state.value == 1) {
      Button.margin = 16;
    } else {
      Button.margin = 14;
      ctx.fillStyle = "black";
      ctx.fillRect(
        Button.margin + 2,
        Button.margin + 2,
        node.size[0] - Button.margin * 2,
        node.size[1] - Button.margin * 2
      );
    }

    ctx.fillStyle = props.color.value;
    ctx.fillRect(Button.margin, Button.margin, node.size[0] - Button.margin * 2, node.size[1] - Button.margin * 2);

    if (props.label || props.label.value === 0) {
      var font_size = props.font_size || 30;
      ctx.textAlign = "center";
      ctx.fillStyle = props.state.value ? "black" : "white";
      ctx.font = font_size + "px Arial";
      ctx.fillText(props.label.value, node.size[0] * 0.5, node.size[1] * 0.5 + font_size * 0.3);
      ctx.textAlign = "left";
    }
  }

  static onMouseDown(node, e, local_pos) {
    if (
      local_pos[0] > Button.margin &&
      local_pos[1] > Button.margin &&
      local_pos[0] < node.size[0] - Button.margin &&
      local_pos[1] < node.size[1] - Button.margin
    ) {
      //this.properties.state.value = this.properties.press.value;
      //this.properties.state.outValue = this.properties.state.value;
      window.nodes.updateInputs(node.nodeID, { state: { inpValue: 1 } });
      return true;
    }

    return false;
  }

  static onMouseUp(node, e) {
    window.nodes.updateInputs(node.nodeID, { state: { inpValue: 0 } });
    return true;
  }

  static setup(node) {
    let props = node.properties;
    Node.setProperty(props, "state");
    Node.setProperty(props, "press", { value: 1 });
    Node.setProperty(props, "release", { value: 0 });
    Node.setProperty(props, "value", { value: null });
    Node.setProperty(props, "label", { value: ""});
    Node.setProperty(props, "port", { value: 0, input: false , autoInput: true});
    Node.setProperty(props, "color", { value: "#222", input: false, autoInput: true });
    Button.reset(props);
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

    if (Object.keys(props.state.inpValue).length !== 0) {
      let newState = Object.values(props.state.inpValue).reduce(
        (a, b) => {
          b.val = Number(b.val);
          if (typeof b.val === "number" && !isNaN(b.val)) {
            return Math.max(a.val, b.val);
          }
          return a.val;
        },
        { val: 0, update: false }
      );
      if (newState == 0 && props.state.value == 1) {
        props.value.value = props.release.value;
        props.value.outValue = {val : props.value.value, update : true};
        props.value.update = true;
      }
      if (newState == 1 && props.state.value == 0) {
        props.value.value = props.press.value;
        props.value.outValue = {val : props.value.value, update : true};
        props.value.update = true;
      }
      props.state.value = newState;
      props.state.inpValue = {};
      ret.push("state");
    }

    if (Object.keys(props.press.inpValue).length !== 0) {
      let newPress = Object.values(props.press.inpValue).reduce(
        (a, b) => {
          b.val = Number(b.val);
          if (typeof b.val === "number" && !isNaN(b.val)) {
            return {val: Math.max(a.val,b.val), update: true};
          }
          return a.val;
        },
        { val: 0, update: false }
      );
      if (props.state.value == 1) {
        props.value.value = newPress.val;
        props.value.outValue = {val: newPress.val, update: true};
        props.value.update = true;
      }
    }

    if (Object.keys(props.release.inpValue).length !== 0) {
      let newRelease = Object.values(props.release.inpValue).reduce(
        (a, b) => {
          b.val = Number(b.val);
          if (typeof b.val === "number" && !isNaN(b.val)) {
            return {val: Math.max(a.val,b.val), update: true};
          }
          return a.val;
        },
        { val: 0, update: false }
      );
      if (props.state.value == 0) {
        props.value.value = newRelease.val;
        props.value.outValue = {val: newRelease.val, update: true};
        props.value.update = true;
      }
    }

    return ret;
  }

  static reset(props) {
    props.state.value = props.release.value;
    props.state.outValue = {val: props.state.val, update: true};
  }

  static reconnect(node, nw, pos) {
    node.properties.value.outValue = node.properties.value.value;
  }
}

NodeWork.registerNodeType(Button);
