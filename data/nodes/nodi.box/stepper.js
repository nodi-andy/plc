import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class Stepper extends LGraphNode{
    static title = "Stepper";
    static desc = "Stepper";
    static title_mode = LiteGraph.NO_TITLE;
    static type = "widget/stepper";
    
    constructor() {
        super();
        this.addInput("speed", "number", "", "speed");
        this.addInput("pos", "number", "", "pos");
        this.addInput("reset", "number", "", "reset");
        this.addOutput("speed", "number", "", "speed");
        this.addOutput("pos", "number", "", "pos");
        this.addProperty("step port", 27, "number", { name: "Step Port" });
        this.addProperty("dir port", 14, "number", { name: "Direction Port" });
        this.addProperty("enable port", 32, "number", { name: "Enable Port" });
        this.addProperty("default speed", 20000, "number", { name: "Default speed" });
        this.num = 0;
        this.size = [128, 196];

    }
    onAction(action, param, options) {
        var v = this.num;
        if (action == "inc") {
            this.num += 1;
        } else if (action == "dec") {
            this.num -= 1;
        } else if (action == "reset") {
            this.num = 0;
        }
        if (this.num != v) {
            this.trigger("change", this.num);
        }
    }
    onDrawBackground(ctx) {
        if (this.flags.collapsed) {
            return;
        }
        ctx.fillStyle = "#AAA";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.num, this.size[0] * 0.5, this.size[1] * 0.5);
    }
    onExecute() {
        if (this.properties.doCountExecution) {
            this.num += 1;
        }
        this.setOutputData(1, this.num);
    }
}
