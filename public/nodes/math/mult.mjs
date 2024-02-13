import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class MathMult extends Node {
    static type = "math/mult";
    static title = "X";
    static defaultInput = "value";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "value");
        MathMult.reset(props);
    }

    static run(node) {
        let props = node.properties;
        let ret = [];

        let sum = 1;
        for (const valueInputs of Object.values(props.value.inpValue)) {
            sum *= valueInputs.val;
            props.value.value = sum;
            if (valueInputs.update === true) ret.push("value");
        }

        if (ret.includes("value")) props.value.outValue = props.value.value;

        return ret;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

}

NodeWork.registerNodeType(MathMult)