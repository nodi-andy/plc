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
        LogicXor.reset(props);
    }

    static run(node) {
        let props = node.properties;
        let ret = [];

        props.value.value = undefined;
        let firstVal = undefined;
        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (firstVal == undefined) firstVal = valueInputs.val;
            if (firstVal != null && valueInputs.val != firstVal) {
                props.value.value = 1;
            } else {
                props.value.value = 0;
            }
            
            if (valueInputs.update === true) ret.push("value");
            valueInputs.update = false;
        }

        if (ret.includes("value")) {
            props.value.outValue = props.value.value;
        }
        return true;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

}

NodeWork.registerNodeType(LogicXor)