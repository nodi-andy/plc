import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class Button extends Node {
  static type = "basic/button";
  static title = " ";
  static margin = 12;
  static defaultOutput = "value";

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
      window.nodes.update(node.nodeID, { state: { inpValue: 1 } });
      return true;
    }

    return false;
  }

  static onMouseUp(node, e) {
    Button.reset(node.properties);
    window.nodes.update(node.nodeID, { state: { inpValue: 0 } });
    return true;
  }

  static setup(node) {
    let props = node.properties;
    Node.setProperty(props, "state");
    Node.setProperty(props, "press", { value: 1, autoInput: true });
    Node.setProperty(props, "release", { value: 0, autoInput: true });
    Node.setProperty(props, "value", { value: null });
    Node.setProperty(props, "label", { value: "", autoInput: true });
    Node.setProperty(props, "port", { value: null, input: false });
    Node.setProperty(props, "color", { value: "gray", input: false, autoInput: true });
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

    if (Object.keys(props.value?.inpValue).length) {
      if (props.state?.value == 1) {
        for (let prop of Object.values(props)) {
          if (prop.inpValue !== null) {
            for (const valueInputs of Object.values(prop.inpValue)) {
              prop.value = valueInputs.val;
            }
          }
        }
        props.value.outValue = props.value.inpValue;
        ret.push("value");
      }
    } else {
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
          props.value.outValue = props.value.value;
        }
        if (newState == 1 && props.state.value == 0) {
          props.value.value = props.press.value;
          props.value.outValue = props.value.value;
        }
        props.state.value = newState;
        props.state.inpValue = {};
        ret.push("state");
      }
    }

    return ret;
  }

  static reset(props) {
    props.state.value = props.release.value;
    props.state.outValue = props.state.value;
  }

  static reconnect(node, nw, pos) {
    node.properties.value.outValue = node.properties.value.value;
  }
}

NodeWork.registerNodeType(Button);
