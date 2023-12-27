import NodeWork from "../../nodework.mjs";
import { Node } from "../../node.mjs";
import MathCounterCore from "./counter_core.mjs"

class MathCounter extends MathCounterCore{
    constructor() {
        super();
        this.properties = {};
        MathCounter.setup(this.properties);
    }

    onExecute(props) {
        return MathCounterCore.run(props);
    }

    onDrawForeground(ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.value.value, this.size[0] * 0.5, this.size[1] * 0.5);
    }

}

NodeWork.registerNodeType(MathCounter);
