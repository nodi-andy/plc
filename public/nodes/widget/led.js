import { LiteGraph } from "../../litegraph.js";
import LEDCore from "./led_server.mjs";
import LGraphNode from "../../node.js";

export default class WidgetLed extends LEDCore {
    static type = "widget/led";
    static title = " ";
    static desc = "LED";
    
    constructor() {
        super();
        this.properties = {}
        LEDCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widgets = [this.widget];
    }

    onDrawForeground(ctx) {

        var size = Math.min(this.widget.size[0] * 0.5, this.widget.size[1] * 0.5);
       
        ctx.beginPath();
        ctx.arc(size, size, size * 0.5, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.properties.state.value ? "#" + this.properties.color.value : "#222";
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        if (this.properties.label.value) {
            ctx.textAlign = "center";
            ctx.fillStyle = "#AAA";
            ctx.fillText(this.properties.label.value, this.widget.size[0] * 0.5, 10);
        }
    }

    updateProp(name, val) {
        this.properties[name].value = val;
        window.nodes.update(this.id, {"properties": this.properties});
    }

    onExecute(update) {
        if (this.properties.set.inpValue == 1) {
            this.updateProp("state", 1);
            this.properties.set.inpValue = null;
            this.properties.state.outValue = this.properties.state.value;
        }

        if (this.properties.clear.inpValue == 1) {
            this.updateProp("state", 0);
            this.properties.clear.inpValue = null;
            this.properties.state.outValue = this.properties.state.value;
        }

        if (this.properties.toggle.inpValue == 1) {
            if ( this.properties.state.value == 1) {
                this.updateProp("state", 0);
                this.properties.state.outValue = this.properties.state.value;
            } else {
                this.updateProp("state", 1);
                this.properties.state.outValue = this.properties.state.value;
            }
            this.properties.toggle.inpValue = null;
        }

        if (update && this.properties.state.inpValue != null) {
            this.updateProp("state", parseInt(this.properties.state.inpValue));
            this.properties.state.inpValue = null;
            this.properties.state.outValue = this.properties.state.value;
        }
    }

    onMouseDown(e, local_pos) {
        if (local_pos[0] > this.widget.size[0] * 0.25 &&
            local_pos[1] >  this.widget.size[0] * 0.25 &&
            local_pos[0] < this.widget.size[0] * 0.75 &&
            local_pos[1] < this.widget.size[1] * 0.75) {
            this.properties.state.inpValue = this.properties.state.value ? 0 : 1;
            this.update = true;

            return true;
        }
    }
}

LiteGraph.registerNodeType(WidgetLed.type, WidgetLed);