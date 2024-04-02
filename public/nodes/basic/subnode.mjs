import NodeWork from "../../nodework.mjs";

export default class SubNode extends NodeWork {
    static title = "SUB";
    static type = "basic/subnode";
    static pixels_threshold = 10;
    static old_y = -1;
    static _remainder = 0;
    static _precision = 0;
    static mouse_captured = false;
    static defaultInput = "value";
    static defaultOutput = "value";
    
    constructor() {
        super();
        SubNode.setup(this.properties);
    }

    static setup(node) {
        //SubNode.reset(node);
    }

    static run(node) {
        if (node == null) return;
        let props = node.properties;
        let ret = [];

        return ret;
    }

    
}

NodeWork.registerNodeType(SubNode);