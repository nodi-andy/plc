import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class LogicAnd extends Node {
    static type = "logic/and";
    static title = "AND";

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "in1");
        Node.setProperty(props, "in2");
        Node.setProperty(props, "value");
        this.type = LogicAnd.type
        LogicAnd.reset(props);
    }

    static run(prop) {
        let inpChanged = false;
        for(let input in prop) {
            if (prop[input].input == false) continue;
            if (prop[input].inpValue != null) {
                inpChanged = true;
                prop[input].value = prop[input].inpValue ? 1 : 0;
                prop[input].inpValue = null;
            }
        }
        if (!inpChanged) return false;

        prop.value.outValue = prop.in1.value && prop.in2.value;
        return true;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

}

NodeWork.registerNodeType(LogicAnd)