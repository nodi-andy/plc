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
        this.addInput("dec", "number", "", "dec");
        this.addInput("set", "number", "", "set");
        this.addOutput("num", "number", "", "num");
        this.addProperty("value", 0, "number", {name: "value"});
        //this.addWidget("toggle","Count Exec.",this.properties.doCountExecution,"doCountExecution");
        this.size = [128, 196];
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
        let pvalue = this.properties.value;
        let inc = this.getInputData(0);
        let dec = this.getInputData(1);
        let res = this.getInputData(2);
        let update = false;
        if (inc !== null) {
            if (isNaN(inc) == false) {
                this.properties.value = parseInt(this.properties.value) + parseInt(inc);
            }
            update = true;
        }
        if (dec && isNaN(dec) == false) {
            this.properties.value -= parseInt(dec);
            update = true;
        }
        if (res != null && isNaN(res) == false) {
            this.properties.value = res;
            update = true;
        }
        if (pvalue != this.properties.value) {
            this.setDirtyCanvas(true, true);
        }
        if (update) this.setOutputData(0, parseInt(this.properties.value));
    }

    onAfterExecute() {
        for(let input of this.inputs) {
            input._data = null;
        }
    }
}

LiteGraph.registerNodeType(EventCounter.type, EventCounter);