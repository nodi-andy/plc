import NodeCore from "../../node_core.mjs";
import NodeWork from "../../nodework.mjs";

export default class LEDCore extends NodeCore {
    static type = "widget/led";
    static title = " ";
    static desc = "LED";
    
    static setup(prop) {
        NodeCore.setProperty(prop, "state", "number", 0, "state", {input: true, output: false});
        NodeCore.setProperty(prop, "set", "number", 0, "set", {input: false, output: false});
        NodeCore.setProperty(prop, "clear", "number", 0, "clear", {input: false, output: false});
        NodeCore.setProperty(prop, "toggle", "number", 0, "toggle", {input: false, output: false});
        NodeCore.setProperty(prop, "in", "number", 0, "in", {input: false, output: false});
        NodeCore.setProperty(prop, "label", "string", null, "LED", {input: false, output: false});
        NodeCore.setProperty(prop, "port", "number", null, "port", {input: false, output: false});
        NodeCore.setProperty(prop, "color", "string", "FF3333", "color", {input: false, output: false});
        this.type = LEDCore.type;
    }

    static run(prop) {
        for(let input in prop) {
            if (prop.input == false) continue;
            if (input.name == "state") continue;
            if (prop.inpValue != null) {
                prop.value = prop.inpValue;
                prop.inpValue = null;
            }
        }
        if (prop.state.inpValue != null) {
            prop.state.value = prop.state.inpValue;
            prop.state.inpValue = null;
            prop.state.outValue = prop.state.value;
            return true;
        }
        return false;
    }
}

NodeWork.registerType(LEDCore.type, LEDCore)