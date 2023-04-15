import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class logicNot extends LGraphNode{
    static type = "logic/not";
    static title = "NOT";
    static desc = "Return the logical negation";
    static title_mode = LiteGraph.CENTRAL_TITLE;
    constructor() {
        super();
        this.properties = {};
        this.addInput("", "number");
        this.addOutput("", "number");
    }
    
    onExecute() {
        var ret = !this.getInputData(0);
        this.setOutputData(0, ret);
    }
}

LiteGraph.registerNodeType(logicNot.type, logicNot);
