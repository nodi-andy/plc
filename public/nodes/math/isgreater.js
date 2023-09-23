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
        this.setProperty("in2", "number", 0, " ", {input: false, output: false});
        this.setProperty("value", "number", 0, " ", {input: false, output: true});
        this.label = ""
        this.type = MathIsGreater.type;
    }

    onExecute(update) {
        if (update) {
            let ret = null;
            if (this.properties.in1.inpValue != null) {
                this.properties.in1.value = parseInt(this.properties.in1.inpValue);
                this.properties.in1.inpValue = null;
            }
            if (this.properties.in2.inpValue != null) {
                this.properties.in2.value = parseInt(this.properties.in2.inpValue);
                this.properties.in2.inpValue = null;
            }
            if (this.properties.in1.value > this.properties.in2.value) {
                ret = 1;
            } else {
                ret = 0;
            }

            if (this.properties.in1.value !== null) {
                this.properties.value.value = ret;
                this.properties.value.outValue = ret;
            }
            update = false;
        }
    }

    onDrawBackground(ctx) {
        ctx.font = "20px Arial";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.in1.value +">" + this.properties.in2.value + "?", this.size[0] * 0.5, (this.size[1] + LiteGraph.NODE_TITLE_HEIGHT) * 0.5);
        ctx.textAlign = "left";
    }
}

LiteGraph.registerNodeType(MathIsGreater.type, MathIsGreater);
