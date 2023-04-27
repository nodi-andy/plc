import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class DFlipFlop extends LGraphNode {
    static title = "D-FlipFlop";
    static desc = "D-FlipFlop";
    static title_mode = LiteGraph.NO_TITLE;
    static type = "data/bit";
    constructor() {
        super();
        this.addInput("set", "number", 0, "set");
        this.addInput("clear", "number", 0, "clear");
        this.addOutput("v", "number", 0, "v");
        this.properties = { font: "", value: false, port: "" };
        this.size = [64, 128];
    }
    onGetInputs() {
        return [
            ["toggle", "number", 0, "toggle"]
        ];
    }

    onExecute(update) {
        if (update) {
            if (this.properties.set == 1) {
                this.properties.v = 1;
                this.properties.set = null;
                this.setInputDataByName("set", null);
            }

            if (this.properties.clear == 1) {
                this.properties.v = 0;
                this.properties.clear = null;
                this.setInputDataByName("clear", null);
            }

            if (this.properties.toggle == 1) {
                if ( this.properties.v == 1) {
                    this.properties.v = 0;
                } else {
                    this.properties.v = 1;
                }
                this.setInputDataByName("toggle", null);
                this.properties.toggle = null;
            }

            this.setDirtyCanvas(true, true);
            this.setOutputDataByName("v", this.properties.v);
        }
    }
}

LiteGraph.registerNodeType(DFlipFlop.type, DFlipFlop);