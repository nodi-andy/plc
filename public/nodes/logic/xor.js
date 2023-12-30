import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";
import XOrCore from "./xor_core.mjs"

class logicXOr extends XOrCore{
    constructor() {
        super();
        this.properties = {};
        XOrCore.setup(this.properties);
    }

}

NodeWork.registerNodeType(logicXOr);