import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class LogicNot extends Node {
    static type = "logic/not";
    static title = "NOT";
    static defaultInput = "value";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "value");
        this.type = LogicNot.type
        LogicNot.reset(props);
    }

    static run(node) {
        let props = node.properties;
        let ret = [];

        props.value.value = undefined;
        let valueInput = Object.values(props.value.inpValue)[0];
        if (valueInput) {
            if (props.value.value == undefined) props.value.value = valueInput.val;
            if (valueInput.val == 1) {
                props.value.value = 0;
            } else {
                props.value.value = 1;
            }
            
            if (valueInput.update === true) {
                props.value.outValue = props.value.value;
                ret.push("value");
            }
            valueInput.update = false;
        }
        return true;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

}

NodeWork.registerNodeType(LogicNot)