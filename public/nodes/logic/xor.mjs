import NodeWork from "../../nodework.mjs";

export default class LogicXor extends NodeWork {
    static type = "logic/xor";
    static title = "XOR";
    static defaultInput = "value";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        NodeWork.setProperty(props, "value");
        this.type = LogicXor.type
    }

    static run(node) {
        let props = node.properties;
        let ret = [];
        let update = false;
    
        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (valueInputs.update) update = true;
        }
    
        if (!update) return ret;
    
        let xorResult = 0;
        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (valueInputs.val != null) {
                xorResult ^= valueInputs.val;
            }
        }
    
        props.value.outValue = { val: xorResult, update: 1 };
        return ret;
    }
}

NodeWork.registerNodeType(LogicXor)