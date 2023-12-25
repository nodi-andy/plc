import NodeWork from "../../nodework.mjs";
import { LGraphNode } from "../../node.mjs";
import MathIsGreaterCore from "./isgreater_core.mjs"

class MathIsGreater extends MathIsGreaterCore{
    constructor() {
        super();
        this.properties = {};
        MathIsGreaterCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.setSize([64, 128]);
        this.widgets = [this.widget];
    }

    onExecute(props) {
        return MathIsGreater.run(props);
    }

    onDrawForeground(ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.in1 + ">" + this.properties.in2, this.widget.size[0] * 0.5, this.widget.size[1] * 0.5);
    }
}

NodeWork.registerNodeType(MathIsGreater.type, MathIsGreater);
