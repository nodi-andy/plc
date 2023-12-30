import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";
import MathIsEqualCore from "./isequal_core.mjs"

class MathIsEqual extends MathIsEqualCore{
    constructor() {
        super();
        this.properties = {};
        MathIsEqualCore.setup(this.properties);
    }

    onDrawForeground(ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.in1.value + "==" + this.properties.in2.value, this.size[0] * 0.5, this.size[1] * 0.5);
    }
}

NodeWork.registerNodeType(MathIsEqual);
