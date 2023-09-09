import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

//Math operation
class MathIsGreater extends LGraphNode {
    static title = "Operation";
    static desc = "Easy math operators";
    static title_mode = LiteGraph.NO_TITLE;
    static type = "math/isgreater";

    constructor() {
        super();
        this.setProperty("in1", "number", 0, " ", {input: true, output: false});
        this.setProperty("in2", "number", 0, " ", {input: true, output: false});
        this.setProperty("out", "number", 0, " ", {input: false, output: true});
        this.setProperty("value", "number", 0, " ", {input: false, output: false});
        this.label = ""
        this._result = []; //only used for arrays
    }

    onExecute(update) {
        if (update) {
            let ret = null;

            if (this.properties.in1.value > this.properties.in2.value) {
                ret = 1;
            } else {
                ret = 0;
            }

            if (this.properties.in1.value !== null) {
                this.properties.value.value = ret;
                this.properties.out.value = ret;
            }
            update = false;
        }
    }

    onDrawBackground(ctx) {
        if (this.flags.collapsed) {
            return;
        }

        ctx.font = "20px Arial";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.in1.value +">" + this.properties.in2.value + "?", this.size[0] * 0.5, (this.size[1] + LiteGraph.NODE_TITLE_HEIGHT) * 0.5);
        ctx.textAlign = "left";
    }
}

LiteGraph.registerNodeType(MathIsGreater.type, MathIsGreater);
