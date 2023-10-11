import NodeWork from "../../nodework.mjs";
import NodeCore from "../../node_core.mjs";

export default class NumberCore extends NodeCore {
    static type = "widget/number";
    static title = "Number";
    static desc = "Number";

    static setup(prop) {
        NodeCore.setProperty(prop, "value", "number", 0, " ", {input: false, output: false});
        NodeCore.setProperty(prop, "read", "number", 0, "read", {input: false, output: false});
        this.type = NumberCore.type
        NumberCore.reset(prop);
    }

    static run(prop) {
        let ret = false;

        if (prop.value.inpValue != null) {
            prop.value.value = parseInt(prop.value.inpValue);
            prop.value.inpValue = null;
            prop.value.outValue = prop.value.value;
            ret = true;
        }
        if (prop.read.inpValue != null) {
            prop.read.inpValue = null;
            prop.read.outValue = prop.value.value;
            ret = true;
        }
        return ret;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

}

NodeWork.registerType(NumberCore)