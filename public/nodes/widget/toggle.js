import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class WidgetToggle extends LGraphNode{
    static type = "widget/toggle";
    static title = " ";
    static desc = "Toggles between true or false";
    static title_mode = LiteGraph.NO_TITLE;
    constructor() {
        super();
        this.addInput("inp", "number");
        this.addOutput("outp", "number");
        this.addProperty("label", "T1");
        this.addProperty("port", "");
        this.addProperty("pressing", 1);
        this.addProperty("pressed", 1);
        this.addProperty("releasing", 0);
        this.addProperty("released", 0);
        this.addProperty("state", 0);
        this.addProperty("color", "#AEF");
        this.size = [64, 64];
        this.state = this.properties.state;
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

        ctx.fillStyle = this.state ? this.properties.color : "#000";
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
                if (this.inputs[0]._data != null) {
                    this.setOutputData(0, this.inputs[0]._data);
                }
            }
            for(let input of this.inputs) {
                input._data = null;
            }
        }
        this.state = this.newState;
    }
    
    onMouseDown(e, local_pos) {
        if (local_pos[0] > 10 &&
            local_pos[1] > 10 &&
            local_pos[0] < this.size[0] - 10 &&
            local_pos[1] < this.size[1] - 10) {
            this.graph._version++;
            this.trigger("e", this.properties.value);
            this.newState = !this.state
            return true;
        }
    }
}

LiteGraph.registerNodeType(WidgetToggle.type, WidgetToggle);