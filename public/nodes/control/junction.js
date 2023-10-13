import { LiteGraph } from "../../litegraph.js";
import LGraphNode from "../../node.js";
import JunctionCore from "./junction_core.mjs"

class Junction extends JunctionCore{
    static title_mode = LiteGraph.NO_TITLE;

    constructor() {
        super();
        this.properties = {};
        JunctionCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.fixsize = [16, 16];
        this.widget.type = Junction.type;
        this.widget.properties = this.properties;
        this.widgets = [this.widget];
    }

    onExecute(props) {
        return JunctionCore.run(props);
    }

}

LiteGraph.registerNodeType(Junction.type, Junction);
