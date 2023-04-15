import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class logicAnd extends LGraphNode{
    static type = "logic/and";
    static title = "AND";
    static desc = "Return true if all inputs are true";
    static title_mode = LiteGraph.CENTRAL_TITLE;
    
    constructor() {
        super();
        this.properties = {};
        this.addInput("", "number");
        this.addInput("", "number");
        this.addOutput("", "number");
    }
    onExecute() {
        let ret = true;
        for (let inX in this.inputs) {
            if (!this.getInputData(inX)) {
                ret = false;
                break;
            }
        }
        ret = ret ? 1 : 0;
        this.setOutputData(0, ret);
    }
    onGetInputs() {
        return [
            ["and", "boolean"]
        ];
    }

}

LiteGraph.registerNodeType(logicAnd.type, logicAnd);