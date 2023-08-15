import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

//Math operation
class MathIsEqual extends LGraphNode {
    static title = "IsEqual";
    static desc = "Easy math operators";
    static title_mode = LiteGraph.NO_TITLE;
    static type = "math/isequal";

    constructor() {
        super();
        this.setProperty("in1", "number", 0, " ", {input: true, output: false});
        this.setProperty("in2", "number", 0, " ", {input: true, output: false});
        this.setProperty("out", "number", 0, " ", {input: false, output: true});
        this.label = ""
    }

    setValue(v) {
        if (typeof v == "string") {
            v = parseFloat(v);
        }
        this.properties["out"] = v;
    }

    onNodeInputAdd() {
        return LiteGraph.alphabet.filter(char => !Object.keys(this.properties).includes(char)).sort()[0];
    }

    onExecute(update) {

        if (update) {
            let ret = 1;
            this.label = "=?";
            let lastValue = null;
            for (let input of Object.values(this.properties)) {
                if (input.input == false) continue;

                let val = input.value
                if (lastValue == null) {
                    lastValue = val;
                } else if (lastValue != val) {
                    ret = 0;
                    break;
                }
            }
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

LiteGraph.registerNodeType(MathIsEqual.type, MathIsEqual);
