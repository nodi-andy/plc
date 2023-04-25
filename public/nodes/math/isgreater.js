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
        this.addInput("a", "number", 0, "a");
        this.addInput("b", "number", 0, "b");
        this.addOutput("v", "number", 0, "v");
        this.label = ""
        this._result = []; //only used for arrays
    }

    onExecute(update) {
        if (update) {
            let ret = null;
            if (this.properties.a > this.properties.b) {
                ret = 1;
            } else {
                ret = 0;
            }
            this.setOutputDataByName("v", ret);
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
        ctx.fillText(this.properties.a +">" + this.properties.b + "?", this.size[0] * 0.5, (this.size[1] + LiteGraph.NODE_TITLE_HEIGHT) * 0.5);
        ctx.textAlign = "left";
    }
}

LiteGraph.registerNodeType(MathIsGreater.type, MathIsGreater);
