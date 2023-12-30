import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class AndCore extends Node {
    static type = "logic/and";
    static title = "AND";
    static desc = "And gate";

    static setup(prop) {
        Node.setProperty(prop, "in1", {label:" ", input: true});
        Node.setProperty(prop, "in2", {label:" ", input: true});
        Node.setProperty(prop, "value", {label:" ", output: true});
        this.type = AndCore.type
        AndCore.reset(prop);
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

NodeWork.registerNodeType(AndCore)