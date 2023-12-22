import { LiteGraph } from "../../litegraph.js";
import LGraphNode from "../../node.js";
import MathMultCore from "./mult_core.mjs"

class MathMult extends MathMultCore{
    constructor() {
        super();
        this.properties = {};
        MathMultCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.setSize([64, 128]);
        this.widgets = [this.widget];
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

        ctx.fillText(text, this.widget.size[0] * 0.5, this.widget.size[1] * 0.5);
    }
}

LiteGraph.registerNodeType(MathMult.type, MathMult);
