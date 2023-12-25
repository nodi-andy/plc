import { NodeCore } from "../../node.mjs";
import NodeWork from "../../nodework.mjs";

export default class LEDCore extends NodeCore {
    static type = "widget/led";
    static title = " ";
    static desc = "LED";
    
    static setup(prop) {
        NodeCore.setProperty(prop, "state", {label: " ", input: true});
        NodeCore.setProperty(prop, "set");
        NodeCore.setProperty(prop, "clear");
        NodeCore.setProperty(prop, "toggle");
        NodeCore.setProperty(prop, "in");
        NodeCore.setProperty(prop, "label", {label: "LED"});
        NodeCore.setProperty(prop, "port");
        NodeCore.setProperty(prop, "color", {value: "FF3333", input: false});
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

        if (prop.toggle.inpValue == 1) {
            if ( prop.state.value == 1) {
                prop.state.value = 0;
            } else {
                prop.state.value = 1;
            }
            prop.toggle.inpValue = null;
            return true;
        }
        
        if (prop.set.inpValue == 1) {
            prop.state.value = 1;
            prop.set.inpValue = null;
            prop.state.outValue = prop.state.value;
        }

        if (prop.clear.inpValue == 1) {
            prop.state.value = 0;
            prop.clear.inpValue = null;
            prop.state.outValue = prop.state.value;
        }
        return false;
    }
}

NodeWork.registerType(LEDCore)