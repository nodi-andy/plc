import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class Button extends Node {
    static type = "widget/button";
    static title = " ";
    static desc = "Triggers an event";
    static margin = 12;

    static onDrawForeground(node, ctx) {
        let props = node.properties;
        if (props.state.value == 1) {
            Button.margin = 16;
        } else {
            Button.margin = 14;
            ctx.fillStyle = "black";
            ctx.fillRect(Button.margin + 2, Button.margin + 2, node.size[0] - Button.margin * 2, node.size[1] - Button.margin * 2);
        }

        ctx.fillStyle = props.color.value;
        ctx.fillRect(Button.margin, Button.margin, node.size[0] - Button.margin * 2, node.size[1] - Button.margin * 2);

        if (props.label || props.label.value === 0) {
            var font_size = props.font_size || 30;
            ctx.textAlign = "center";
            ctx.fillStyle = props.state.value ? "black" : "white";
            ctx.font = font_size + "px Arial";
            ctx.fillText(props.label.value, node.size[0] * 0.5, node.size[1] * 0.5 + font_size * 0.3);
            ctx.textAlign = "left";
        }
    }

    static onMouseDown(node, e, local_pos) {
        if (local_pos[0] > Button.margin && local_pos[1] > Button.margin && local_pos[0] < node.size[0] - Button.margin && local_pos[1] < node.size[1] - Button.margin) {
            //this.properties.state.value = this.properties.press.value;
            //this.properties.state.outValue = this.properties.state.value;
            window.nodes.update(node.nodeID, {"state": {"inpValue" : 1}});
            return true;
        }

        return false;
    }

    static onMouseUp(node, e) {
        Button.reset(node.properties);
        window.nodes.update(node.nodeID, {"state": {"inpValue" : 0}});
        return true;
    }

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "state", {label: " "});
        Node.setProperty(props, "press",  {label: " ", value: 1, autoInput: true});
        Node.setProperty(props, "release", {label: " ", value: 0, autoInput: true});
        Node.setProperty(props, "value", {value: null});
        Node.setProperty(props, "label", {value: " ", autoInput: true});
        Node.setProperty(props, "port", {value: null, input: false});
        Node.setProperty(props, "color", {value: "gray", input: false, autoInput: true});
        Button.reset(props);
    }

    static run(node) {
        let props = node.properties;
        let ret = false;

        for(let propKey in props) {
            let prop = props[propKey];
            if (prop.autoInput && prop.inpValue != null) {
                prop.value = prop.inpValue;
                prop.inpValue = null;
                ret = true;
            }
        }

        if (props.value?.inpValue != null) {
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

    static reset(props) {
        props.state.value = props.release.value;
        props.state.outValue = props.state.value;
    }

}

NodeWork.registerNodeType(Button)