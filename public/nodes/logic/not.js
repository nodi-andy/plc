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
        this.addInput("a", "number");
        this.addOutput("v", "number");
        this.addProperty("a", 0);
    }
    
    onExecute(update) {
        if (update) {
            var ret = this.properties.a ? 0 : 1;
            this.setOutputData(0, ret);
        }
    }
}

LiteGraph.registerNodeType(logicNot.type, logicNot);
