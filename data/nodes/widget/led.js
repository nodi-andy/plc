import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class WidgetLed extends LGraphNode{
    static type = "widget/led";
    static title = " ";
    static desc = "Toggles between true or false";
    static title_mode = LiteGraph.NO_TITLE;
    constructor() {
        super();
        this.addInput("inp", "number");
        this.addOutput("outp", "number");
        this.addProperty("text", "T1");
        this.addProperty("port", "");
        this.addProperty("value", 0);
        this.addProperty("color", "FF3333");
        this.size = [64, 64];
    }

    onDrawForeground(ctx) {
        if (this.flags.collapsed) {
            return;
        }

        var size = this.size[1] * 0.5;
        var margin = 0.25;
        var y = this.size[1] * 0.25;
        var w = 0;
        if (this.title.trim().length) {
            ctx.font = this.properties.font || (size * 0.8).toFixed(0) + "px Arial";
            w = ctx.measureText(this.title).width;
        }
        var x = (this.size[0] - (w + size)) * 0.5;


        ctx.fillRect(
            x + size * margin,
            y + size * margin,
            size * (1 - margin * 2),
            size * (1 - margin * 2)
        );
        
        ctx.beginPath();
        ctx.arc(size, size, size * 0.5, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.properties.value ? "#" + this.properties.color : "#000";
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        if (this.title.trim().length) {
            ctx.textAlign = "left";
            ctx.fillStyle = "#AAA";
            ctx.fillText(this.title, size * 1.2 + x, y * 0.85);
            ctx.textAlign = "left";
        }
    }

    onExecute() {
        if (this.inputs[0]._data !== null) {
            this.properties.value = this.inputs[0]._data;
        }
    }
}

LiteGraph.registerNodeType(WidgetLed.type, WidgetLed);