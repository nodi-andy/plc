import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class Junction extends LGraphNode {
    static type = "control/junction";

    constructor() {
        super();
        let inp = this.addInput("", "number");
        inp.pos = [16,16]
        inp.shape = LiteGraph.CIRCLE_SHAPE;
        
        let outp = this.addOutput("", "number");
        outp.pos = [16,16]
        outp.shape = LiteGraph.CIRCLE_SHAPE;

        this.size = [32, 32];
        this._shape = LiteGraph.CIRCLE_SHAPE;
        Junction.title = "Const Number";
        Junction.desc = "Constant number";
        Junction.title_mode = LiteGraph.NO_TITLE;
        Junction.fixsize = [32, 32];
    }
    onExecute() {
        this.setOutputData(0, parseFloat(this.properties["value"]));
    }
    getTitle() {
        if (this.flags.collapsed) {
            return this.properties.value;
        }
        return this.title;
    }
}


LiteGraph.registerNodeType(Junction.type, Junction);