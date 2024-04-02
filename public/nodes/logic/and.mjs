import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class LogicAnd extends Node {
    static type = "logic/and";
    static title = "AND";
    static defaultInput = "value";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "value");
        this.type = LogicAnd.type
    }

    static run(node) {
        let props = node.properties;
        let ret = [];
        
        let update = false;
        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (valueInputs.update) update = 1;
        }
        if (!update) return ret;
        
        let res = 1;
        props.value.value = undefined;
        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (props.value.value == undefined) props.value.value = valueInputs.val;
            if (valueInputs.val == 0) res = 0;
            
        }
        ret.push("value");
        props.value.outValue = {val: res, update: 1};
        return ret;
    }

}

NodeWork.registerNodeType(LogicAnd)