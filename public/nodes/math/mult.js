import NodeWork from "../../nodework.mjs";
import { Node } from "../../node.mjs";
import MathMultCore from "./mult_core.mjs"

class MathMult extends MathMultCore{
    constructor() {
        super();
        this.properties = {};
        MathMultCore.setup(this.properties);
    }

    onExecute(props) {
        return MathMult.run(props);
    }

    onDrawForeground(ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        let text;
        if (this.properties.in1.value) text = this.properties.in1.value;
        text += "+";
        if (this.properties.in2.value) text = this.properties.in2.value;

        ctx.fillText(text, this.size[0] * 0.5, this.size[1] * 0.5);
    }
}

NodeWork.registerNodeType(MathMult);
