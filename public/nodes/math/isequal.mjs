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
        Node.setProperty(props, "yes");
        Node.setProperty(props, "no");
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
        let values = Object.values(props.in?.value ?? {});
        if (values?.length > 1 && changed) {
            props.value.value = values.every(val => Number(val) === Number(values[0])) ? 1 : 0;
            props.value.outValue = props.value.value;
            if (props.value.value) {
                props.yes.outValue = 1;
            } else {
                props.no.outValue = 1;
            }
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