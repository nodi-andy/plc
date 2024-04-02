import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class LogicXor extends Node {
    static type = "logic/xor";
    static title = "XOR";
    static defaultInput = "value";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "value");
        this.type = LogicXor.type
    }

    static run(node) {
        let props = node.properties;
        let ret = [];
        let res = 1;
        let update = false;

        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (valueInputs.update) update = true;
        }

        if (!update) return ret;

        props.value.value = undefined;
        let firstVal = undefined;
        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (firstVal == undefined) firstVal = valueInputs.val;
            if (firstVal != null && valueInputs.val != firstVal) {
                res = 0;
                break;
            } 
        }

        props.value.outValue = {val: res, update: 1};
        return ret;
    }
}

NodeWork.registerNodeType(LogicXor)