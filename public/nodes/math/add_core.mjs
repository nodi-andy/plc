import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class MathAddCore extends Node {
    static type = "math/add";
    static title = "+";
    static desc = "Add";

    static setup(prop) {
        Node.setProperty(prop, "in1", {label:" ", input: true});
        Node.setProperty(prop, "in2", {label:" ", input: true});
        Node.setProperty(prop, "value", {label:" ", output: true});
        this.type = MathAddCore.type
        MathAddCore.reset(prop);
    }

    static run(props) {
        let inpChanged = false;
        for(let input in props) {
            if (props[input].inpValue != null) {
                inpChanged = true;
                props[input].value = parseInt(props[input].inpValue);
                props[input].inpValue = null;
            }
        }
        if (!inpChanged) return false;

        props.value.outValue = props.in1.value + props.in2.value;
        return true;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

}

NodeWork.registerNodeType(MathAddCore)