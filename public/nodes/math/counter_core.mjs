import NodeWork from "../../nodework.mjs";
import NodeCore from "../../node_core.mjs";

export default class CounterCore extends NodeCore {
    static type = "math/counter";
    static title = " ";
    static desc = "Counter";

    static setup(prop) {
        NodeCore.setProperty(prop, "inc", {input: true});
        NodeCore.setProperty(prop, "dec", {input: true});
        NodeCore.setProperty(prop, "value",{label:" ", output: true});
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

        if (prop.value.inpValue !== null && isNaN(prop.value.inpValue) == false) {
            prop.value.value = parseInt(prop.value.inpValue) ;
            prop.value.outValue = prop.value.value;
            prop.value.inpValue = null;
            return true;
        }

        return false;
    }
}

NodeWork.registerType(CounterCore)