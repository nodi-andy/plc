import NodeWork from "../../nodework.mjs";
import { Node } from "../../node.mjs";

export default class WidgetLed extends Node{
    static type = "widget/led";
    static title = " ";
    static desc = "LED";
    
    constructor() {
        super();
        this.properties = {}
        WidgetLed.setup(this.properties);
    }

    static setup(prop) {
        Node.setProperty(prop, "state", {label: " ", input: true});
        Node.setProperty(prop, "set");
        Node.setProperty(prop, "clear");
        Node.setProperty(prop, "toggle");
        Node.setProperty(prop, "in");
        Node.setProperty(prop, "label", {label: "LED"});
        Node.setProperty(prop, "port");
        Node.setProperty(prop, "color", {value: "FF3333", input: false});
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
        
        if (prop.state?.inpValue != null) {
            prop.state.value = prop.state.inpValue;
            prop.state.inpValue = null;
            prop.state.outValue = prop.state.value;
            return true;
        }

        if (prop.toggle?.inpValue == 1) {
            if ( prop.state.value == 1) {
                prop.state.value = 0;
            } else {
                prop.state.value = 1;
            }
            prop.toggle.inpValue = null;
            return true;
        }
        
        if (prop.set?.inpValue == 1) {
            prop.state.value = 1;
            prop.set.inpValue = null;
            prop.state.outValue = prop.state.value;
        }

        if (prop.clear?.inpValue == 1) {
            prop.state.value = 0;
            prop.clear.inpValue = null;
            prop.state.outValue = prop.state.value;
        }
        return false;
    }

    onDrawForeground(ctx) {
        var size = Math.min(this.size[0] * 0.5, this.size[1] * 0.5);
        ctx.beginPath();
        ctx.arc(size, size, size * 0.5, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.properties.state.value == true ? "#" + this.properties.color.value : "#222";
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        if (this.properties.label.value) {
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "#AAA";
            ctx.fillText(this.properties.label.value, this.size[0] * 0.5, 10);
        }
    }

    updateProp(key, name, val) {
        this.properties[key][name] = val;
        window.nodes.update(this.id, this.properties);
    }

    onMouseDown(e, local_pos) {
        if (local_pos[0] > this.size[0] * 0.25 &&
            local_pos[1] >  this.size[0] * 0.25 &&
            local_pos[0] < this.size[0] * 0.75 &&
            local_pos[1] < this.size[1] * 0.75) {
            this.updateProp("state", "inpValue", this.properties.state.value ? 0 : 1)
            this.update = true;

            return true;
        }
    }
}

NodeWork.registerNodeType(WidgetLed);