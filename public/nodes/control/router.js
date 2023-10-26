import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class Filter extends LGraphNode{
    static type = "control/filter";
    static title = "Router";
    static desc = "Route input to specific output";
    static title_mode = LiteGraph.NO_TITLE;

    constructor() {
        super();
        this.setProperty("in", {input: true});
        this.setProperty("pass");
        this.setProperty("out",  {output: true});

        this.selected = 0;
        this.type = Filter.type;
    }

    onExecute(update) {
        if (update && this.properties.in.inpValue == this.properties.pass.value) {
            this.properties.out.outValue = this.properties.in.inpValue;
            this.properties.in.inpValue = null;
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