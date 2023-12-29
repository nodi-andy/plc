import NodeWork from "../../nodework.mjs";
import { Node } from "../../node.mjs";
import MathIsLessCore from "./isless_core.mjs"

class MathIsLess extends MathIsLessCore{
    constructor() {
        super();
        this.properties = {};
        MathIsLess.setup(this.properties);
    }

    onExecute(props) {
        return MathIsLess.run(props);
    }

    onDrawForeground(ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.in1.value + "<" + this.properties.in2.value, this.size[0] * 0.5, this.size[1] * 0.5);
    }
}

NodeWork.registerNodeType(MathIsLess);
