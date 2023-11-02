import NodeWork from "../../nodework.mjs";
import NodeCore from "../../node_core.mjs";

export default class MathIsEqual extends NodeCore {
    static type = "math/isequal";
    static title = "?=";
    static desc = "Add";

    static setup(prop) {
        NodeCore.setProperty(prop, "in1", {label:" ", input: true});
        NodeCore.setProperty(prop, "in2", {label:" ", input: true});
        NodeCore.setProperty(prop, "value", {label:" ", output: true});
        NodeCore.setProperty(prop, "yes");
        NodeCore.setProperty(prop, "no");
        this.type = MathIsEqual.type
        MathIsEqual.reset(prop);
    }

    static run(prop) {
        let inpChanged = false;
        for(let input in prop) {
            if (prop[input].inpValue != null) {
                inpChanged = true;
                prop[input].value = parseInt(prop[input].inpValue);
                prop[input].inpValue = null;
            }
        }
        if (!inpChanged) return false;

        prop.value.value = (prop.in1.value == prop.in2.value);
        prop.value.outValue = prop.value.value;
        if (prop.value.value == true) prop.yes.outValue = 1;
        if (prop.value.value == false) prop.no.outValue = 1;
        return true;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

}

NodeWork.registerType(MathIsEqual)