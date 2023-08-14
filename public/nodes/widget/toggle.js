import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class WidgetToggle extends LGraphNode{
    static type = "widget/toggle";
    static title = " ";
    static desc = "Toggles between true or false";
    static title_mode = LiteGraph.NO_TITLE;
    constructor() {
        super();
        this.setProperty("state", "number", 1, " ", {input: false, output: false});
        this.setProperty("press", "number", 1, " ", {input: false, output: false});
        this.setProperty("release", "number", 0, " ", {input: false, output: false});
        this.setProperty("out", "number", 0, " ", {input: false, output: true});
        this.setProperty("in", "number", null, "in", {input: false, output: false});
        this.setProperty("label", "string", "B1", "label", {input: false, output: false});
        this.setProperty("port", "number", null, "port", {input: false, output: false});
        this.setProperty("color", "string",  "#A00", "color", {input: false, output: false});
        this.properties.out.value = false;
        this.size = [64, 64];
        this.newState = 0
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

        ctx.fillStyle = "#AAA";
        ctx.fillRect(x, y, size, size);

        ctx.fillStyle = this.properties.state.value ? this.properties.color.value : "#000";
        ctx.fillRect(
            x + size * margin,
            y + size * margin,
            size * (1 - margin * 2),
            size * (1 - margin * 2)
        );


        if (this.properties.label.length) {
            ctx.textAlign = "center";
            ctx.fillStyle = "#AAA";
            ctx.fillText(this.properties.label, this.size[0] * 0.5, 10);
        }
    }

    onExecute() {
        if (this.newState == 0 && this.properties.state.value == 1) {
            this.properties.out.value = this.properties.release.value;
        }
        
        if (this.newState == 1 && this.properties.state.value == 0) {
            this.properties.out.value = this.properties.press.value;
        }

        this.properties.state.value = this.newState;
    }
    
    onMouseDown(e, local_pos) {
        if (local_pos[0] > 10 &&
            local_pos[1] > 10 &&
            local_pos[0] < this.size[0] - 10 &&
            local_pos[1] < this.size[1] - 10) {
            this.graph._version++;
            this.trigger("e", this.properties.value);
            this.newState = !this.properties.state.value
            return true;
        }
    }
}

LiteGraph.registerNodeType(WidgetToggle.type, WidgetToggle);