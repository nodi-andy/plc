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
        this.setProperty("in", "number", 0, " ", {input: true, output: false});
        this.setProperty("out", "number", 0, " ", {input: false, output: true});
        this.type = logicNot.type;
    }
    
    onExecute(update) {
        if (update) {
            var ret = this.properties.in.value ? 0 : 1;
            this.properties.out.value = ret;
        }
    }
}

LiteGraph.registerNodeType(logicNot.type, logicNot);
