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
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "#AAA";
            ctx.fillText(this.properties.label.value, this.widget.size[0] * 0.5, 10);
        }
    }

    updateProp(key, name, val) {
        this.properties[key][name] = val;
        window.nodes.update(this.id, this.properties);
    }

    onMouseDown(e, local_pos) {
        if (local_pos[0] > this.widget.size[0] * 0.25 &&
            local_pos[1] >  this.widget.size[0] * 0.25 &&
            local_pos[0] < this.widget.size[0] * 0.75 &&
            local_pos[1] < this.widget.size[1] * 0.75) {
            this.updateProp("state", "inpValue", this.properties.state.value ? 0 : 1)
            this.update = true;

            return true;
        }
    }
}

LiteGraph.registerNodeType(WidgetLed.type, WidgetLed);