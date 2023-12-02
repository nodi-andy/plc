import NodeWork from "../../nodework.mjs";
import NodeCore from "../../node_core.mjs";

export default class ToggleCore extends NodeCore {
    static type = "widget/toggle";
    static title = "Button";
    static desc = "Triggers an event";

    static setup(prop) {
        NodeCore.setProperty(prop, "state", {label: " ", output: true});
        NodeCore.setProperty(prop, "press", {value : 1});
        NodeCore.setProperty(prop, "release");
        NodeCore.setProperty(prop, "in", );
        NodeCore.setProperty(prop, "label", {value: "T1"});
        NodeCore.setProperty(prop, "port");
        NodeCore.setProperty(prop, "color", {value: "red"});

        this.type = ToggleCore.type
        ToggleCore.reset(prop);
    }

    static run(prop) {
        let ret = false;

        if (prop.state && prop.state.inpValue == 1) {
            if (prop.state.value) {
                prop.state.value = 0;
                if (prop.in.input == false) {
                    prop.state.outValue = prop.release.value;
                }
            } else {
                prop.state.value = 1;
                if (prop.in.input == false) {
                    prop.state.outValue = prop.press.value;
                }
            }
            prop.state.inpValue = null;
            ret = true;
        }
        if (prop.in.input && prop.state.value == true && prop.in.inpValue != null) {
            prop.state.outValue = prop.in.inpValue;
            prop.in.inpValue = null;
        }
        return ret;
    }

    static reset(prop) {
        prop.state.value = prop.release.value;
        prop.state.outValue = prop.state.value;
    }

}

NodeWork.registerType(ToggleCore)