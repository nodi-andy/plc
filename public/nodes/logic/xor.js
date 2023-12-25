import NodeWork from "../../nodework.mjs";
import { LGraphNode } from "../../node.mjs";
import XOrCore from "./xor_core.mjs"

class logicXOr extends XOrCore{
    constructor() {
        super();
        this.properties = {};
        XOrCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.setSize([64, 128]);
        this.widgets = [this.widget];
        this.type = XOrCore.type
        this.title = XOrCore.title;
    }

    onExecute(update) {
        if (update) {
            let ret = true;
            let firstState = null;
            for (let input of Object.values(this.properties)) {
                if (input.input == true && input.inpValue !== null) {
                    input.value = input.inpValue;
                    input.inpValue = null;
                }
            }
            for (let input of Object.values(this.properties)) {
                if (firstState == null) 
                { 
                    firstState = input.input;
                } else {
                    if (input.input == true &&  firstState != input.value) {
                        ret = false;
                        break;
                    }
                }
                
            }
            ret = ret ? 0 : 1;
            this.properties.value.outValue = ret;
            this.update = false;
        }
    }

}

NodeWork.registerNodeType(logicXOr.type, logicXOr);