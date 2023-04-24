import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class WidgetLed extends LGraphNode{
    static type = "widget/led";
    static title = " ";
    static desc = "LED";
    static title_mode = LiteGraph.NO_TITLE;
    constructor() {
        super();
        this.addInput("in", "number");
        this.addOutput("out", "number");
        this.addProperty("label", "LED");
        this.addProperty("port", "");
        this.addProperty("value", 0);
        this.addProperty("color", "FF3333");
        this.size = [64, 64];
    }

    onDrawForeground(ctx) {

        var size = Math.min(this.size[0] * 0.5, this.size[1] * 0.5);
       
        ctx.beginPath();
        ctx.arc(size, size, size * 0.5, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.properties.value ? "#" + this.properties.color : "#222";
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        if (this.properties.label.length) {
            ctx.textAlign = "center";
            ctx.fillStyle = "#AAA";
            ctx.fillText(this.properties.label, this.size[0] * 0.5, 10);
        }
    }

    onExecute() {
        if (this.inputs[0]._data !== null) {
            this.properties.value = parseInt(this.inputs[0]._data);
            this.setOutputData(0, this.properties.value);
        // console.log(this.properties.value);
        }
    }

    hwSetState(v) {
        this.properties.value = v;
    }
}

LiteGraph.registerNodeType(WidgetLed.type, WidgetLed);