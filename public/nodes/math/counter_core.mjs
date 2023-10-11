import NodeWork from "../../nodework.mjs";
import NodeCore from "../../node_core.mjs";

export default class CounterCore extends NodeCore {
    static type = "math/counter";
    static title = " ";
    static desc = "Counter";

    static setup(prop) {
        NodeCore.setProperty(prop, "inc", "number", 0, "inc", {input: true, output: false});
        NodeCore.setProperty(prop, "dec", "number", 0, "dec", {input: true, output: false});
        NodeCore.setProperty(prop, "value", "number", 0, "v", {input: false, output: true});
        this.type = CounterCore.type;
        prop.value.value = 0;
    }

    static run(prop) {
        if (prop.inc.inpValue !== null && isNaN(prop.inc.inpValue) == false) {
            prop.value.value = parseInt(prop.value.value) + parseInt(prop.inc.inpValue);
            prop.value.outValue = prop.value.value;
            prop.inc.inpValue = null;
            return true;
        }

        if (prop.dec.inpValue !== null && isNaN(prop.dec.inpValue) == false) {
            prop.value.value = parseInt(prop.value.value) - parseInt(prop.dec.inpValue);
            prop.value.outValue = prop.value.value;
            prop.dec.inpValue = null;
            return true;
        }

        return false;
    }
}

NodeWork.registerType(CounterCore)