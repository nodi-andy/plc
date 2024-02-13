import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class MathIsLess extends Node {
    static type = "math/isless";
    static title = "?=";
    static defaultInput = "value";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "value");
        Node.setProperty(props, "yes");
        Node.setProperty(props, "no");
        MathIsLess.reset(props);
    }

    static run(node) {
        let props = node.properties;
        let ret = [];
        let res = 1;
        let firstVal = undefined; 
        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (firstVal == undefined) firstVal = valueInputs.val;
            else if (valueInputs.val !== firstVal) {
                res = 0;
            }
            
            if (valueInputs.update === true) {
                ret.push("value");
            }
            valueInputs.update = false;
        }
        
        if (ret.includes("value")) {
            props.value.value = res;
            props.value.outValue = props.value.value;
            if (props.value.value == 1) props.yes.outValue = 1;
            if (props.value.value == 0) props.no.outValue = 1;
        }


        return ret;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

    onDrawForeground(ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.in1.value + "==" + this.properties.in2.value, this.size[0] * 0.5, this.size[1] * 0.5);
    }
}

NodeWork.registerNodeType(MathIsLess)