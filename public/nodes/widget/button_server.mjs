import NodeWork from "../../nodework.mjs";
import { NodeCore } from "../../node.mjs";

export default class ButtonCore extends NodeCore {
    static type = "widget/button";
    static title = "Button";
    static desc = "Triggers an event";

    static setup(prop) {
        NodeCore.setProperty(prop, "state", {label: " ", output: true});
        NodeCore.setProperty(prop, "press",  {label: " ", value: 1, input: false, autoInput: true});
        NodeCore.setProperty(prop, "release", {label: " ", input: false, autoInput: true});
        NodeCore.setProperty(prop, "value", {value: null, input: false});
        NodeCore.setProperty(prop, "label", {value: "B1", autoInput: true});
        NodeCore.setProperty(prop, "port", {value: null, input: false});
        NodeCore.setProperty(prop, "color", {value: "gray", input: false, autoInput: true});

        this.type = ButtonCore.type
        ButtonCore.reset(prop);
    }

    static run(props) {
        let ret = false;

        for(let propKey in props) {
            let prop = props[propKey];
            if (prop.autoInput && prop.inpValue != null) {
                prop.value = prop.inpValue;
                prop.inpValue = null;
                ret = true;
            }
        }

        if (props.value?.input == true) {
            if(props.state?.value == 1) {
                props.value.outValue = props.value.inpValue;
                ret = true;
            }
        } else {
            if (props.state?.inpValue == 0 && props.state.value == 1) {
                props.value.outValue = props.release.value;
                ret = true;
            } 
            if (props.state?.inpValue == 1 && props.state.value == 0) {
                props.value.outValue = props.press.value;
                ret = true;
            }
            
        }

        if (props.state && props.state.inpValue != null) {
            props.state.value = props.state.inpValue;
            props.state.outValue = props.state.inpValue;
            props.state.inpValue = null;
            ret = true;
        }
        return ret;
    }

    static reset(prop) {
        prop.state.value = prop.release.value;
        prop.state.outValue = prop.state.value;
    }

}

NodeWork.registerType(ButtonCore)