import { LiteGraph } from "../../litegraph.js";
import LGraphNode from "../../node.js";
import MathAddCore from "./add_core.mjs"

class MathAdd extends MathAddCore{
    constructor() {
        super();
        this.properties = {};
        MathAddCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.setSize([64, 128]);
        this.widgets = [this.widget];
    }

    onExecute(props) {
        return MathAddCore.run(props);
    }

}

LiteGraph.registerNodeType(MathAdd.type, MathAdd);
