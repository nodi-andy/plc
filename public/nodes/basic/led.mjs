import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class WidgetLed extends Node {
    static type = "basic/led";
    static defaultInput = "value";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "value", {label: " "});
        Node.setProperty(props, "set");
        Node.setProperty(props, "clear");
        Node.setProperty(props, "toggle");
        Node.setProperty(props, "in");
        Node.setProperty(props, "label", {label: "LED"});
        Node.setProperty(props, "port");
        Node.setProperty(props, "color", {value: "FF3333"});
    }

    static run(node) {
        let props = node.properties;
        for(let input in props) {
            if (props.input == false) continue;
            if (input.name == "value") continue;
            if (props.inpValue != null) {
                props.value = props.inpValue;
                props.inpValue = null;
            }
        }
        
        if (props.value.inpValue != null) {
            if (props.value.inpValue.constructor === Object) {
                props.value.value = Math.max(...Object.values(props.value.inpValue));
            } else {
                props.value.value = props.value.inpValue;
            }
            props.value.inpValue = null;
            props.value.outValue = props.value.value;
            return true;
        }

        if (props.toggle?.inpValue == 1) {
            if ( props.value.value == 1) {
                props.value.value = 0;
            } else {
                props.value.value = 1;
            }
            props.toggle.inpValue = null;
            return true;
        }
        
        if (props.set?.inpValue == 1) {
            props.value.value = 1;
            props.set.inpValue = null;
            props.value.outValue = props.value.value;
        }

        if (props.clear?.inpValue == 1) {
            props.value.value = 0;
            props.clear.inpValue = null;
            props.value.outValue = props.value.value;
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
        return false;
    }
}

NodeWork.registerNodeType(WidgetLed);