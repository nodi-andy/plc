import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class WidgetToggle extends LGraphNode{
    static title = " ";
    static desc = "Toggles between true or false";
    static title_mode = LiteGraph.NO_TITLE;
    static type = "widget/toggle";
    constructor() {
        super();
        this.addInput("inp", "number");
        this.addOutput("outp", "number");
        this.properties = { font: "", value: false, port: "", color : "#AEF" };
        this.size = [64, 64];
    }
    onDrawForeground(ctx) {
        if (this.flags.collapsed) {
            return;
        }

        var size = this.size[1] * 0.5;
        var margin = 0.25;
        var h = this.size[1] * 0.8;
        ctx.font = this.properties.font || (size * 0.8).toFixed(0) + "px Arial";
        var w = ctx.measureText(this.title).width;
        var x = (this.size[0] - (w + size)) * 0.5;

        ctx.fillStyle = "#AAA";
        ctx.fillRect(x, h - size, size, size);

        ctx.fillStyle = this.properties.value ? this.properties.color : "#000";
        ctx.fillRect(
            x + size * margin,
            h - size + size * margin,
            size * (1 - margin * 2),
            size * (1 - margin * 2)
        );

        ctx.textAlign = "left";
        ctx.fillStyle = "#AAA";
        ctx.fillText(this.title, size * 1.2 + x, h * 0.85);
        ctx.textAlign = "left";
    }
    onAction(action) {
        this.properties.value = !this.properties.value;
        this.trigger("e", this.properties.value);
    }

    onExecute() {
        let pstate = this.properties.value;
        var v = this.getInputData(0);
        if (v != null) {
            //this.properties.value = v;
        }

        this.properties.value = this.state;

        if (pstate != this.properties.value) {
            this.setDirtyCanvas(true, true);
        }
        this.setOutputData(0, this.properties.value);
    }
    onMouseDown(e, local_pos) {
        if (local_pos[0] > 10 &&
            local_pos[1] > 10 &&
            local_pos[0] < this.size[0] - 10 &&
            local_pos[1] < this.size[1] - 10) {
            this.properties.value = !this.properties.value;
            this.graph._version++;
            this.trigger("e", this.properties.value);
            return true;
        }
    }
}

LiteGraph.registerNodeType("widget/toggle", WidgetToggle);