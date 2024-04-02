import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class MathAdd extends Node {
    static type = "math/add";
    static title = "ADD/SUB";
    static defaultInput = "add";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "add");
        Node.setProperty(props, "sub");
        Node.setProperty(props, "value");
    }

    static run(node) {
        let props = node.properties;
        let ret = [];

        let sum = 0;
        for (const valueInputs of Object.values(props.add.inpValue)) {
            sum += valueInputs.val;
            props.value.value = sum;
            if (valueInputs.update == 1) ret.push("value");
        }

        for (const valueInputs of Object.values(props.sub.inpValue)) {
            sum -= valueInputs.val;
            props.value.value = sum;
            if (valueInputs.update == 1) ret.push("value");
        }

        if (ret.includes("value")) props.value.outValue = props.value.value;

        return ret;
    }
}

NodeWork.registerNodeType(MathAdd)