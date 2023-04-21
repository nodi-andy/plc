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
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addProperty("A", 0);
        this.addProperty("B", 0);
        
        this.addOutput("", "number");
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