import NodeWork from "../../nodework.mjs";
import { LGraphNode } from "../../node.mjs";
import JunctionCore from "./junction_core.mjs"

class Junction extends JunctionCore{
    constructor() {
        super();
        this.properties = {};
        JunctionCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.fixsize = [32, 32];
        this.widget.type = Junction.type;
        this.widget.properties = this.properties;
        this.widgets = [this.widget];
    }

    onExecute(props) {
        return JunctionCore.run(props);
    }

}

NodeWork.registerNodeType(Junction.type, Junction);
