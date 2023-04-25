import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

//Math operation
class MathMult extends LGraphNode {
    static title = "Operation";
    static desc = "Easy math operators";
    static title_mode = LiteGraph.NO_TITLE;
    static type = "math/mult";

    constructor() {
        super();
        this.addInput("a", "number", 0, "a");
        this.addInput("b", "number", 0, "b");
        this.addOutput("v", "number", 0, "v");
        this.label = ""
        this._result = []; //only used for arrays
    }

    setValue(v) {
        if (typeof v == "string") {
            v = parseFloat(v);
        }
        this.properties["value"] = v;
    }

    onGetInputs() {
        return [
            ["summand", "number", 0, "summand", {optional: true}]
        ];
    }

    onNodeInputAdd() {
        return LiteGraph.alphabet.filter(char => !Object.keys(this.properties).includes(char)).sort()[0];
    }

    onExecute(update) {
        if (update) {
            let ret = 0;
            this.label = "";
            for (let inX = 0; inX < this.inputs.length; inX++) {
                let inp = this.inputs[inX];
                let val = this.properties[inp?.name]
                val = parseInt(this.properties[inp.name]);
                this.label += val
                val = parseInt(val);
                if (val == null || isNaN(val)) val = 0;
                if (inX < this.inputs.length - 1) this.label += " * "
                if (inX == 0) {
                    ret = parseInt(val)
                } else {
                    ret *= parseInt(val);
                }
            }
            this.setOutputDataByName("v", ret);
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

LiteGraph.registerNodeType(MathMult.type, MathMult);
