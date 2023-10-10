import { LiteGraph } from "../../litegraph.js";
import LGraphNode from "../../node.js";
import AndCore from "./and_core.mjs"

class logicAnd extends AndCore{
    constructor() {
        super();
        this.properties = {};
        AndCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.setSize([64, 128]);
        this.widgets = [this.widget];
        this.type = AndCore.type
        this.title = AndCore.title;
    }

    onExecute(props) {
        return AndCore.run(props);
    }

}

LiteGraph.registerNodeType(logicAnd.type, logicAnd);