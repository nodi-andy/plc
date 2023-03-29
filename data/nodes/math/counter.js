import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class EventCounter extends LGraphNode{
    static type = "math/counter";
    static title = "Counter";
    static desc = "Counts events";
    static title_mode = LiteGraph.NO_TITLE;

    constructor() {
        super();
        this.addInput("inc", "number", "", "inc");
        this.addInput("dec", "number", "", "dec");
        this.addInput("reset", "number", "", "reset");
        this.addOutput("num", "number", "", "num");
        //this.addProperty("doCountExecution", false, "boolean", {name: "Count Executions"});
        //this.addWidget("toggle","Count Exec.",this.properties.doCountExecution,"doCountExecution");
        this.value = 0;
        this.size = [128, 196];
    }
    getTitle() {
        if (this.flags.collapsed) {
            return String(this.value);
        }
        return this.title;
    }
    onAction(action, param, options) {
        var v = this.value;
        if (action == "inc") {
            this.value += 1;
        } else if (action == "dec") {
            this.value -= 1;
        } else if (action == "reset") {
            this.value = 0;
        }
        if (this.value != v) {
            this.trigger("change", this.value);
        }
    }
    onDrawBackground(ctx) {
        if (this.flags.collapsed) {
            return;
        }
        ctx.fillStyle = "#AAA";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.value, this.size[0] * 0.5, this.size[1] * 0.5);
    }
    onExecute() {
        if (this.properties.doCountExecution) {
            this.value += 1;
        }
        this.setOutputData(1, this.value);
    }
}

LiteGraph.registerNodeType(EventCounter.type, EventCounter);