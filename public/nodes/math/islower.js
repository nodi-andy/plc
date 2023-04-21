import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

//Math operation
class MathIsLower extends LGraphNode {
    static title = "Operation";
    static desc = "Easy math operators";
    static title_mode = LiteGraph.NO_TITLE;
    static type = "math/islower";

    constructor() {
        super();
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addOutput("=", "number");
        this.addProperty("A", 0);
        this.addProperty("B", 0);
        this._result = []; //only used for arrays
    }

    setValue(v) {
        if (typeof v == "string") {
            v = parseFloat(v);
        }
        this.properties["value"] = v;
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
                this.inputs[n]._data = null;
                update = true;
            }
        }
        if (update) {
            if (this.properties.A < this.properties.B) {
                this.setOutputData(0, 1);
            } else {
                this.setOutputData(0, 0);
            }
        }
    }

    onDrawBackground(ctx) {
        if (this.flags.collapsed) {
            return;
        }

        ctx.font = "40px Arial";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.A +"<" + this.properties.B + "?", this.size[0] * 0.5, (this.size[1] + LiteGraph.NODE_TITLE_HEIGHT) * 0.5);
        ctx.textAlign = "left";
    }
}

LiteGraph.registerNodeType(MathIsLower.type, MathIsLower);
