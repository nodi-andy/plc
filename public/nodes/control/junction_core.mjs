import NodeWork from "../../nodework.mjs";
import { NodeCore } from "../../node.mjs";

export default class JunctionCore extends NodeCore {
    static type = "control/junction";
    static title = " ";
    static desc = "Junction";

    static setup(prop) {
        NodeCore.setProperty(prop, "value", {label: " ", input: true, output: true});
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

NodeWork.registerType(JunctionCore)