import { NodiEnums } from "../../enums.mjs";
import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class MathIsEqual extends Node {
    static type = "math/isequal";
    static defaultInput = "value";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "value");
        Node.setProperty(props, "yes");
        Node.setProperty(props, "no");
    }

    static run(node) {
        let props = node.properties;
        let ret = [];
        let update = false;
        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (valueInputs.update) update = true;
        }
        if (!update) return ret;
        
        let res = 1;

        props.value.value = undefined;
        let firstVal = undefined;
        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (firstVal == undefined) firstVal = valueInputs.val;
            valueInputs.update = false;
            if (firstVal != null && valueInputs.val != firstVal) {
                res = 0;
                break;
            } 
        }

        if (props.value.outValue.val == 0 && res == 1) props.yes.outValue = {val: 1, update: 1};
        if (props.value.outValue.val == 1 && res == 0) props.no.outValue = {val: 1, update: 1};
        props.value.outValue = {val: res, update: 1};

        for (const prop of Object.values(node.properties)) {
            if (prop.outValue?.update > 1) prop.outValue.update = 0;
        }
        return ret;
    }

    static onDrawForeground(node, ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("=?", NodiEnums.CANVAS_GRID_SIZE * 0.5, NodiEnums.CANVAS_GRID_SIZE * 0.5);
    }
}

NodeWork.registerNodeType(MathIsEqual)