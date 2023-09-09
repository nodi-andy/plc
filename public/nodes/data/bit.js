import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class DFlipFlop extends LGraphNode {
    static title = "D-FlipFlop";
    static desc = "D-FlipFlop";
    static title_mode = LiteGraph.NO_TITLE;
    static type = "data/bit";
    constructor() {
        super();
        this.setProperty("state", "number", 0, "state", {input: false, output: false});
        this.setProperty("set", "number", 0, "set", {input: true, output: false});
        this.setProperty("clear", "number", 0, "clear", {input: true, output: false});
        this.setProperty("toggle", "number", 0, "toggle", {input: false, output: false});
        this.setProperty("in", "number", 0, "in", {input: false, output: false});
        this.setProperty("out", "number", 0, "out", {input: false, output: false});
        this.size = [64, 128];
    }


    onExecute() {
            if (this.properties.set.inpValue == 1) {
                this.properties.state.value = 1;
                this.properties.set.inpValue = null;
            }

            if (this.properties.clear.inpValue == 1) {
                this.properties.state.value = 0;
                this.properties.clear.inpValue = null;
            }

            if (this.properties.toggle.inpValue == 1) {
                if ( this.properties.state.value == 1) {
                    this.properties.state.value = 0;
                    this.properties.state.outValue = this.properties.state.value;
                } else {
                    this.properties.state.value = 1;
                    this.properties.state.outValue = this.properties.state.value;
                }
                this.properties.toggle.inpValue = null;
            }

            this.setDirtyCanvas(true, true);
    }
}

LiteGraph.registerNodeType(DFlipFlop.type, DFlipFlop);