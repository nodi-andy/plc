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
        this.addInput("a", "number", 0);
        this.addInput("b", "number", 0);
        this.addOutput("v", "number");
    }

    onExecute(update) {
        if (update) {
            let ret = true;
            for (let input of this.inputs) {
                if (!this.properties[input.name]) {
                    ret = false;
                    break;
                }
            }
            ret = ret ? 1 : 0;
            this.setOutputDataByName("v", ret);
        }
    }

    onNodeInputAdd() {
        return LiteGraph.alphabet.filter(char => !Object.keys(this.properties).includes(char)).sort()[0];
    }

    onGetInputs() {
        return [
            ["and", "boolean", 0, ""]
        ];
    }

}

LiteGraph.registerNodeType(logicAnd.type, logicAnd);