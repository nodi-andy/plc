import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

class MathCounter extends Node {
    static type = "math/counter";
    static title = " ";
    static desc = "Counter";

    static setup(prop) {
        Node.setProperty(prop, "inc", {input: true});
        Node.setProperty(prop, "dec");
        Node.setProperty(prop, "value", {value : 0, label:" ", output: true});
    }

    static run(props) {
        if (props.inc.inpValue !== null && isNaN(props.inc.inpValue) == false) {
            props.value.value = parseInt(props.value.value) + parseInt(props.inc.inpValue);
            props.value.outValue = props.value.value;
            props.inc.inpValue = null;
            return true;
        }

        if (props.dec.inpValue !== null && isNaN(props.dec.inpValue) == false) {
            props.value.value = parseInt(props.value.value) - parseInt(props.dec.inpValue);
            props.value.outValue = props.value.value;
            props.dec.inpValue = null;
            return true;
        }

        if (props.value.inpValue !== null && isNaN(props.value.inpValue) == false) {
            props.value.value = parseInt(props.value.inpValue) ;
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
