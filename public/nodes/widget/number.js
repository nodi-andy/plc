import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class WidgetNumber extends LGraphNode {
    static title = "Number";
    static desc = "Widget to select number value";
    static title_mode = LiteGraph.NO_TITLE;
    static type = "widget/number";
    static pixels_threshold = 10;
    static markers_color = "#666";

    constructor() {
        super();
        this.setProperty("value", "number", 0, " ", {input: false, output: false});
        this.setProperty("read", "number", 0, "read", {input: false, output: false});
        this.setSize([64, 64]);
        this.old_y = -1;
        this._remainder = 0;
        this._precision = 0;
        this.mouse_captured = false;
        this.type = WidgetNumber.type;

    }

    onDrawForeground(ctx) {
        var x = this.size[0] * 0.5;
        var h = this.size[1];
        if (h > 30) {
            ctx.font = (h * 0.3).toFixed(1) + "px Arial";
            ctx.fillStyle = WidgetNumber.markers_color;
            ctx.fillText(
                "+",
                x - h * 0.05,
                h * 0.2
            );
            ctx.fillText(
                "-",
                x - h * 0.05,
                h * 0.9
            );
        } else {
            ctx.font = (h * 0.8).toFixed(1) + "px Arial";
        }

        ctx.textAlign = "center";
        ctx.font = (h * 0.6).toFixed(1) + "px Arial";
        ctx.fillStyle = "#EEE";
        ctx.fillText(
            this.properties.value.value,
            x,
            h * 0.65
        );
    }

    exec(update) {
        if (update || this.updateView) {
            if (this.properties.value.inpValue != null) {
                this.properties.value.value = parseInt(this.properties.value.inpValue);
                this.properties.value.inpValue = null;
                this.properties.value.outValue = this.properties.value.value;
                this.setDirtyCanvas(true);
            }
            if (this.properties.read.inpValue != null) {
                this.properties.read.inpValue = null;
                this.properties.value.outValue = this.properties.value.value;
                this.setDirtyCanvas(true);
            }
            this.valUpdated = false;
            this.updateView = false;
        }
    }

    onExecute(update) {
        this.exec(update)
    }

    onAfterExecute() {
        for(let input of this.getInputs()) {
            input._data = null;
        }
    }

    onPropertyChanged(name, value) {
        var t = (1 + "").split(".");
        this._precision = t.length > 1 ? t[1].length : 0;
        this.updateView = true;
        this.update = true;
    }

    onMouseDown(e, pos) {
        if (this.is_selected !== true) {
            return false
        } else {
            this.old_y = e.canvasY;
            this.captureInput(true);
            this.mouse_captured = true;
            this.setDirtyCanvas(true);
            return true;
        }
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

        this.setValue( Math.clamp(this.properties.value.value + steps * 1));
        this.graph._version++;
        this.setDirtyCanvas(true);
    }

    onMouseUp(e, pos) {
        if (e.click_time < 200) {
            var steps = pos[1] > this.size[1] * 0.5 ? -1 : 1;
            this.setValue( Math.clamp(this.properties.value.value + steps * 1));
            this.graph._version++;
            this.setDirtyCanvas(true);
        }

        if (this.mouse_captured) {
            this.mouse_captured = false;
            this.captureInput(false);
        }
        this.setDirtyCanvas(true);

    }

    updateProp(name, val) {
        this.properties[name].value = val;
        window.nodes.update(this.id, {"properties": this.properties});
    }

    setValue(val) {
        this.update = true;
        this.updateProp("value", val);

        this.properties.value.outValue = this.properties.value.value;
    }
}


LiteGraph.registerNodeType(WidgetNumber.type, WidgetNumber);