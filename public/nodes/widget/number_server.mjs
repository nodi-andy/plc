import NodeWork from "../../nodework.mjs";
import { Node } from "../../node.mjs";

export default class NumberCore extends Node {
    static type = "widget/number";
    static title = "Number";
    static desc = "Number";

    static setup(prop) {
        Node.setProperty(prop, "value", {label: " "});
        Node.setProperty(prop, "read");
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

NodeWork.registerNodeType(NumberCore)