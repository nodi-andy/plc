import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class MathAddCore extends Node {
    static type = "math/add";
    static title = "+";
    static defaultInput = "value";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "value");
        MathAddCore.reset(props);
    }

    static run(node) {
        let props = node.properties;
        let ret = [];
        let sum = 0;

        for (const valueInputs of Object.values(props.value.inpValue)) {
            sum += valueInputs.val;
            props.value.value = sum;
            
            if (valueInputs.update === true) {
                props.value.outValue = props.value.value;
                ret.push("value");
            }
        }

        return ret;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

    onDrawForeground(ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.in1.value + "+" + this.properties.in2.value, this.size[0] * 0.5, this.size[1] * 0.5);
    }

}

NodeWork.registerNodeType(MathAddCore)