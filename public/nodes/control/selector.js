import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class Selector extends LGraphNode{
    static type = "control/selector";

    constructor() {
        super();
        this.addInput("SelIn", "number" );
        this.addInput("a", "number");
        this.addOutput("out", "number");
    }
    onExecute(update) {
        if (update && isNaN(this.properties.SelIn) == false && this.properties.SelIn > 0) {

            var v = this.properties[this.inputs[this.properties.SelIn]?.name]
            this.setOutputData(1, v); // select output feature missing, const 1
            this.properties[this.inputs[this.properties.SelIn].name] = null
        }
    }
    onNodeInputAdd() {
        return LiteGraph.alphabet.filter(char => !Object.keys(this.properties).includes(char)).sort()[0];
    }

    onGetInputs() {
        return [
            ["gate", "number", 0, ""]
        ];
    }
}

Selector.title = "SEL";
Selector.desc = "selects an output";
Selector.title_mode = LiteGraph.CENTRAL_TITLE;

LiteGraph.registerNodeType(Selector.type, Selector);