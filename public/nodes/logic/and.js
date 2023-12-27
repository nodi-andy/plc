import NodeWork from "../../nodework.mjs";
import AndCore from "./and_core.mjs"

class logicAnd extends AndCore{
    constructor() {
        super();
        this.properties = {};
        AndCore.setup(this.properties);
        this.setSize([64, 128]);
        this.type = AndCore.type
        this.title = AndCore.title;
    }

    onExecute(props) {
        return AndCore.run(props);
    }

}

NodeWork.registerNodeType(logicAnd);