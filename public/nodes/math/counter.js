import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class EventCounter extends LGraphNode{
    static type = "math/counter";
    static title = "Counter";
    static desc = "Counts events";
    static title_mode = LiteGraph.NO_TITLE;

    constructor() {
        super();
        this.setProperty("inc", "number", 0, "+", {input: true, output: false});
        this.setProperty("dec", "number", 0, "-", {input: false, output: false});
        this.setProperty("value", "number", 0, " ", {input: false, output: true});
        this.setProperty("set", "number", 0, " ", {input: false, output: false});
        this.setProperty("get", "number", 0, " ", {input: false, output: false});

        this.size = [64, 64];
    }

    getProps() {
        return [["set", "number", null, "set"], ["dec", "number", null, "dec"]];
    }

    getTitle() {
        if (this.flags.collapsed) {
            return String(this.properties.value);
        }
        return this.title;
    }
    onDrawBackground(ctx) {
        if (this.flags.collapsed) {
            return;
        }
        ctx.fillStyle = "#AAA";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.value.value, this.size[0] * 0.5, this.size[1] * 0.5);
    }
    onExecute(update) {
        if (update) {
            if (this.properties.inc.value !== null && isNaN(this.properties.inc.value) == false) {
                this.properties.value.value = parseInt(this.properties.value.value) + parseInt(this.properties.inc.value);
                this.properties.inc.value = null;
            }
            if (this.properties.dec.value !== null && isNaN(this.properties.dec.value) == false) {
                this.properties.value.value -= parseInt(this.properties.dec.value);
                this.properties.dec.value = null;
            }
            if (this.properties.set.value != null && isNaN(this.properties.set.value) == false) {
                this.properties.value.value = this.properties.set.value;
                this.properties.set.value = null;
            }
            this.setDirtyCanvas(true, true);
        }
    }

    onAfterExecute() {
        for(let input of this.inputs) {
            input.value = null;
        }
    }
}

LiteGraph.registerNodeType(EventCounter.type, EventCounter);