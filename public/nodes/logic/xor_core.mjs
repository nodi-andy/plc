import NodeWork from "../../nodework.mjs";
import NodeCore from "../../node_core.mjs";

export default class XOrCore extends NodeCore {
    static type = "logic/xor";
    static title = "XOR";
    static desc = "XOr gate";

    static setup(prop) {
        NodeCore.setProperty(prop, "in1", {label:" ", input: true});
        NodeCore.setProperty(prop, "in2", {label:" ", input: true});
        NodeCore.setProperty(prop, "value", {labe: " ", output: true});
        this.type = XOrCore.type
        XOrCore.reset(prop);
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

        prop.value.outValue = prop.in1.value ^ prop.in2.value;
        return true;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

}

NodeWork.registerType(XOrCore)