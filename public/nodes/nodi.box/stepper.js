import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class Stepper extends LGraphNode{
    static title = "Stepper";
    static desc = "Stepper";
    static title_mode = LiteGraph.NO_TITLE;
    static type = "nodi.box/stepper";
    
    constructor() {
        super();
        this.setProperty("pos", "pos", {input: true});
        this.setProperty("speed", "number", 100, "speed");
        this.setProperty("reset", "reset");
        this.setProperty("step port", "number", 27, "Step Port");
        this.setProperty("dir port", "number", 14, "Direction Port");
        this.setProperty("enable port", "number", 32, "Enable Port" );
        this.num = 0;
        this.setSize([64, 64]);
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

//LiteGraph.registerNodeType(Stepper.type, Stepper);
