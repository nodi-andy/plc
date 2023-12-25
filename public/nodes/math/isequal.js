import NodeWork from "../../nodework.mjs";
import { LGraphNode } from "../../node.mjs";
import MathIsEqualCore from "./isequal_core.mjs"

class MathIsEqual extends MathIsEqualCore{
    constructor() {
        super();
        this.properties = {};
        MathIsEqualCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.setSize([64, 128]);
        this.widgets = [this.widget];
    }

    onDrawForeground(ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.in1.value + "==" + this.properties.in2.value, this.widget.size[0] * 0.5, this.widget.size[1] * 0.5);
    }
}

NodeWork.registerNodeType(MathIsEqual.type, MathIsEqual);
