import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class WidgetLed extends LGraphNode{
    static type = "widget/led";
    static title = " ";
    static desc = "LED";
    static title_mode = LiteGraph.NO_TITLE;
    constructor() {
        super();
        this.setProperty("value", "number", null, " ", {input: true, output: false});
        this.setProperty("label", "string", null, "LED", {input: false, output: false});
        this.setProperty("port", "number", null, "port", {input: false, output: false});
        this.setProperty("color", "string", "FF3333", "color", {input: false, output: false});

        this.size = [64, 64];
    }

    onDrawForeground(ctx) {

        var size = Math.min(this.size[0] * 0.5, this.size[1] * 0.5);
       
        ctx.beginPath();
        ctx.arc(size, size, size * 0.5, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.properties.value.value ? "#" + this.properties.color.value : "#222";
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

    onExecute(update) {
        if (update && this.properties.value.value != null) {
            this.properties.value.value = parseInt(this.properties.value.value);
        }
    }

    hwSetState(val) {
        this.properties.value.value = val;
    }
}

LiteGraph.registerNodeType(WidgetLed.type, WidgetLed);