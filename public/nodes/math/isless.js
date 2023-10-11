import { LiteGraph } from "../../litegraph.js";
import LGraphNode from "../../node.js";
import MathIsLessCore from "./isless_core.mjs"

class MathIsLess extends MathIsLessCore{
    constructor() {
        super();
        this.properties = {};
        MathIsLess.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.setSize([64, 128]);
        this.widgets = [this.widget];
    }

    onExecute(props) {
        return MathIsLess.run(props);
    }

}

LiteGraph.registerNodeType(MathIsLess.type, MathIsLess);
