import Node from "../../node.mjs";
import NodeWork from "../../nodework.mjs";

export default class WidgetNumber extends Node {
    static title = "Number";
    static desc = "Widget to select number value";
    static title_mode = NodeWork.NO_TITLE;
    static pixels_threshold = 10;
    static markers_color = "#666";
    static type = "widget/number";
    static old_y = -1;
    static _remainder = 0;
    static _precision = 0;
    static mouse_captured = false;
    
    constructor() {
        super();
        WidgetNumber.setup(this.properties);
    }

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "value", {label: " "});
        Node.setProperty(props, "read");
        WidgetNumber.reset(props);
    }

    static run(node) {
        let props = node.properties;
        let ret = false;

        if (props.value.inpValue != null) {
            props.value.value = parseInt(props.value.inpValue);
            props.value.inpValue = null;
            props.value.outValue = props.value.value;
            ret = true;
        }
        if (props.read.inpValue != null) {
            props.read.inpValue = null;
            props.read.outValue = props.value.value;
            ret = true;
        }
        return ret;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

    static onDrawForeground(node, ctx) {
        var x = node.size[0] * 0.5;
        var h = node.size[1];


        ctx.textAlign = "center";
        ctx.font = (h * 0.6).toFixed(1) + "px Arial";
        ctx.fillStyle = "#EEE";
        ctx.fillText(node.properties.value.value, x, h * 0.65);
    }
  
    static updateProp(node, name, val) {
        node.properties[name].inpValue = val;
        window.nodes.update(node.nodeID, node.properties);
    }
}

NodeWork.registerNodeType(WidgetNumber);