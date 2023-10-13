import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";
import NumberCore from "./number_server.mjs";

export default class WidgetNumber extends NumberCore {
    static title = "Number";
    static desc = "Widget to select number value";
    static title_mode = LiteGraph.NO_TITLE;
    static pixels_threshold = 10;
    static markers_color = "#666";

    constructor() {

        super();
        this.properties = {}
        NumberCore.setup(this.properties);
        this.type = NumberCore.type;

        this.widget = new LGraphNode();
        this.widgets = [this.widget];
        this.widgets.old_y = -1;
        this.widget._remainder = 0;
        this.widget._precision = 0;
        this.widget.mouse_captured = false;
        this.title = " ";
    }

    onDrawForeground(ctx) {
        var x = this.widget.size[0] * 0.5;
        var h = this.widget.size[1];
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

    onPropertyChanged(/*name, value*/) {
        var t = (1 + "").split(".");
        this.widget._precision = t.length > 1 ? t[1].length : 0;
        this.updateView = true;
        this.update = true;
    }

    onMouseDown(e, local_pos) {
        let margin = [this.widget.size[0] * 0.2, this.widget.size[1] * 0.2];
        if (local_pos[0] > margin[0] && local_pos[1] > margin[1] && local_pos[0] < this.widget.size[0] - margin[0] && local_pos[1] < this.widget.size[1] - margin[1]) {
            return false
        } else {
            this.widget.old_y = e.canvasY;
            this.widget.mouse_captured = true;
            return true;
        }
    }

    onMouseMove(e) {
        if (!this.widget.mouse_captured) {
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

        var steps = this.widget._remainder + delta / WidgetNumber.pixels_threshold;
        this.widget._remainder = steps % 1;
        steps = steps | 0;

        this.setValue( Math.clamp(this.properties.value.value + steps * 1));
    }

    onMouseUp(e, pos) {
        if (e.click_time < 200) {
            var steps = pos[1] > this.widget.size[1] * 0.5 ? -1 : 1;
            this.setValue( Math.clamp(this.properties.value.value + steps * 1));
            this.graph._version++;
        }
        this.widget.mouse_captured = false;
    }

    updateProp(name, val) {
        this.properties[name].inpValue = val;
        window.nodes.update(this.id, this.properties);
    }

    setValue(val) {
        this.update = true;
        this.updateProp("value", val);
    }
}

LiteGraph.registerNodeType(WidgetNumber.type, WidgetNumber);