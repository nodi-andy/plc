import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class WidgetLed extends LGraphNode {
    static type = "widget/led";
    static title = " ";
    static desc = "LED";
    
    constructor() {
        super();
        this.setProperty("state", "number", 0, "state", {input: true, output: false});
        this.setProperty("set", "number", 0, "set", {input: false, output: false});
        this.setProperty("clear", "number", 0, "clear", {input: false, output: false});
        this.setProperty("toggle", "number", 0, "toggle", {input: false, output: false});
        this.setProperty("in", "number", 0, "in", {input: false, output: false});
        this.setProperty("label", "string", null, "LED", {input: false, output: false});
        this.setProperty("port", "number", null, "port", {input: false, output: false});
        this.setProperty("color", "string", "FF3333", "color", {input: false, output: false});
        this.setSize([64, 64]);
        this.type = WidgetLed.type;

    }

    onDrawForeground(ctx) {

        var size = Math.min(this.size[0] * 0.5, this.size[1] * 0.5);
       
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
            ctx.fillText(this.properties.label.value, this.size[0] * 0.5, 10);
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
        if (local_pos[0] > this.size[0] * 0.25 &&
            local_pos[1] >  this.size[0] * 0.25 &&
            local_pos[0] < this.size[0] * 0.75 &&
            local_pos[1] < this.size[1] * 0.75) {
            this.properties.state.inpValue = this.properties.state.value ? 0 : 1;
            this.update = true;

            return true;
        }
    }

    hwSetState(val) {
        this.properties.state.value = val;
    }
}

LiteGraph.registerNodeType(WidgetLed.type, WidgetLed);