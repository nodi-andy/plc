import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";
import MathIsGreaterCore from "./isgreater_core.mjs"

class MathIsGreater extends MathIsGreaterCore{
    constructor() {
        super();
        this.properties = {};
        MathIsGreaterCore.setup(this.properties);
    }

    onDrawForeground(ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.in1 + ">" + this.properties.in2, this.size[0] * 0.5, this.size[1] * 0.5);
    }
}

NodeWork.registerNodeType(MathIsGreater);
