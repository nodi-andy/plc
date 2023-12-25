import NodeWork from "../../nodework.mjs";
import { LGraphNode } from "../../node.mjs";
import MathCounterCore from "./counter_core.mjs"

class MathCounter extends MathCounterCore{
    constructor() {
        super();
        this.properties = {};
        MathCounter.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.setSize([64, 128]);
        this.widgets = [this.widget];
    }

    onExecute(props) {
        return MathCounterCore.run(props);
    }

    onDrawForeground(ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.value.value, this.widget.size[0] * 0.5, this.widget.size[1] * 0.5);
    }

}

NodeWork.registerNodeType(MathCounter.type, MathCounter);
