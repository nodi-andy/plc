import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class EventCounter extends LGraphNode{
    static type = "math/counter";
    static title = "Counter";
    static desc = "Counts events";
    static title_mode = LiteGraph.NO_TITLE;

    constructor() {
        super();
        this.addInput("inc", "number", "", "inc");
        this.addInput("set", "number", "", "set");
        this.addOutput("num", "number", "", "num");
        this.addProperty("value", 0, "number", {name: "value"});
        this.addProperty("inc", 0);
        this.addProperty("set", 0);
        //this.addWidget("toggle","Count Exec.",this.properties.doCountExecution,"doCountExecution");
        this.size = [128, 196];
    }

    onGetInputs() {
        return [["dec", "number", 0]];
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
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.value, this.size[0] * 0.5, this.size[1] * 0.5);
    }
    onExecute() {
        let update = false;
        for(let n = 0; n < this.inputs.length; n++) {
            if (this.getInputData(n) != null) {
                this.properties[this.inputs[n]?.name] = this.getInputData(n)
                this.inputs[n]._data = null;
                update = true;
            }
        }
        if (update) {
            if (this.properties.inc !== null && isNaN(this.properties.inc) == false) {
                this.properties.value = parseInt(this.properties.value) + parseInt(this.properties.inc);
                this.properties.inc = null;
            }
            if (this.properties.dec !== null && isNaN(this.properties.dec) == false) {
                this.properties.value -= parseInt(this.properties.dec);
                this.properties.dec = null;
            }
            if (this.properties.set != null && isNaN(this.properties.set) == false) {
                this.properties.value = this.properties.set;
                this.properties.set = null;
            }
            this.setDirtyCanvas(true, true);
            this.setOutputData(0, parseInt(this.properties.value));
        }
    }

    onAfterExecute() {
        for(let input of this.inputs) {
            input._data = null;
        }
    }
}

LiteGraph.registerNodeType(EventCounter.type, EventCounter);