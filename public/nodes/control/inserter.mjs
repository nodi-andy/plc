import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";
import { NodiEnums } from "../../enums.mjs";

class Inserter extends Node {
    static type = "control/inserter";
    static desc = "Inserter";
    static drawBase = false;

    static setup(node) {
        node.fromNode = null;
        node.toNode = null;
        node.direction = 1;
        let props = node.properties;
        Node.setProperty(props, "from", {value: "value"});
        Node.setProperty(props, "to", {value: "value"});
        Node.setProperty(props, "carry");
    }

    static run(node) {
        let props = node.properties;
        let ret = [];
        if (node.toNode && props.carry.value) {
            node.toNode.properties[props.to.value].input = props.carry.value;
            ret.push(node.toNode.nodeID);
        }
        
        if (node.fromNode && node.fromNode.properties[props.from.value].output) {
            props.carry.value = node.fromNode.properties[props.from.value].output;
        }
        return ret;
    }

    static replace(node, nw) {
        let gridPos = NodiEnums.toGrid(node.pos);
        node.fromNode = nw.getNodeOnGrid(gridPos[0] - 1, gridPos[1]);
        node.toNode = nw.getNodeOnGrid(gridPos[0] + 1, gridPos[1]);
    }

    static onDrawForeground(node, ctx) {
        let props = node.properties;
        let good = node.fromNode && node.toNode;
        ctx.fillStyle = good ? "green" : "red";
        ctx.beginPath();
        ctx.moveTo(NodiEnums.CANVAS_GRID_SIZE * 0.2, 16);
        ctx.lineTo(NodiEnums.CANVAS_GRID_SIZE * 0.8, 32);
        ctx.lineTo(NodiEnums.CANVAS_GRID_SIZE * 0.2, 48);
        ctx.fill();
    }
}

NodeWork.registerNodeType(Inserter);
