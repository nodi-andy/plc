import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class Selector extends LGraphNode{
    static type = "control/selector";

    constructor() {
        super();
        this.addInput("Sel", "", "", "A");
        this.addInput("A", "", "", "B");
        this.addInput("B", "number", "", "Sel");
        this.addOutput("out");

        this.selected = 0;
    }
    onExecute() {
        var sel = this.getInputData(0);
        if (sel == null || sel.constructor !== Number)
            sel = 0;
        this.selected = sel = Math.round(sel) % (this.inputs.length - 1);
        var v = this.getInputData(sel + 1);
        if (v !== null) {
            this.setOutputData(0, v);
        }
    }
    onGetInputs() {
        return [["E", 0], ["F", 0], ["G", 0], ["H", 0]];
    }
}

Selector.title = "SEL";
Selector.desc = "selects an output";
Selector.title_mode = LiteGraph.CENTRAL_TITLE;

LiteGraph.registerNodeType(Selector.type, Selector);