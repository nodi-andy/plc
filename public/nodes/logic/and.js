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
        this.setProperty("in1", "number", 0, " ", {input: true, output: false});
        this.setProperty("in2", "number", 0, " ", {input: true, output: false});
        this.setProperty("value", "number", 0, " ", {input: false, output: true});
    }

    onExecute(update) {
        if (update) {
            let ret = true;
            for (let input of Object.values(this.properties)) {
                if (input.input == true && input.inpValue !== null) {
                    input.value = input.inpValue;
                    input.inpValue = null;
                }
            }
            for (let input of Object.values(this.properties)) {
                if (input.input == true && !input.value) {
                    ret = false;
                    break;
                }
            }
            ret = ret ? 1 : 0;
            this.properties.value.outValue = ret;
            this.update = false;
        }
    }

    onNodeInputAdd() {
        return LiteGraph.alphabet.filter(char => !Object.keys(this.properties).includes(char)).sort()[0];
    }

    getProps() {
        return [
            ["and", "number", 0, ""]
        ];
    }

}

LiteGraph.registerNodeType(logicAnd.type, logicAnd);