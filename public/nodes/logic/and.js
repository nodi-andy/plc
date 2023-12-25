import NodeWork from "../../nodework.mjs";
import { LGraphNode } from "../../node.mjs";
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

NodeWork.registerNodeType(logicAnd.type, logicAnd);