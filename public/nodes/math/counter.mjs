import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

class MathCounter extends Node {
    static type = "math/counter";
    static title = " ";
    static defaultInput = "inc";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "inc");
        Node.setProperty(props, "dec");
        Node.setProperty(props, "value", {value : 0, label:" "});
    }

    static run(node) {
        let props = node.properties;
        if (props.inc.inpValue != null) {
            let inputs = Object.values(props.inc.inpValue);
            if (isNaN(props.value.value)) props.value.value = 0;
            props.value.value = parseInt(props.value.value) + parseInt(inputs[0]);
            props.value.outValue = props.value.value;
            props.inc.inpValue = null;
            return true;
        } 

        if (props.dec.inpValue != null) {
            let inputs = Object.values(props.dec.inpValue);
            if (isNaN(props.value.value)) props.value.value = 0;
            props.value.value = parseInt(props.value.value) - parseInt(inputs[0]);
            props.value.outValue = props.value.value;
            props.dec.inpValue = null;
            return true;
        }

        if (props.value.inpValue !== null) {
            if (props.value.inpValue?.constructor === Object) {
                props.value.value = Math.max(...Object.values(props.value.inpValue));
            } else {
                props.value.value = props.value.inpValue;
            }
            props.value.outValue = props.value.value;
            props.value.inpValue = null;
            return true;
        }

        return false;
    }

    static onDrawForeground(node, ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(node.properties.value.value, node.size[0] * 0.5, node.size[1] * 0.5);
    }

}

NodeWork.registerNodeType(MathCounter);
