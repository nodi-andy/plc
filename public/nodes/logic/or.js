import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class logicOr extends LGraphNode{
    static type = "logic/or";
    static title = "OR";
    static desc = "Return true if at least one input is true";
    static title_mode = LiteGraph.CENTRAL_TITLE;
    
    constructor() {
        super();
        this.properties = {};
        this.addInput("a", "number");
        this.addInput("b", "number");
        this.addOutput("v", "number");
    }
    onExecute() {
        let ret = false;
        for (let inX in this.inputs) {
            if (this.getInputData(inX)) {
                ret = true;
                break;
            }
        }
        this.setOutputData(0, ret);
    }
    onGetInputs() {
        return [
            ["or", "boolean"]
        ];
    }
}

LiteGraph.registerNodeType(logicOr.type, logicOr);