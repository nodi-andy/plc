import NodeWork from "../../nodework.mjs";

export default class LogicNot extends NodeWork {
    static type = "logic/not";
    static title = "NOT";
    static defaultInput = "value";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        NodeWork.setProperty(props, "value");
        this.type = LogicNot.type
    }

    static run(node) {
        let props = node.properties;
        let ret = [];
        let res = 1;
        let update = false;

        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (valueInputs.update) update = true;
        }

        if (!update) return ret;

        props.value.value = undefined;
        for (const valueInputs of Object.values(props.value.inpValue)) {
            if (props.value.value == undefined) props.value.value = valueInputs.val;
            if (valueInputs.update == 0) continue;
            valueInputs.update = 0;
            res = valueInputs.val ? 0 : 1;
        }
        ret.push("value");
        props.value.outValue = {val: res, update: 1};
        return ret;
    }

}

NodeWork.registerNodeType(LogicNot)