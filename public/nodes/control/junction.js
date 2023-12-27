import NodeWork from "../../nodework.mjs";
import { Node } from "../../node.mjs";
import JunctionCore from "./junction_core.mjs"

class Junction extends JunctionCore{
    constructor() {
        super();
        this.properties = {};
        JunctionCore.setup(this.properties);
        this.fixsize = [32, 32];
        this.type = Junction.type;
    }

    onExecute(props) {
        return JunctionCore.run(props);
    }

}

NodeWork.registerNodeType(Junction);
