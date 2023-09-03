import WidgetNumber from "../data/number.js";
import { LiteGraph } from "../../litegraph.js";

class EventCounter extends WidgetNumber{
    static type = "math/counter";
    static title = "Counter";
    static desc = "Counts events";
    static title_mode = LiteGraph.NO_TITLE;

    constructor() {
        super();
        this.setProperty("inc",     "number", 0, "+", {input: true, output: false});
        this.setProperty("dec",     "number", 0, "-", {input: false, output: false});
    }


    onDrawForeground(ctx) {
        ctx.fillStyle = "#AAA";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.value.value, this.size[0] * 0.5, this.size[1] * 0.5);
    }

    onMouseDown(e, pos) {
        if (pos[1] < 0) {
            return;
        }

        this.captureInput(true);
        this.setDirtyCanvas(true);
        return true;
    }

    onMouseUp(e, pos) {

        if (this.mouse_captured) {
            this.mouse_captured = false;
            this.captureInput(false);
        }
        this.setDirtyCanvas(true);

    }


    onExecute(update) {
        if (update) {
            super.exec(update);
            if (this.properties.inc.value !== null && isNaN(this.properties.inc.value) == false) {
                this.properties.value.value = parseInt(this.properties.value.value) + parseInt(this.properties.inc.value);
                this.properties.inc.value = null;
            }

            if (this.properties.dec.value !== null && isNaN(this.properties.dec.value) == false) {
                this.properties.value.value -= parseInt(this.properties.dec.value);
                this.properties.dec.value = null;
            }

            this.properties.get.value = this.properties.value.value;
            this.setDirtyCanvas(true, true);
        }
    }
}

LiteGraph.registerNodeType(EventCounter.type, EventCounter);