import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class WidgetNumber extends LGraphNode {
    static title = "Number";
    static desc = "Widget to select number value";
    static title_mode = LiteGraph.NO_TITLE;
    static type = "data/number";
    static pixels_threshold = 10;
    static markers_color = "#666";

    constructor() {
        super();
        this.addInput("set", "number", 0, " ");
        this.addOutput("v", "number");
        this.addProperty("value", 0, "number");
        this.addProperty("const", false, "boolean")
        this.size = [64, 64];
        this.old_y = -1;
        this._remainder = 0;
        this._precision = 0;
        this.mouse_captured = false;
    }
    onDrawForeground(ctx) {
        var x = this.size[0] * 0.5;
        var h = this.size[1];
        if (h > 30) {
            ctx.fillStyle = WidgetNumber.markers_color;
            ctx.beginPath();
            ctx.moveTo(x, h * 0.1);
            ctx.lineTo(x + h * 0.1, h * 0.2);
            ctx.lineTo(x + h * -0.1, h * 0.2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x, h * 0.9);
            ctx.lineTo(x + h * 0.1, h * 0.8);
            ctx.lineTo(x + h * -0.1, h * 0.8);
            ctx.fill();
            ctx.font = (h * 0.7).toFixed(1) + "px Arial";
        } else {
            ctx.font = (h * 0.8).toFixed(1) + "px Arial";
        }

        ctx.textAlign = "center";
        ctx.font = (h * 0.7).toFixed(1) + "px Arial";
        ctx.fillStyle = "#EEE";
        ctx.fillText(
            this.properties.value,
            x,
            h * 0.75
        );
    }
    onExecute(update) {
        if (update || this.updateView) {
            if (this.properties.set != null) {
                if (this.properties.const === false) {
                    this.properties.value = this.properties.set 
                }
                this.setInputDataByName("set", null);
            }

            this.setOutputDataByName("v", this.properties.value);
            this.updateView = false;
        }
    }
    onAfterExecute() {
        for(let input of this.inputs) {
            input._data = null;
        }
    }
    onPropertyChanged(name, value) {
        var t = (1 + "").split(".");
        this._precision = t.length > 1 ? t[1].length : 0;
        this.updateView = true;
    }
    onMouseDown(e, pos) {
        if (pos[1] < 0) {
            return;
        }

        this.old_y = e.canvasY;
        this.captureInput(true);
        this.mouse_captured = true;
        this.setDirtyCanvas(true);
        return true;
    }
    onMouseMove(e) {
        if (!this.mouse_captured) {
            return;
        }

        var delta = this.old_y - e.canvasY;
        if (e.shiftKey) {
            delta *= 10;
        }
        if (e.metaKey || e.altKey) {
            delta *= 0.1;
        }
        this.old_y = e.canvasY;

        var steps = this._remainder + delta / WidgetNumber.pixels_threshold;
        this._remainder = steps % 1;
        steps = steps | 0;

        this.properties.value = Math.clamp(
            this.properties.value + steps * 1,
        );
        this.setProperty("set", this.properties.value);
        this.graph._version++;
        this.setDirtyCanvas(true);
    }
    onMouseUp(e, pos) {
        if (e.click_time < 200) {
            var steps = pos[1] > this.size[1] * 0.5 ? -1 : 1;
            this.properties.value = Math.clamp(
                this.properties.value + steps * 1,
            );
            this.setProperty("set", this.properties.value);
            this.graph._version++;
            this.setDirtyCanvas(true);
        }

        if (this.mouse_captured) {
            this.mouse_captured = false;
            this.captureInput(false);
        }
        this.setDirtyCanvas(true);

    }
}


LiteGraph.registerNodeType(WidgetNumber.type, WidgetNumber);