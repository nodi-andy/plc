import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class LogicAnd extends Node {
    static type = "logic/and";
    static title = "AND";
    static defaultInput = "value";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "in1");
        Node.setProperty(props, "in2");
        Node.setProperty(props, "value");
        this.type = LogicAnd.type
        LogicAnd.reset(props);
    }

    static run(node) {
        let props = node.properties;
        let ret = [];

        props.value.value = undefined;
        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (props.value.value == undefined) props.value.value = valueInputs.val;
            if (valueInputs.val == 0) {
                props.value.value = 0;
                props.value.outValue = props.value.value;
            }
            
            if (valueInputs.update === true) {
                props.value.outValue = props.value.value;
                ret.push("value");
            }
        }
        return true;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

}

NodeWork.registerNodeType(LogicAnd)