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
        this.setProperty("state", "number", 0, " ", {input: false, output: true});
        this.setProperty("press", "number", 1, " ", {input: false, output: false});
        this.setProperty("release", "number", 0, " ", {input: false, output: false});
        this.setProperty("out", "number", 0, " ", {input: false, output: false});
        this.setProperty("in", "number", null, "in", {input: false, output: false});
        this.setProperty("label", "string", "B1", "label", {input: false, output: false});
        this.setProperty("port", "number", null, "port", {input: false, output: false});
        this.setProperty("color", "string",  "gray", "color", {input: false, output: false});

        this.size = [64, 64];
        this.newState = false;
        this.margin = 12;
        for(let input of this.inputs) {
            input._data = null;
        }
        this.onMouseUp();
    }

    onDrawForeground(ctx) {
        
        if (this.newState == 1) {
            this.margin = 16;
        } else {
            this.margin = 14;
            ctx.fillStyle = "black";
            ctx.fillRect(this.margin + 2, this.margin + 2, this.size[0] - this.margin * 2, this.size[1] - this.margin * 2);
        }

        ctx.fillStyle = this.properties.color.value;
        ctx.fillRect(this.margin, this.margin, this.size[0] - this.margin * 2, this.size[1] - this.margin * 2);

        if (this.properties.label || this.properties.label.value === 0) {
            var font_size = this.properties.font_size || 30;
            ctx.textAlign = "center";
            ctx.fillStyle = this.newState ? "black" : "white";
            ctx.font = font_size + "px " + WidgetButton.font;
            ctx.fillText(this.properties.label.value, this.size[0] * 0.5, this.size[1] * 0.5 + font_size * 0.3);
            ctx.textAlign = "left";
        }
    }

    onMouseDown(e, local_pos) {
        if (local_pos[0] > this.margin && local_pos[1] > this.margin && local_pos[0] < this.size[0] - this.margin && local_pos[1] < this.size[1] - this.margin) {
            this.newState = 1;
            this.properties["state"].value = this.properties["press"].value;
            return true;
        }
        this.setDirtyCanvas(true);

        return false;
    }

    onExecute() {
        for(let n = 0; n < this.inputs.length; n++) {
            if (this.getInputData(n) != null) {
                this.properties[this.inputs[n]?.name] = this.getInputData(n);
                this.inputs[n]._data = null;
            }
        }
        this.output = null;
        if (this.newState == 0 && this.state == 1) {
            this.output = this.properties.release;
        } 
        if (this.newState == 1 && this.state == 0) {
            this.output = this.properties.press;
        }
        
        this.setDirtyCanvas(true, true);
        if (this.output != null) {
            if (this.inputs[0]?.link == null) {
                this.setOutputData(0, this.output);
            } else {
                this.setOutputData(0, this.properties.A);
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
            this.newState = 0;
            this.properties["state"].value = this.properties["release"].value;

        this.setDirtyCanvas(true);

    }

    hwSetState(v) {
        this.newState = !v;
    }
}

LiteGraph.registerNodeType(WidgetButton.type, WidgetButton);