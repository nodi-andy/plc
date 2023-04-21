import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class Junction extends LGraphNode {
    static type = "control/junction";
    static title = "Junction";
    static desc = "Junction";
    static title_mode = LiteGraph.NO_TITLE;
    static fixsize = [32, 32];

    constructor() {
        super();
        let inp = this.addInput("in", "number");
        this.addProperty("in", 0);
        inp.pos = [16,16]
        inp.shape = LiteGraph.CIRCLE_SHAPE;
        
        let outp = this.addOutput("", "number");
        outp.pos = [16,16]
        outp.shape = LiteGraph.CIRCLE_SHAPE;

        this.size = [32, 32];
        this._shape = LiteGraph.CIRCLE_SHAPE;
    }
    onExecute() {
        let input = this.getInputData(0);
        this.setOutputData(0, input);
    }
    getTitle() {
        if (this.flags.collapsed) {
            return this.properties.value;
        }
        return this.title;
    }
}


LiteGraph.registerNodeType(Junction.type, Junction);