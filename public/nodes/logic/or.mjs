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
        LogicOr.reset(props);
    }

    static run(node) {
        let props = node.properties;
        let ret = [];

        props.value.value = undefined;
        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (props.value.value == undefined) props.value.value = valueInputs.val;
            if (valueInputs.val == 1) {
                props.value.value = 1;
                props.value.outValue = props.value.value;
            }
            
            if (valueInputs.update === true) {
                props.value.outValue = props.value.value;
                ret.push("value");
            }
            valueInputs.update = false;
        }
        return true;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

}

NodeWork.registerNodeType(LogicOr)