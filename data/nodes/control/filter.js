import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class Filter extends LGraphNode{
    static type = "control/filter";
    static title = "Filter";
    static desc = "Filters input";
    static title_mode = LiteGraph.NO_TITLE;

    constructor() {
        super();
        this.addInput("inp", "number", "", "");
        this.addOutput("out", "number", "", "");
        this.addProperty("pass", 1, "number", {name: "pass"});

        this.selected = 0;
    }

    onExecute() {
        var inputData = this.getInputData(0);
        if (inputData != null && inputData == this.properties.pass) {
            this.setOutputData(0, inputData);
        }
    }
    
    onDrawBackground(ctx) {
        ctx.font = "24px Arial";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.pass + "?" , this.size[0] * 0.5, this.size[1] * 0.5 + 8);
        ctx.textAlign = "left";
    }
}

LiteGraph.registerNodeType(Filter.type, Filter);