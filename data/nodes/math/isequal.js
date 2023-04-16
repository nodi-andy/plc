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
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addOutput("=", "number");
        this.addProperty("A", 0);
        this.addProperty("B", 0);
    }

    setValue(v) {
        if (typeof v == "string") {
            v = parseFloat(v);
        }
        this.properties["value"] = v;
    }
    onGetInputs() {
        return [
            ["comparand", "number"]
        ];
    }

    onNodeInputAdd(slot) {
        slot.name = LiteGraph.alphabet.filter(char => !Object.keys(this.properties).includes(char)).sort()[0];
        this.addProperty(slot.name, 0);
    }

    onExecute() {
        let ret = 1;
        let firstValue;
        for (let inX = 0; inX < this.inputs.length; inX++) {
            let inp = this.inputs[inX];
            let val = this.getInputData(inX)
            if (val != null) {
                if (val.constructor === Number)
                    this.properties[inp.name] = val;
            } else {
                val = parseInt(this.properties[inp.name]);
            }
            val = parseInt(val);
            if (val == null || isNaN(val)) val = 0;
            if (inX == 0) {
                firstValue = val
            } else {
                if (firstValue !== val) {
                    ret = 0;
                    break;
                }
            }
        }
        this.setOutputData(0, ret);
    }

    onDrawBackground(ctx) {
        ctx.font = "40px Arial";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText("=?", this.size[0] * 0.5, (this.size[1] + LiteGraph.NODE_TITLE_HEIGHT) * 0.5);
        ctx.textAlign = "left";
    }
}

LiteGraph.registerNodeType(MathIsEqual.type, MathIsEqual);
