import Node from "../../node.mjs";
import NodeWork from "../../nodework.mjs";

export default class WidgetToggle extends Node {
    static type = "widget/toggle";
    static title = "";
    static desc = "Toggles between true or false";

    constructor() {
        super();
        this.properties = {}
        this.type = WidgetToggle.type;
        WidgetToggle.setup(this.properties);
    }

    static setup(prop) {
        Node.setProperty(prop, "value", {value: null, input: false, output: true});
        Node.setProperty(prop, "press",  {label: " ", value: 1, input: false, autoInput: true});
        Node.setProperty(prop, "release", {label: " ", input: false, autoInput: true});
        Node.setProperty(prop, "state", {label: " "});
        Node.setProperty(prop, "toggle");
        Node.setProperty(prop, "label", {value: "", autoInput: true});
        Node.setProperty(prop, "port", {value: null, input: false});
        Node.setProperty(prop, "color", {value: "red", input: false, autoInput: true});
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


    static onDrawForeground(node, ctx) {
        var size = node.size[1] * 0.5;
        var margin = 0.25;
        var y = node.size[1] * 0.25;
        var x = node.size[0] * 0.25;

        ctx.fillStyle = "#AAA";
        ctx.fillRect(x, y, size, size);

        ctx.fillStyle = node.properties.state.value ? node.properties.color.value : "#000";
        ctx.fillRect(x + size * margin, y + size * margin, size * (1 - margin * 2), size * (1 - margin * 2));

        if (node.properties.label.length) {
            ctx.textAlign = "center";
            ctx.fillStyle = "#AAA";
            ctx.fillText(node.properties.label.value, node.size[0] * 0.5, 10);
        }
    }

    static updateProp(node, name, val) {
        node.properties[name].value = val;
        window.nodes.update(node.nodeID, node.properties);
    }

    static onMouseDown(node, e, local_pos) {
        if (local_pos[0] > node.size[0] * 0.25 && local_pos[1] > node.size[0] * 0.25 && local_pos[0] < node.size[0] * 0.75 && local_pos[1] < node.size[1] * 0.75) {
            let nextState = node.properties.state.value ? 0 : 1;
            window.nodes.update(node.nodeID, {"state": {"inpValue" : nextState}});
            return true;
        }
    }
}

NodeWork.registerNodeType(WidgetToggle); 