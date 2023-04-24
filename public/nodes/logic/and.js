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
        this.addInput("a", "number");
        this.addInput("b", "number");
        this.addProperty("a", 0);
        this.addProperty("b", 0);
        
        this.addOutput("v", "number");
    }

    onExecute() {
        for(let n = 0; n < this.inputs.length; n++) {
            if (this.getInputData(n) != null) {
                this.properties[this.inputs[n]?.name] = this.getInputData(n)
            }
        }
        let ret = true;
        for (let input of this.inputs) {
            if (!this.properties[input.name]) {
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