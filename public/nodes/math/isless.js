import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

//Math operation
class MathIsLess extends LGraphNode {
    static title = "Operation";
    static desc = "Easy math operators";
    static title_mode = LiteGraph.NO_TITLE;
    static type = "math/isless";

    constructor() {
        super();
        this.setProperty("in1", "number", 0, " ", {input: true, output: false});
        this.setProperty("in2", "number", 0, " ", {input: true, output: false});
        this.setProperty("out", "number", 0, " ", {input: false, output: true});
        this.label = ""
        this._result = []; //only used for arrays
        this.type = MathIsLess.type;
    }

    onExecute(update) {
        if (update) {
            let ret = null;
            if (this.properties.in1.value < this.properties.in2.value) {
                ret = 1;
            } else {
                ret = 0;
            }
            this.properties.out.value = ret;
            update = false;
        }
    }

    onDrawBackground(ctx) {
        ctx.font = "20px Arial";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.in1.value +"<" + this.properties.in2.value + "?", this.size[0] * 0.5, (this.size[1] + LiteGraph.NODE_TITLE_HEIGHT) * 0.5);
        ctx.textAlign = "left";
    }
}

LiteGraph.registerNodeType(MathIsLess.type, MathIsLess);
