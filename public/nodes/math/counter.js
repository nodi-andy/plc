import WidgetNumber from "../widget/number.js";
import { LiteGraph } from "../../litegraph.js";

class EventCounter extends WidgetNumber{
    static type = "math/counter";
    static title = "Counter";
    static desc = "Counts events";

    constructor() {
        super();
        this.setProperty("inc", "number", 0, "+", {input: true, output: false});
        this.setProperty("dec", "number", 0, "-", {input: false, output: false});
        this.type = EventCounter.type;
    }

    onDrawForeground(ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.value.value, this.size[0] * 0.5, this.size[1] * 0.5);
    }

    onMouseDown(e, pos) {
        this.captureInput(true);
        this.setDirtyCanvas(true);
        return false;
    }

    onMouseUp(e, pos) {
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

    onExecute(update) {
        if (update) {
            super.exec(update);
            if (this.properties.inc.inpValue !== null && isNaN(this.properties.inc.inpValue) == false) {
                this.updateProp("value", parseInt(this.properties.value.value) + parseInt(this.properties.inc.inpValue))
                this.properties.value.outValue = this.properties.value.value;
                this.properties.inc.inpValue = null;
            }

            if (this.properties.dec.value !== null && isNaN(this.properties.dec.value) == false) {
                this.updateProp("value", parseInt(this.properties.value.value) - parseInt(this.properties.inc.inpValue))
                this.properties.value.outValue = this.properties.value.value;
                this.properties.dec.value = null;
            }

            this.setDirtyCanvas(true, true);
        }
    }
}

LiteGraph.registerNodeType(EventCounter.type, EventCounter);