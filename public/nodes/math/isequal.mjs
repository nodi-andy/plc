import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class MathIsEqual extends Node {
    static type = "math/isequal";
    static title = "?=";
    static defaultInput = "in";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "in");
        Node.setProperty(props, "value");
        Node.setProperty(props, "true");
        Node.setProperty(props, "false");
        MathIsEqual.reset(props);
    }

    static run(node) {
        let changed = false;
        let props = node.properties;
        for(let input in props) {
            let prop = props[input];
            if (prop.inpValue != null) {
                prop.value = {...prop.value, ...prop.inpValue};
                prop.inpValue = null;
                changed = true;
            }
        }

        if (props.in?.value && Object.values(props.in?.value).length > 0 && changed) {
            props.value.value = Object.values(props.in.value).reduce((a, b) => Number(a) === Number(b) ? a : 0);
            props.value.outValue = props.value.value;
        }
        return true;
    }

    static reset(prop) {
        prop.value.value = 0;
    }

    onDrawForeground(ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.in1.value + "==" + this.properties.in2.value, this.size[0] * 0.5, this.size[1] * 0.5);
    }
}

NodeWork.registerNodeType(MathIsEqual)