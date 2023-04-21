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
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addOutput("=", "number");
        this.addProperty("A", 0);
        this.addProperty("B", 0);
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
            ["summand", "number"]
        ];
    }

    onNodeInputAdd(slot) {
        slot.name = LiteGraph.alphabet.filter(char => !Object.keys(this.properties).includes(char)).sort()[0];
        this.addProperty(slot.name, 0);
    }

    onExecute() {
        let update = false;
        for(let n = 0; n < this.inputs.length; n++) {
            if (this.getInputData(n) != null) {
                this.properties[this.inputs[n]?.name] = this.getInputData(n)
                update = true;
            }
        }
        let ret = 0;
        this.label = "";
        for (let inX = 0; inX < this.inputs.length; inX++) {
            let inp = this.inputs[inX];
            let val = this.properties[inp?.name]
            val = parseInt(this.properties[inp.name]);
            this.label += val
            val = parseInt(val);
            if (val == null || isNaN(val)) val = 0;
            if (inX < this.inputs.length - 1) this.label += " + "
            ret += parseInt(val);
        }
        if (update) {
            this.setOutputData(0, ret);
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
