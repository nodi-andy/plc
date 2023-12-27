import NodeWork from "../../nodework.mjs";
import { Node } from "../../node.mjs";
import OrCore from "./or_core.mjs"

class logicOr extends OrCore{
    constructor() {
        super();
        this.properties = {};
        OrCore.setup(this.properties);
        this.widget = new Node();
        this.widget.setSize([64, 128]);
        this.type = OrCore.type
        this.title = OrCore.title;
    }

    onExecute(update) {
        if (update) {
            let ret = true;
            for (let input of Object.values(this.properties)) {
                if (input.input == true && input.inpValue !== null) {
                    input.value = input.inpValue;
                    input.inpValue = null;
                }
            }
            for (let input of Object.values(this.properties)) {
                if (input.input == true && !input.value) {
                    ret = false;
                    break;
                }
            }
            ret = ret ? 1 : 0;
            this.properties.value.outValue = ret;
            this.update = false;
        }
    }

}

NodeWork.registerNodeType(logicOr);