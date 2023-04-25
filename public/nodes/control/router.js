import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class Router extends LGraphNode{
    static type = "control/router";
    static title = "Router";
    static desc = "Route input to specific output";
    static title_mode = LiteGraph.NO_TITLE;

    constructor() {
        super();
        this.addInput("in", "number", "", "");
        this.addOutput("out", "number", "", "");
        this.addProperty("pass", 1, "number", {name: "pass"});

        this.selected = 0;
    }

    onExecute() {
        if (this.properties.in == this.properties.pass) {
            this.setOutputDataByName("out", this.properties.in);
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

LiteGraph.registerNodeType(Router.type, Router);