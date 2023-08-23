import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class Stepper extends LGraphNode{
    static title = "Stepper";
    static desc = "Stepper";
    static title_mode = LiteGraph.NO_TITLE;
    static type = "nodi.box/stepper";
    
    constructor() {
        super();
        this.setProperty("pos", "number", 0, "pos", {input: true, output: false});
        this.setProperty("speed", "number", 100, "speed", {input: false, output: false});
        this.setProperty("reset", "number", 0, "reset", {input: false, output: false});
        this.setProperty("step port", "number", 27, "Step Port", {input: false, output: false});
        this.setProperty("dir port", 14, "number", "Direction Port", {input: false, output: false});
        this.setProperty("enable port", 32, "number", "Enable Port" , {input: false, output: false});
        this.num = 0;
        this.size = [64, 64];
    }

    onDrawForeground(ctx) {
        var x = this.size[0] * 0.5;
        var h = Math.min(this.size[0], this.size[1]);
        ctx.textBaseline = 'middle';
        ctx.textAlign = "center";
        ctx.font = (h * 0.15).toFixed(2) + "px Arial";
        ctx.fillStyle = "#AAA";
        ctx.fillText(
            "stepper",
            x,
            h * 0.2
        );
        
        
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
