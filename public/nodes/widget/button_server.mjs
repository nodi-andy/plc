import NodeWork from "../../nodework.mjs";
import NodeCore from "../../node_core.mjs";

export default class ButtonCore extends NodeCore {
    static type = "widget/button";
    static title = "Button";
    static desc = "Triggers an event";

    static setup(prop) {
        NodeCore.setProperty(prop, "state", "number", 0, " ", {input: false, output: true});
        NodeCore.setProperty(prop, "press", "number", 1, " ", {input: false, output: false});
        NodeCore.setProperty(prop, "release", "number", 0, " ", {input: false, output: false});
        NodeCore.setProperty(prop, "in", "number", null, "in", {input: false, output: false});
        NodeCore.setProperty(prop, "label", "string", "B1", "label", {input: false, output: false});
        NodeCore.setProperty(prop, "port", "number", null, "port", {input: false, output: false});
        NodeCore.setProperty(prop, "color", "string",  "gray", "color", {input: false, output: false});

        this.type = ButtonCore.type
        ButtonCore.reset(prop);
    }

    static run(prop) {
        let ret = false;
        for(let input in prop) {
            if (prop[input].input == false) continue;
            if (input.name == "state") continue;
            if (prop[input].inpValue != null) {
                prop[input].value = prop[input].inpValue;
                prop[input].inpValue = null;
            }
        }
        if (prop.state?.inpValue == 0 && prop.state?.value == 1) {
            prop.state.outValue = prop.release.value;
            ret = true;
        } 
        if (prop.state?.inpValue == 1 && prop.state?.value == 0) {
            prop.state.outValue = prop.press.value;
            ret = true;
        }
        
        if (prop.state) prop.state.value = prop.state.inpValue;
        return ret;
    }

    static reset(prop) {
        prop.state.value = prop.release.value;
        prop.state.outValue = prop.state.value;
    }

}

NodeWork.registerType(ButtonCore.type, ButtonCore)