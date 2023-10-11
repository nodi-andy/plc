import { LiteGraph } from "../../litegraph.js";
import LGraphNode from "../../node.js";
import MathIsEqualCore from "./isequal_core.mjs"

class MathIsEqual extends MathIsEqualCore{
    constructor() {
        super();
        this.properties = {};
        MathIsEqualCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.setSize([64, 128]);
        this.widgets = [this.widget];
    }

    onExecute(props) {
        return MathIsEqual.run(props);
    }

}

LiteGraph.registerNodeType(MathIsEqual.type, MathIsEqual);
