import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";
import { NodiEnums } from "../../enums.mjs";

class Inserter extends Node {
    static type = "basic/inserter";
    static rotatable = true;
    static drawBase = false;

    static setup(node) {
        node.fromNode = null;
        node.toNode = null;
        node.direction = 0;
        let props = node.properties;
        Node.setProperty(props, "from", {autoInput: true});
        Node.setProperty(props, "to", {autoInput: true});
        Node.setProperty(props, "value", {autoInput: true});
    }

    static run(node) {
        let props = node.properties;
        let ret = [];
        for(let propKey in props) {
            let prop = props[propKey];
            if (prop.autoInput && prop.inpValue != null) {
                prop.value = prop.inpValue;
                prop.inpValue = null;
                ret = []; //TBD
            }
        }
        
        if (node.toNode && props.value.value != null) {
            let toProps = node.toNode.properties[props.to.value];
            if (toProps) {
                if (toProps.inpValue == null) toProps.inpValue = {};
                toProps.inpValue[node.nodeID] = props.value.value;
                props.value.value = null;
                ret.push(node.toNode.nodeID);
            }
        }
        
        if (node.fromNode?.properties[props.from.value]?.outValue != null) {
            props.value.value = node.fromNode.properties[props.from.value].outValue;
            node.fromNode.properties[props.from.value].outValue = null;
        }
        return ret;
    }

    static reconnect(node, nw, pos) {
        let dirVec = NodiEnums.dirToVec[node.direction];
        node.fromNode = nw.getNodeOnGrid(pos[0] - dirVec.x, pos[1] - dirVec.y);
        node.toNode = nw.getNodeOnGrid(pos[0] + dirVec.x, pos[1] + dirVec.y);
        if (node.fromNode) {
            node.properties.from.value = NodeWork.getNodeType(node.fromNode.type).defaultOutput;
        }
        if (node.toNode) {
            node.properties.to.value = NodeWork.getNodeType(node.toNode.type).defaultInput;
        }
    }

    static onDrawForeground(node, ctx) {
        let good = node.fromNode && node.toNode;
        ctx.fillStyle = good ? "green" : "red";

        ctx.translate(NodiEnums.CANVAS_GRID_SIZE * 0.5, NodiEnums.CANVAS_GRID_SIZE * 0.5);
        ctx.rotate(NodiEnums.dirToRad[node.direction]);
        //ctx.translate(-NodiEnums.CANVAS_GRID_SIZE * 0.5, -NodiEnums.CANVAS_GRID_SIZE * 0.5);
        ctx.beginPath();
        ctx.moveTo(NodiEnums.CANVAS_GRID_SIZE * -0.2, -8);
        ctx.lineTo(NodiEnums.CANVAS_GRID_SIZE * 0.3, 0);
        ctx.lineTo(NodiEnums.CANVAS_GRID_SIZE * -0.2, 8);
        ctx.fill();

        //ctx.drawImage(Inserter.platform, 0, 0, NodiEnums.CANVAS_GRID_SIZE, NodiEnums.CANVAS_GRID_SIZE, 0, 0, NodiEnums.CANVAS_GRID_SIZE, NodiEnums.CANVAS_GRID_SIZE)

    }
}
/*
if (typeof window !== 'undefined') {
    Inserter.platform = new Image(64, 64)
    Inserter.platform.src = 'nodes/basic/inserter_platform.png'
}*/

NodeWork.registerNodeType(Inserter);
