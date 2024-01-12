import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";
import { NodiEnums } from "../../enums.mjs";

class Inserter extends Node {
    static type = "control/inserter";
    static desc = "Inserter";
    static rotatable = true;
    static drawBase = false;

    static setup(node) {
        node.fromNode = null;
        node.toNode = null;
        node.direction = 0;
        let props = node.properties;
        Node.setProperty(props, "from", {value: "value"});
        Node.setProperty(props, "to", {value: "value"});
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
            node.toNode.properties[props.to.value].inpValue = props.value.value;
            props.value.value = null;
            ret.push(node.toNode.nodeID);
        }
        
        if (node.fromNode && node.fromNode.properties[props.from.value].outValue != null) {
            props.value.value = node.fromNode.properties[props.from.value].outValue;
        }
        return ret;
    }

    static replace(node, nw) {
        let gridPos = NodiEnums.toGrid(node.pos);
        let dirVec = NodiEnums.dirToVec[node.direction];
        node.fromNode = nw.getNodeOnGrid(gridPos[0] - dirVec.x, gridPos[1] - dirVec.y);
        node.toNode = nw.getNodeOnGrid(gridPos[0] + dirVec.x, gridPos[1] + + dirVec.y);
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
    }
}

NodeWork.registerNodeType(Inserter);
