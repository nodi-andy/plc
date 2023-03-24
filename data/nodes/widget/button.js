import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class WidgetButton extends LGraphNode{
    static title = "Button";
    static desc = "Triggers an event";
    static title_mode = LiteGraph.NO_TITLE;
    static font = "Arial";

    constructor() {
        super();
        this.addInput("inp", "number");
        this.addOutput("outp", "number");
        this.addProperty("text", "B1");
        this.addProperty("port", "");
        this.addProperty("down", "1");
        this.addProperty("pressed", "1");
        this.addProperty("up", "0");
        this.addProperty("released", "0");
        this.size = [64, 64];
        this.clicked = false;

    }

    onDrawForeground(ctx) {
        var margin = 10;
        
        if (this.clicked) {
            margin += 2;
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(margin + 2, margin + 2, this.size[0] - margin * 2, this.size[1] - margin * 2);
        }

        ctx.fillStyle = "gray";
        ctx.fillRect(margin, margin, this.size[0] - margin * 2, this.size[1] - margin * 2);

        if (this.properties.text || this.properties.text === 0) {
            var font_size = this.properties.font_size || 30;
            ctx.textAlign = "center";
            ctx.fillStyle = this.clicked ? "black" : "white";
            ctx.font = font_size + "px " + WidgetButton.font;
            ctx.fillText(this.properties.text, this.size[0] * 0.5, this.size[1] * 0.5 + font_size * 0.3);
            ctx.textAlign = "left";
        }
    }

    onMouseDown(e, local_pos) {
        if (local_pos[0] > 10 && local_pos[1] > 10 && local_pos[0] < this.size[0] - 10 && local_pos[1] < this.size[1] - 10) {
            this.clicked = true;
            this.setOutputData("out", 1);
            return true;
        }
        return false;
    }

    onExecute() {
        let click = this.clicked;
        if (this.state == 1) this.clicked = false;
        else if (this.state == 0) this.clicked = true;
        if (click != this.clicked) {
            this.setDirtyCanvas(true, true);
        }
        this.setOutputData(1, this.clicked);
    }

    onMouseUp(e) {
        this.clicked = false;
    }
}

LiteGraph.registerNodeType("widget/button", WidgetButton);