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
            ["comparand", "number", 0, "comparand", {optional: true}]
        ];
    }

    onNodeInputAdd() {
        return LiteGraph.alphabet.filter(char => !Object.keys(this.properties).includes(char)).sort()[0];
    }

    onExecute(update) {
        if (update) {
            let ret = 1;
            this.label = "=?";
            let lastValue = null;
            for (let index in this.inputs) {
                let input = this.inputs[index]
                if (index == 0) {
                    lastValue = this.properties[input.name];
                } else if (lastValue != this.properties[input.name]) {
                    ret = 0;
                    break;
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

LiteGraph.registerNodeType(MathIsEqual.type, MathIsEqual);
