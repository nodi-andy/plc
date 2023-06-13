import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class Stepper extends LGraphNode{
    static title = "Stepper";
    static desc = "Stepper";
    static title_mode = LiteGraph.NO_TITLE;
    static type = "nodi.box/stepper";
    
    constructor() {
        super();
        this.addInput("pos", "number", 0, "pos");

        this.addProperty("step port", 27, "number", { name: "Step Port" });
        this.addProperty("dir port", 14, "number", { name: "Direction Port" });
        this.addProperty("enable port", 32, "number", { name: "Enable Port" });
        this.num = 0;
        this.size = [64, 64];

    }

    onGetInputs() {
        return [["pos", "number", 0, "pos"], ["speed", "number", 100, "speed"], ["reset", "number", 0, "reset"]];
    }

    onGetOutputs() {
        return [["pos", "number", null, "pos"], ["speed", "number", null, "speed"]];
    }

    onDrawForeground(ctx) {
        if (this.flags.collapsed) {
            return;
        }
        ctx.fillStyle = "#AAA";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        
        /*if (this.properties["pos"]) {
            ctx.fillText("pos:" + this.properties["pos"], this.size[0] * 0.5, this.size[1] * 0.5);
        } else if (this.properties["speed"]) {
            ctx.fillText("v:" + this.properties["speed"], this.size[0] * 0.5, this.size[1] * 0.5);
        } */
    }
    onExecute() {
        this.setOutputData(1, this.num);
    }
}

LiteGraph.registerNodeType(Stepper.type, Stepper);
