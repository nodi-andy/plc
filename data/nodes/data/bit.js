import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class DFlipFlop extends LGraphNode {
    static title = "D-FlipFlop";
    static desc = "D-FlipFlop";
    static title_mode = LiteGraph.NO_TITLE;
    constructor() {
        super();
        this.addInput("set", "number", "", "set");
        this.addInput("reset", "number", "", "reset");
        this.addInput("toggle", "number", "", "toggle");
        this.addOutput("d", "number", "", "d");
        this.properties = { font: "", value: false, port: "" };
        this.size = [64, 196];
    }
    onExecute() {
    }
    onAction(action) {
        this.setValue(!this.properties.value);
    }
}

LiteGraph.registerNodeType("data/bit", DFlipFlop);