import NodeWork from "../../nodework.mjs";
import { Node } from "../../node.mjs";

export default class Button extends Node {
    static type = "widget/button";
    static title = "Button";
    static desc = "Triggers an event";
    static margin = 12;

    constructor() {
        super();
        this.properties = {}
        Button.setup(this.properties);
        this.widget = new Node();
        this.title = " ";
    }

    onDrawForeground(ctx) {
        if (this.properties.state.value == 1) {
            this.margin = 16;
        } else {
            this.margin = 14;
            ctx.fillStyle = "black";
            ctx.fillRect(this.margin + 2, this.margin + 2, this.size[0] - this.margin * 2, this.size[1] - this.margin * 2);
        }

        ctx.fillStyle = this.properties.color.value;
        ctx.fillRect(this.margin, this.margin, this.size[0] - this.margin * 2, this.size[1] - this.margin * 2);

        if (this.properties.label || this.properties.label.value === 0) {
            var font_size = this.properties.font_size || 30;
            ctx.textAlign = "center";
            ctx.fillStyle = this.properties.state.value ? "black" : "white";
            ctx.font = font_size + "px Arial";
            ctx.fillText(this.properties.label.value, this.size[0] * 0.5, this.size[1] * 0.5 + font_size * 0.3);
            ctx.textAlign = "left";
        }
    }

    onMouseDown(e, local_pos) {
        if (local_pos[0] > Button.margin && local_pos[1] > Button.margin && local_pos[0] < this.size[0] - Button.margin && local_pos[1] < this.size[1] - Button.margin) {
            //this.properties.state.value = this.properties.press.value;
            //this.properties.state.outValue = this.properties.state.value;
            window.nodes.update(this.id, {"state": {"inpValue" : 1}});
            return true;
        }

        return false;
    }

    onMouseUp(/*e*/) {
        Button.reset(this.properties);
        window.nodes.update(this.id, {"state": {"inpValue" : 0}});
        return true;
    }

    static setup(prop) {
        Node.setProperty(prop, "state", {label: " ", output: true});
        Node.setProperty(prop, "press",  {label: " ", value: 1, input: false, autoInput: true});
        Node.setProperty(prop, "release", {label: " ", input: false, autoInput: true});
        Node.setProperty(prop, "value", {value: null, input: false});
        Node.setProperty(prop, "label", {value: "B1", autoInput: true});
        Node.setProperty(prop, "port", {value: null, input: false});
        Node.setProperty(prop, "color", {value: "gray", input: false, autoInput: true});

        this.type = Button.type
        Button.reset(prop);
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

NodeWork.registerNodeType(Button)