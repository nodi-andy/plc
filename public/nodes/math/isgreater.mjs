import { NodiEnums } from "../../enums.mjs";
import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class MathIsGreater extends Node {
    static type = "math/isgreater";
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
        let res = 1;
        let firstVal = undefined; 
        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (firstVal == undefined) firstVal = valueInputs.val;
            else if (valueInputs.val !== firstVal) {
                res = 0;
            }
            
            if (valueInputs.update == 1) {
                ret.push("value");
            }
            valueInputs.update = false;
        }
        
        if (ret.includes("value")) {
            props.value.value = res;
            props.value.outValue = props.value.value;
            if (props.value.value == 1) props.yes.outValue = 1;
            if (props.value.value == 0) props.no.outValue = 1;
        }


        return ret;
    }

    static onDrawForeground(node, ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(">?", NodiEnums.CANVAS_GRID_SIZE * 0.5, NodiEnums.CANVAS_GRID_SIZE * 0.5);
    }
}

NodeWork.registerNodeType(MathIsGreater)