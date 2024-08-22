import NodeWork from "../../nodework.mjs";

export default class MathMult extends NodeWork {
    static type = "math/mult";
    static title = "X";
    static defaultInput = "value";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        NodeWork.setProperty(props, "mult");
        NodeWork.setProperty(props, "div");
        NodeWork.setProperty(props, "value");
    }

    static run(node) {
        let props = node.properties;
        let ret = [];

        let valueUpdate = false;

        Object.values(props.mult.inpValue).forEach((valInputs) => {
            if (valInputs.update == 1) {
                valueUpdate = true;
            }
        });
        Object.values(props.div.inpValue).forEach((valInputs) => {
            if (valInputs.update == 1) {
                valueUpdate = true;
            }
        });

        if (!valueUpdate) return ret;

        let sum = 1;
        for (const valueInputs of Object.values(props.mult.inpValue)) {
            if (typeof valueInputs.val === 'number') {
                sum *= valueInputs.val;
            }
        }

        for (const valueInputs of Object.values(props.div.inpValue)) {
            if (typeof valueInputs.val === 'number' && valueInputs.val != 0) {
                sum /= valueInputs.val;
            }
        }

        ret.push("value");
        props.value.outValue = {val : sum, update : true};

        return ret;
    }

}

NodeWork.registerNodeType(MathMult)