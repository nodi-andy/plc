import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";
import MathAddCore from "./add_core.mjs"

class MathAdd extends MathAddCore{
    constructor() {
        super();
        this.properties = {};
        MathAddCore.setup(this.properties);
    }

    onDrawForeground(ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.in1.value + "+" + this.properties.in2.value, this.size[0] * 0.5, this.size[1] * 0.5);
    }

}

NodeWork.registerNodeType(MathAdd);
