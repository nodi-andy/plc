import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class LogicOr extends Node {
    static type = "logic/or";
    static title = "OR";
    static defaultInput = "value";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "value");
        this.type = LogicOr.type
    }

    static run(node) {
        let props = node.properties;
        let ret = [];
        let res = 0;
        let update = false;

        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (valueInputs.update) update = true;
        }

        if (!update) return ret;

        props.value.value = undefined;
        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (props.value.value == undefined) props.value.value = valueInputs.val;
            if (valueInputs.val == 1) {
                res = 1;
                break;
            }
        }
        
        ret.push("value");
        props.value.outValue = {val: res, update: 1};
        return ret;
    }

}

NodeWork.registerNodeType(LogicOr)