import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class DFlipFlop extends LGraphNode {
    static title = "D-FlipFlop";
    static desc = "D-FlipFlop";
    static title_mode = LiteGraph.NO_TITLE;
    static type = "data/bit";
    constructor() {
        super();
        this.addInput("set", "number", "", "set");
        this.addInput("reset", "number", "", "reset");
        this.addOutput("d", "number", "", "d");
        this.properties = { font: "", value: false, port: "" };
        this.size = [64, 128];
    }
    onGetInputs() {
        return [
            ["toggle", "number", "", "toggle"]
        ];
    }

    onExecute() {
        let update = false;
        this.pset = this.getInputData(0);
        if (this.inputs[0].link != null) {
            var setBit = this.getInputData(0);
            if (setBit != null) {
                this.properties.value = 1;
                update = true
            }
        }

        if (this.inputs[1].link != null) {
            var resetBit = this.getInputData(1);
            if (resetBit != null) {
                this.properties.value = 0;
                update = true
            }
        }

        if (this.inputs[2]?.link != null) {
            var toggleBit = this.getInputData(2);
            if (toggleBit != null) {
                if ( this.properties.value == 1) {
                    this.properties.value = 0;
                } else {
                    this.properties.value = 1;
                }
                update = true
            }
        }

        this.setDirtyCanvas(true, true);
        if (update) {
            this.setOutputData(0, this.properties.value);
        }
    }
}

LiteGraph.registerNodeType(DFlipFlop.type, DFlipFlop);