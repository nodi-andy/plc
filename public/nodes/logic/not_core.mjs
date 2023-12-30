import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class NotCore extends Node {
    static type = "logic/not";
    static title = "NOT";
    static desc = "Not gate";

    static setup(prop) {
        Node.setProperty(prop, "in1",  {label:" ", input: true});
        Node.setProperty(prop, "value",  {label:" ", output: true});
        this.type = NotCore.type
        NotCore.reset(prop);
    }

    static run(prop) {
        let inpChanged = false;
        for(let input in prop) {
            if (prop[input].input == false) continue;
            if (prop[input].inpValue != null) {
                inpChanged = true;
                prop[input].value = parseInt(prop[input].inpValue);
                prop[input].inpValue = null;
            }
        }
        if (!inpChanged) return false;

        prop.value.outValue = !prop.in1.value;
        return true;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

}

NodeWork.registerNodeType(NotCore)