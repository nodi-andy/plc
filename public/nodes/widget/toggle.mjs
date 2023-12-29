import { Node } from "../../node.mjs";
import NodeWork from "../../nodework.mjs";

export default class WidgetToggle extends Node {
    static type = "widget/toggle";
    static title = "Toggle";
    static desc = "Toggles between true or false";

    constructor() {
        super();
        this.properties = {}
        this.type = WidgetToggle.type;
        WidgetToggle.setup(this.properties);
    }

    static setup(prop) {
        Node.setProperty(prop, "state", {label: " ", output: true});
        Node.setProperty(prop, "press",  {label: " ", value: 1, input: false, autoInput: true});
        Node.setProperty(prop, "release", {label: " ", input: false, autoInput: true});
        Node.setProperty(prop, "value", {value: null, input: false});
        Node.setProperty(prop, "toggle");
        Node.setProperty(prop, "label", {value: "B1", autoInput: true});
        Node.setProperty(prop, "port", {value: null, input: false});
        Node.setProperty(prop, "color", {value: "red", input: false, autoInput: true});

        this.type = Node.type
        WidgetToggle.reset(prop);
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

        if (props.toggle?.inpValue != null && props.toggle?.inpValue == true ) {
            props.state.value = props.state.value ? 0 : 1;
            props.toggle.inpValue = null;
            ret = true;
        } 

        if (props.value?.input == true) {
            if(props.state?.value == 1) {
                props.value.outValue = props.value.inpValue;
                props.value.inpValue = null;
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


    onDrawForeground(ctx) {
        var size = this.size[1] * 0.5;
        var margin = 0.25;
        var y = this.size[1] * 0.25;
        var w = 0;
        if (this.title?.trim().length) {
            ctx.font = this.properties.font || (size * 0.8).toFixed(0) + "px Arial";
            w = ctx.measureText(this.title).width;
        }
        var x = (this.size[0] - (w + size)) * 0.5;

        ctx.fillStyle = "#AAA";
        ctx.fillRect(x, y, size, size);

        ctx.fillStyle = this.properties.state.value ? this.properties.color.value : "#000";
        ctx.fillRect(x + size * margin, y + size * margin, size * (1 - margin * 2), size * (1 - margin * 2));


        if (this.properties.label.length) {
            ctx.textAlign = "center";
            ctx.fillStyle = "#AAA";
            ctx.fillText(this.properties.label, this.size[0] * 0.5, 10);
        }
    }

    updateProp(name, val) {
        this.properties[name].value = val;
        window.nodes.update(this.id, this.properties);
    }

    onMouseDown(e, local_pos) {
        if (local_pos[0] > this.size[0] * 0.25 && local_pos[1] > this.size[0] * 0.25 && local_pos[0] < this.size[0] * 0.75 && local_pos[1] < this.size[1] * 0.75) {
            let nextState = this.properties.state.value ? 0 : 1;
            window.nodes.update(this.id, {"state": {"inpValue" : nextState}});
            return true;
        }
    }
}

NodeWork.registerNodeType(WidgetToggle); 