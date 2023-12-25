import NodeWork from "../../nodework.mjs";
import { LGraphNode } from "../../node.mjs";
import MathAddCore from "./add_core.mjs"

class MathAdd extends MathAddCore{
    constructor() {
        super();
        this.properties = {};
        MathAddCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.setSize([64, 128]);
        this.widgets = [this.widget];
    }

    onExecute(props) {
        return MathAddCore.run(props);
    }

    onDrawForeground(ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.in1.value + "+" + this.properties.in2.value, this.widget.size[0] * 0.5, this.widget.size[1] * 0.5);
    }

}

NodeWork.registerNodeType(MathAdd.type, MathAdd);
