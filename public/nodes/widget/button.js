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
        this.addProperty("press", 1);
        this.addProperty("release", 0);

        this.addOutput("v", "number", null, " ");

        this.addProperty("label", "");
        this.addProperty("port", "");
        this.addProperty("color", "gray");
        this.size = [64, 64];
        this.newState = false;
        for(let input of this.inputs) {
            input._data = null;
        }
        this.onMouseUp();
    }
    
    onGetInputs() {
        return [["in", "number", 0 , " "]];
    }

    onDrawForeground(ctx) {
        var margin = 10;
        
        if (this.newState == 1) {
            margin += 2;
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(margin + 2, margin + 2, this.size[0] - margin * 2, this.size[1] - margin * 2);
        }

        ctx.fillStyle = this.properties.color;
        ctx.fillRect(margin, margin, this.size[0] - margin * 2, this.size[1] - margin * 2);

        if (this.properties.label || this.properties.label === 0) {
            var font_size = this.properties.font_size || 30;
            ctx.textAlign = "center";
            ctx.fillStyle = this.newState ? "black" : "white";
            ctx.font = font_size + "px " + WidgetButton.font;
            ctx.fillText(this.properties.label, this.size[0] * 0.5, this.size[1] * 0.5 + font_size * 0.3);
            ctx.textAlign = "left";
        }
    }

    onMouseDown(e, local_pos) {
        if (local_pos[0] > 10 && local_pos[1] > 10 && local_pos[0] < this.size[0] - 10 && local_pos[1] < this.size[1] - 10) {

            this.newState = 1;
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
        this.setDirtyCanvas(true);

    }

    hwSetState(v) {
        this.newState = !v;
    }
}

LiteGraph.registerNodeType(WidgetButton.type, WidgetButton);