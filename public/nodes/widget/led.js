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
        this.setProperty("color", "string", null, "FF3333", {input: false, output: false});

        this.size = [64, 64];
    }

    onGetProps() {
        return [["v", "number", 0, " "]];
    }

    onDrawForeground(ctx) {

        var size = Math.min(this.size[0] * 0.5, this.size[1] * 0.5);
       
        ctx.beginPath();
        ctx.arc(size, size, size * 0.5, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.properties.v ? "#" + this.properties.color : "#222";
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
        if (update && this.properties.in != null) {
            this.properties.v = parseInt(this.properties.in);
            this.setInputDataByName("in", null);
            this.setOutputDataByName("v", this.properties.v);
        }
    }

    hwSetState(val) {
        this.properties.v = val;
    }
}

LiteGraph.registerNodeType(WidgetLed.type, WidgetLed);