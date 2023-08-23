import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class Filter extends LGraphNode{
    static type = "control/filter";
    static title = "Router";
    static desc = "Route input to specific output";
    static title_mode = LiteGraph.NO_TITLE;

    constructor() {
        super();
        this.setProperty("in", "number", 0, " ", {input: true, output: false});
        this.setProperty("pass", "number", 0, " ", {input: false, output: false});
        this.setProperty("out", "number", 0, " ", {input: false, output: true});

        this.selected = 0;
    }

    onExecute(update) {
        if (update && this.properties.in.value == this.properties.pass.value) {
            this.properties.out.value = this.properties.in.value;
        }
    }
    
    onDrawBackground(ctx) {
        ctx.font = "24px Arial";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.pass.value + "?" , this.size[0] * 0.5, this.size[1] * 0.5 + 8);
        ctx.textAlign = "left";
    }
}

LiteGraph.registerNodeType(Filter.type, Filter);