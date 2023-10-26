import NodeWork from "../../nodework.mjs";
import NodeCore from "../../node_core.mjs";

export default class ButtonCore extends NodeCore {
    static type = "widget/button";
    static title = "Button";
    static desc = "Triggers an event";

    static setup(prop) {
        NodeCore.setProperty(prop, "state", {label: " ", output: true});
        NodeCore.setProperty(prop, "press",  {label: " ", value: 1, input: false});
        NodeCore.setProperty(prop, "release", {label: " ", input: false});
        NodeCore.setProperty(prop, "in", {value: null, input: false});
        NodeCore.setProperty(prop, "label", {value: "B1"});
        NodeCore.setProperty(prop, "port", {value: null, input: false});
        NodeCore.setProperty(prop, "color", {value: "gray", input: false});

        this.type = ButtonCore.type
        ButtonCore.reset(prop);
    }

    static run(prop) {
        let ret = false;

        if (prop.state && prop.state.inpValue == 0 && prop.state.value == 1) {
            prop.state.outValue = prop.release.value;
            ret = true;
        } 
        if (prop.state && prop.state.inpValue == 1 && prop.state.value == 0) {
            prop.state.outValue = prop.press.value;
            ret = true;
        }
        
        if (prop.state && prop.state.inpValue != null) {
             prop.state.value = prop.state.inpValue;
             prop.state.inpValue = null;
        }
        return ret;
    }

    static reset(prop) {
        prop.state.value = prop.release.value;
        prop.state.outValue = prop.state.value;
    }

}

NodeWork.registerType(ButtonCore)