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
        this.setProperty("in1", "number", 0, " ", {input: true, output: false});
        this.setProperty("in2", "number", 0, " ", {input: true, output: false});
        this.setProperty("value", "number", 0, " ", {input: false, output: true});
        this.type = logicOr.type;
    }
    onExecute(update) {
           if (update) {
            let ret = false;
            for (let input of Object.values(this.properties)) {
                if (input.input == true && input.inpValue !== null) {
                    input.value = input.inpValue;
                    input.inpValue = null;
                }
            }
            for (let input of Object.values(this.properties)) {
                if (input.input == true && input.value) {
                    ret = true;
                    break;
                }
            }
            ret = ret ? 1 : 0;
            this.properties.value.outValue = ret;
            this.update = false;
        }
    }
    getProps() {
        return [
            ["or", "boolean"]
        ];
    }
}

LiteGraph.registerNodeType(logicOr.type, logicOr);