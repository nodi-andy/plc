import NodeWork from "../../nodework.mjs";
import { Node } from "../../node.mjs";

export default class JunctionCore extends Node {
    static type = "control/junction";
    static title = " ";
    static desc = "Junction";

    static setup(prop) {
        Node.setProperty(prop, "value", {label: " ", input: true, output: true});
        JunctionCore.reset(prop);
    }

    static run(prop) {

        prop.value.outValue = prop.value.inpValue;
        prop.value.inpValue = null;
        return true;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

}

NodeWork.registerNodeType(JunctionCore)