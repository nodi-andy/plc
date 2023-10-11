import { LiteGraph } from "../../litegraph.js";
import LGraphNode from "../../node.js";
import MathIsGreaterCore from "./isgreater_core.mjs"

class MathIsGreater extends MathIsGreaterCore{
    constructor() {
        super();
        this.properties = {};
        MathIsGreaterCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.setSize([64, 128]);
        this.widgets = [this.widget];
    }

    onExecute(props) {
        return MathIsGreater.run(props);
    }

}

LiteGraph.registerNodeType(MathIsGreater.type, MathIsGreater);
