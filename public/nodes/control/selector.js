import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class Selector extends LGraphNode{
    static type = "control/selector";

    constructor() {
        super();
        this.addInput("SelIn", "", "", "Sel");
        this.addInput("A", "", "", "A");
        this.addOutput("SelOut");
        this.addOutput("A", "", "", "A'");
        this.addProperty("Sel", 0, "number")
        this.addProperty("A", 0, "number")
    }
    onExecute() {
        if (this.getInputData(0) != null) this.properties.Sel = this.getInputData(0)
        if (this.getInputData(1) != null) this.properties.A = this.getInputData(1)

        if (isNaN(this.properties.Sel) == false && this.properties.Sel > 0) {
            var v = this.properties[this.inputs[this.properties.Sel]?.name]
            this.setOutputData(1, v);
            this.properties[this.inputs[this.properties.Sel].name] = null
        }
    }
    onGetInputs() {
        return [["B", 0], ["C", 0], ["D", 0], ["E", 0]];
    }
}

Selector.title = "SEL";
Selector.desc = "selects an output";
Selector.title_mode = LiteGraph.CENTRAL_TITLE;

LiteGraph.registerNodeType(Selector.type, Selector);