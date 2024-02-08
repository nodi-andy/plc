import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class WidgetLed extends Node {
    static type = "basic/led";
    static defaultInput = "value";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "value");
        Node.setProperty(props, "set");
        Node.setProperty(props, "clear");
        Node.setProperty(props, "toggle");
        Node.setProperty(props, "in");
        Node.setProperty(props, "label");
        Node.setProperty(props, "port");
        Node.setProperty(props, "color", {value: "FF3333"});
    }

    static run(node) {
        let props = node.properties;
        let ret = [];

        let valueUpdate = false;
        
        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (valueInputs.update === true) {
                valueUpdate = true;
                break;
            }
        }

        if (valueUpdate) {
            props.value.value = Object.values(props.value.inpValue).reduce((a, b) => {
                b.val = Number(b.val);
                if (b.update == true && typeof b.val === 'number' && !isNaN(b.val)) {
                    b.update = false;
                    return {val: Math.max(a.val,b.val), update: true};
                }
                b.update = false;
                return {val: a.val, update: true};
            }, {val: 0, update: false}).val;
            props.value.outValue = props.value.value;
            ret.push("value");
        }

        if (props.toggle?.inpValue == 1) {
            if ( props.value.value == 1) {
                props.value.value = 0;
            } else {
                props.value.value = 1;
            }
            props.toggle.inpValue = null;
            ret = true;
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
        return ret;
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