import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class MathIsGreater extends Node {
    static type = "math/isgreater";
    static title = "?>";
    static desc = "Is greater";

    static setup(prop) {
        Node.setProperty(prop, "in1", {label:" ", input: true});
        Node.setProperty(prop, "in2", {label:" ", input: true});
        Node.setProperty(prop, "value", {label:" ", output: true});
        Node.setProperty(prop, "yes");
        Node.setProperty(prop, "no");
        this.type = MathIsGreater.type
        MathIsGreater.reset(prop);
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

        prop.value.value = prop.value.outValue = (prop.in1.value > prop.in2.value) ? 1 : 0;
        if (prop.value.value == true) prop.yes.outValue = 1;
        if (prop.value.value == false) prop.no.outValue = 1;
        return true;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

}

NodeWork.registerNodeType(MathIsGreater)