import NodeWork from "../../nodework.mjs";

export default class MathAdd extends NodeWork {
    static type = "math/add";
    static title = "ADD/SUB";
    static defaultInput = "add";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        NodeWork.setProperty(props, "add");
        NodeWork.setProperty(props, "sub");
        NodeWork.setProperty(props, "value");
    }

    static run(node) {
        let props = node.properties;
        let ret = [];

        let sum = 0;
        for (const valueInputs of Object.values(props.add.inpValue)) {
            if (typeof valueInputs.val === 'number') {
                sum += valueInputs.val;
            }
        }

        for (const valueInputs of Object.values(props.sub.inpValue)) {
            if (typeof valueInputs.val === 'number') {
                sum -= valueInputs.val;
            }
        }

        ret.push("value");
        props.value.outValue = {val : sum, update : true};

        return ret;
    }
}

NodeWork.registerNodeType(MathAdd)