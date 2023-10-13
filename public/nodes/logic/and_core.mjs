import NodeWork from "../../nodework.mjs";
import NodeCore from "../../node_core.mjs";

export default class AndCore extends NodeCore {
    static type = "logic/and";
    static title = "AND";
    static desc = "And gate";

    static setup(prop) {
        NodeCore.setProperty(prop, "in1", "number", 0, " ", {input: true, output: false});
        NodeCore.setProperty(prop, "in2", "number", 0, " ", {input: true, output: false});
        NodeCore.setProperty(prop, "value", "number", 0, " ", {input: false, output: true});
        this.type = AndCore.type
        AndCore.reset(prop);
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

        prop.value.outValue = prop.in1.value && prop.in2.value;
        return true;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

}

NodeWork.registerType(AndCore)