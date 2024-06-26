import Node from "../../node.mjs";
import NodeWork from "../../nodework.mjs";

export default class WidgetNumber extends Node {
    static type = "basic/number";
    static pixels_threshold = 10;
    static old_y = -1;
    static _remainder = 0;
    static _precision = 0;
    static mouse_captured = false;
    static defaultInput = "value";
    static defaultOutput = "value";
    
    constructor() {
        super();
        WidgetNumber.setup(this.properties);
    }

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "inc");
        Node.setProperty(props, "dec");
        Node.setProperty(props, "value", {value : 0, label:" "});
        Node.setProperty(props, "read");
    }

    static run(node) {
        let props = node.properties;
        let ret = [];
        let valueUpdate = false;
        let maxVal = -Infinity
        
        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (valueInputs.update == 1) {
                valueUpdate = true;
                maxVal = Math.max(maxVal, valueInputs.val);
                valueInputs.update = 0;
            }
        }

        if (valueUpdate) {
            props.value.value = maxVal;
            props.value.outValue = {val: props.value.value, update: 1};
            ret.push("value");
        }

        for (const valueInputs of Object.values(props.inc.inpValue)) {
            if (valueInputs.update == 1) {
                props.value.value += valueInputs.val;
                valueInputs.update = 0;
                props.value.outValue = {val: props.value.value, update: 1};
                ret.push("value");
            }
        }


        let readUpdate = Object.values(props.read.inpValue).length > 0;
        if (readUpdate) {
            props.read.outValue = {val: props.value.value, update: 1};
            props.value.outValue = {val: props.value.value, update: 1};
            props.read.inpValue = {}
            ret.push("read");
        }
        for (const valueInputs of Object.values(props.dec.inpValue)) {
            if (valueInputs.update == 1) {
                props.value.value -= valueInputs.val;
                valueInputs.update = 0;
            }
            props.value.outValue = {val: props.value.value, update: 1};
            ret.push("value");
        }

        return ret;
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