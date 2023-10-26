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


        ctx.textAlign = "center";
        ctx.font = (h * 0.6).toFixed(1) + "px Arial";
        ctx.fillStyle = "#EEE";
        ctx.fillText(this.properties.value.value, x, h * 0.65);
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