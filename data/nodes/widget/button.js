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
        this.addProperty("pressing", 1);
        this.addProperty("pressed", null);
        this.addProperty("releasing", 0);
        this.addProperty("released", null);
        this.addProperty("color", "gray");
        this.size = [64, 64];
        this.clicked = false;
        for(let input of this.inputs) {
            input._data = null;
        }
        this.onMouseUp();
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
        this.setDirtyCanvas(true);

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
        
        this.setDirtyCanvas(true, true);
        if (this.output != null) {
            if (this.inputs[0].link == null) {
                this.setOutputData(0, this.output);
            } else {
                if (this.inputs[0]._data == null) {
                    this.setOutputData(0, null);
                } else {
                    if (this.output) {
                        this.setOutputData(0, this.inputs[0]._data);
                    }
                }
            }
            for(let input of this.inputs) {
                input._data = null;
            }
        }
        this.state = this.newState;
    }

    onAfterExecute() {
        // do not remove input
    }

    onMouseUp(/*e*/) {
        this.clicked = 0;
        this.newState = 0;
        this.setDirtyCanvas(true);

    }
}

LiteGraph.registerNodeType(WidgetButton.type, WidgetButton);