import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class Selector extends LGraphNode{
    static type = "control/selector";
    static title = "SEL";
    static desc = "selects an output";

    constructor() {
        super();
        this.setProperty("SelIn", "sel", {input: true});
        this.setProperty("a", "a", {input: true});
        this.setProperty("out", "out", {output: true});
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