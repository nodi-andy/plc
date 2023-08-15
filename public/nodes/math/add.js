import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

//Math operation
class MathAdd extends LGraphNode {
    static title = "Operation";
    static desc = "Easy math operators";
    static title_mode = LiteGraph.NO_TITLE;
    static type = "math/add";

    constructor() {
        super();
        this.setProperty("in1", "number", 0, " ", {input: true, output: false});
        this.setProperty("in2", "number", 0, " ", {input: true, output: false});
        this.setProperty("out", "number", 0, " ", {input: false, output: true});
        this.label = ""
    }

    onNodeInputAdd() {
        return LiteGraph.alphabet.filter(char => !Object.keys(this.properties).includes(char)).sort()[0];
    }

    onExecute(update) {
        if (update) {
            let ret = 0;
            this.label = "";
            for (let input of Object.values(this.properties)) {
                if (input.input == false) continue;
                let val = input.value
                val = parseInt(input.value);
                if (val == null || isNaN(val)) val = 0;

                //this.label += val
                val = parseInt(val);
                //if (inX < this.inputs.length - 1) this.label += " + "
                ret += parseInt(val);
            }
            this.label = ret
            this.properties.out.value = ret;
            update = false;
        }
    }

    onDrawBackground(ctx) {
        if (this.flags.collapsed) {
            return;
        }

        ctx.font = "20px Arial";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText(this.label, this.size[0] * 0.5, this.size[1] * 0.5);
        ctx.textAlign = "left";
    }
}

LiteGraph.registerNodeType(MathAdd.type, MathAdd);
