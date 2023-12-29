import { Node } from "../../node.mjs";
import NodeWork from "../../nodework.mjs";

export default class WidgetNumber extends Node {
    static title = "Number";
    static desc = "Widget to select number value";
    static title_mode = NodeWork.NO_TITLE;
    static pixels_threshold = 10;
    static markers_color = "#666";
    static type = "widget/number";

    constructor() {
        super();
        this.properties = {}
        WidgetNumber.setup(this.properties);
        this.type = Node.type;

        this.old_y = -1;
        this._remainder = 0;
        this._precision = 0;
        this.mouse_captured = false;
        this.title = " ";
    }

    static setup(prop) {
        Node.setProperty(prop, "value", {label: " "});
        Node.setProperty(prop, "read");
        this.type = Node.type
        Node.reset(prop);
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

    onDrawForeground(ctx) {
        var x = this.size[0] * 0.5;
        var h = this.size[1];


        ctx.textAlign = "center";
        ctx.font = (h * 0.6).toFixed(1) + "px Arial";
        ctx.fillStyle = "#EEE";
        ctx.fillText(this.properties.value.value, x, h * 0.65);
    }
  
    updateProp(name, val) {
        this.properties[name].inpValue = val;
        window.nodes.update(this.id, this.properties);
    }

    setValue(val) {
        this.update = true;
        this.updateProp("value", val);
    }
}

NodeWork.registerNodeType(WidgetNumber);