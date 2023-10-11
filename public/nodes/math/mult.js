import { LiteGraph } from "../../litegraph.js";
import LGraphNode from "../../node.js";
import MathMultCore from "./mult_core.mjs"

class MathMult extends MathMultCore{
    constructor() {
        super();
        this.properties = {};
        MathMultCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.setSize([64, 128]);
        this.widgets = [this.widget];
    }

    onExecute(props) {
        return MathMult.run(props);
    }

}

LiteGraph.registerNodeType(MathMult.type, MathMult);
