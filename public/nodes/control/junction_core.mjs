import NodeWork from "../../nodework.mjs";
import NodeCore from "../../node_core.mjs";

export default class JunctionCore extends NodeCore {
    static type = "control/junction";
    static title = " ";
    static desc = "Junction";

    static setup(prop) {
        NodeCore.setProperty(prop, "value", "number", 0, " ", {input: true, output: false});
        this.type = JunctionCore.type
        JunctionCore.reset(prop);
    }

    static run(prop) {

        prop.value.outValue = prop.value.inpValue;
        return true;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

}

NodeWork.registerType(JunctionCore)