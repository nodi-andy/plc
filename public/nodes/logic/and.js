import NodeWork from "../../nodework.mjs";
import AndCore from "./and_core.mjs"

class logicAnd extends AndCore{
    constructor() {
        super();
        this.properties = {};
        AndCore.setup(this.properties);
        Node.setSize(this, [64, 128]);
    }
}

NodeWork.registerNodeType(logicAnd);