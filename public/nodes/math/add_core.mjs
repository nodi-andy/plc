import NodeWork from "../../nodework.mjs";
import NodeCore from "../../node_core.mjs";

export default class MathAddCore extends NodeCore {
    static type = "math/add";
    static title = "Add";
    static desc = "Add";

    static setup(prop) {
        NodeCore.setProperty(prop, "in1", "number", 0, " ", {input: true, output: false});
        NodeCore.setProperty(prop, "in2", "number", 0, " ", {input: true, output: false});
        NodeCore.setProperty(prop, "value", "number", 0, " ", {input: false, output: true});
        this.type = MathAddCore.type
        MathAddCore.reset(prop);
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

        prop.value.outValue = prop.in1.value + prop.in2.value;
        return true;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

}

NodeWork.registerType(MathAddCore)