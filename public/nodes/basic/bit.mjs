import NodeWork from "../../nodework.mjs";

export default class WidgetBit extends NodeWork {
    static type = "basic/bit";
    static drawBase = false;
    static defaultInput = "value";
    static defaultOutput = "value";
    static primitive = true;

    static setup(node) {
        let props = node.properties;
        NodeWork.setProperty(props, "value");
        NodeWork.setProperty(props, "set");
        NodeWork.setProperty(props, "clear");
        NodeWork.setProperty(props, "toggle");
        NodeWork.setProperty(props, "label");
        NodeWork.setProperty(props, "port", {value: 2});
        NodeWork.setProperty(props, "color", {value: "FF3333"});
    }

    static run(node) {
        let props = node.properties;
        let ret = [];
        Object.values(props.value.inpValue).forEach((valueInputs) => {
            if (valueInputs.update == 1) {
                props.value.value = valueInputs.val;
                props.value.outValue = {val: props.value.value, update: 1};
                valueInputs.update = false;
                ret.push("value");
            }
        });

        Object.values(props.toggle.inpValue).forEach((toggleInputs) => {
            if (toggleInputs.update == 1) {
                props.value.value = props.value.value == 1 ? 0 : 1;
                props.value.outValue = {val: props.value.value, update: 1};

                toggleInputs.update = false;
                ret.push("value");
            }
        });

        if (props.set?.inpValue == 1) {
            props.value.value = 1;
            props.set.inpValue = null;
            props.value.outValue = {val: props.value.value, update: 1};
        }

        if (props.clear?.inpValue == 1) {
            props.value.value = 0;
            props.clear.inpValue = null;
            props.value.outValue = {val: props.value.value, update: 1};
        }

        for (const prop of Object.values(node.properties)) {
            if (prop.outValue?.update > 1) prop.outValue.update = 0;
        }
        return ret;
    }

    static onDrawForeground(node, ctx) {
        var size = Math.min(node.size[0] * 0.5, node.size[1] * 0.5);
        ctx.beginPath();
        ctx.arc(size, size, size * 0.5, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.properties.value.value == true ? "#" + node.properties.color.value : "#222";
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        if (node.properties.label.value) {
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "#AAA";
            ctx.fillText(node.properties.label.value, node.size[0] * 0.5, 10);
        }
    }

    static onMouseDown(node, e, local_pos) {
        if (local_pos[0] > node.size[0] * 0.25 &&
            local_pos[1] >  node.size[0] * 0.25 &&
            local_pos[0] < node.size[0] * 0.75 &&
            local_pos[1] < node.size[1] * 0.75) {
            window.updateInputs(node.nodeID,  {nodeID: node.nodeID, properties: { toggle: { inpValue: 1 } }});

            node.update = true;

            return true;
        }
        return false;
    }
}

NodeWork.registerNodeType(WidgetBit);