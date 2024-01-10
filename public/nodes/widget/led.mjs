import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class WidgetLed extends Node {
    static type = "widget/led";
    static title = "";
    static desc = "LED";
    
    constructor() {
        super();
        this.properties = {}
        WidgetLed.setup(this.properties);
    }

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "value", {label: " ", input: true});
        Node.setProperty(props, "set");
        Node.setProperty(props, "clear");
        Node.setProperty(props, "toggle");
        Node.setProperty(props, "in");
        Node.setProperty(props, "label", {label: "LED"});
        Node.setProperty(props, "port");
        Node.setProperty(props, "color", {value: "FF3333", input: false});
    }

    static run(prop) {
        for(let input in prop) {
            if (prop.input == false) continue;
            if (input.name == "value") continue;
            if (prop.inpValue != null) {
                prop.value = prop.inpValue;
                prop.inpValue = null;
            }
        }
        
        if (prop.value?.inpValue != null) {
            prop.value.value = prop.value.inpValue;
            prop.value.inpValue = null;
            prop.value.outValue = prop.value.value;
            return true;
        }

        if (prop.toggle?.inpValue == 1) {
            if ( prop.value.value == 1) {
                prop.value.value = 0;
            } else {
                prop.value.value = 1;
            }
            prop.toggle.inpValue = null;
            return true;
        }
        
        if (prop.set?.inpValue == 1) {
            prop.value.value = 1;
            prop.set.inpValue = null;
            prop.value.outValue = prop.value.value;
        }

        if (prop.clear?.inpValue == 1) {
            prop.value.value = 0;
            prop.clear.inpValue = null;
            prop.value.outValue = prop.value.value;
        }
        return false;
    }

    static onDrawForeground(node, ctx) {
        var size = Math.min(node.size[0] * 0.5, node.size[1] * 0.5);
        ctx.beginPath();
        ctx.arc(size, size, size * 0.5, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.properties.value.value == true ? "#" + node.properties.color.value : "#222";
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        if (node.properties.label.value) {
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "#AAA";
            ctx.fillText(node.properties.label.value, node.size[0] * 0.5, 10);
        }
    }

    static updateProp(node, key, name, val) {
        node.properties[key][name] = val;
        window.nodes.update(node.nodeID, node.properties);
    }

    static onMouseDown(node, e, local_pos) {
        if (local_pos[0] > node.size[0] * 0.25 &&
            local_pos[1] >  node.size[0] * 0.25 &&
            local_pos[0] < node.size[0] * 0.75 &&
            local_pos[1] < node.size[1] * 0.75) {
            WidgetLed.updateProp(node, "state", "inpValue", node.properties.value.value ? 0 : 1)
            node.update = true;

            return true;
        }
    }
}

NodeWork.registerNodeType(WidgetLed);