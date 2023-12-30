import Node from "../../node.mjs";
import NodeWork from "../../nodework.mjs";

class Selector extends Node{
    static type = "control/selector";
    static title = "SEL";
    static desc = "selects an output";

    constructor() {
        super();
        this.setProperty("SelIn", "sel", {input: true});
        this.setProperty("a", "a", {input: true});
        this.setProperty("out", "out", {output: true});
    }

    onExecute(update) {
        if (update && isNaN(this.properties.SelIn) == false && this.properties.SelIn > 0) {

            var v = this.properties.SelIn.value;
            this.setOutputData(1, v); // select output feature missing, const 1
            this.properties.SelIn = null
        }
    }

}

NodeWork.registerNodeType(Selector);