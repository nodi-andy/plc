import NodeWork from "../../nodework.mjs";
import NotCore from "./not_core.mjs"

class logicNot extends NotCore{
    constructor() {
        super();
        this.properties = {};
        logicNot.setup(this.properties);
        this.type = logicNot.type
        this.title = logicNot.title;
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

NodeWork.registerNodeType(logicNot);