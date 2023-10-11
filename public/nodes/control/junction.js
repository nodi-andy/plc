import { LiteGraph } from "../../litegraph.js";
import LGraphNode from "../../node.js";
import JunctionCore from "./junction_core.mjs"

class Junction extends JunctionCore{
    static title_mode = LiteGraph.NO_TITLE;
    static fixsize = [32, 32];

    constructor() {
        super();
        this.properties = {};
        JunctionCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.setSize([64, 128]);
        this.widgets = [this.widget];
    }

    onExecute(props) {
        return JunctionCore.run(props);
    }

}

LiteGraph.registerNodeType(Junction.type, Junction);
