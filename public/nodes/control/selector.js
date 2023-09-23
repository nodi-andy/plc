import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class Selector extends LGraphNode{
    static type = "control/selector";
    static title = "SEL";
    static desc = "selects an output";

    constructor() {
        super();
        this.setProperty("SelIn", "number", 0, "sel", {input: true, output: false});
        this.setProperty("a", "number", 0, "a", {input: true, output: false});
        this.setProperty("out", "number", 0, "out", {input: false, output: true});
        this.type = Selector.type;
    }

    onExecute(update) {
        if (update && isNaN(this.properties.SelIn) == false && this.properties.SelIn > 0) {

            var v = this.properties.SelIn.value;
            this.setOutputData(1, v); // select output feature missing, const 1
            this.properties.SelIn = null
        }
    }

    onNodeInputAdd() {
        return LiteGraph.alphabet.filter(char => !Object.keys(this.properties).includes(char)).sort()[0];
    }

}

LiteGraph.registerNodeType(Selector.type, Selector);