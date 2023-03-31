import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class WidgetButton extends LGraphNode{
    static title = "Button";
    static desc = "Triggers an event";
    static title_mode = LiteGraph.NO_TITLE;
    static font = "Arial";
    static type = "widget/button";

    constructor() {
        super();
        this.addInput("inp", "number");
        this.addOutput("outp", "number");
        this.addProperty("text", "B1");
        this.addProperty("port", "");
        this.addProperty("pressing", "");
        this.addProperty("pressed", "1");
        this.addProperty("releasing", "");
        this.addProperty("released", "");
        this.addProperty("color", "gray");
        this.size = [64, 64];
        this.clicked = false;

    }

    onDrawForeground(ctx) {
        var margin = 10;
        
        if (this.clicked == 1) {
            margin += 2;
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(margin + 2, margin + 2, this.size[0] - margin * 2, this.size[1] - margin * 2);
        }

        ctx.fillStyle = this.properties.color;
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

            this.clicked = 1;
            this.newState = 1;
            return true;
        }
        return false;
    }

    onExecute() {
        this.output = null;

        if (this.newState == 0 && this.state == 0) {
            this.output = this.properties.released;
        } if (this.newState == 0 && this.state == 1) {
            this.output = this.properties.releasing;
        } if (this.newState == 1 && this.state == 1) {
            this.output = this.properties.pressed;
        } if (this.newState == 1 && this.state == 0) {
            this.output = this.properties.pressing;
        }
        if (this.state != this.newState) {
            this.setDirtyCanvas(true, true);
        }
        this.state = this.newState;
        this.setOutputData(0, this.output);
    }

    onMouseUp(/*e*/) {
        this.clicked = 0;
        this.newState = 0;
    }
}

LiteGraph.registerNodeType(WidgetButton.type, WidgetButton);