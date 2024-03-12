import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";
import { NodiEnums } from "../../enums.mjs";

class Inserter extends Node {
    static type = "basic/inserter";
    static rotatable = true;
    static singleton = true;
    static drawBase = false;

    static setup(node) {
        node.fromNodeID = null;
        node.toNodeID = null;
        node.direction = NodiEnums.RIGHT;
        let props = node.properties;
        Node.setProperty(props, "from");
        Node.setProperty(props, "to",);
        Node.setProperty(props, "value");
    }

    static run(node, nw) {
        let props = node.properties;
        let ret = [];
        for(let prop of Object.values(props)) {
            if (prop.inpValue !== null) {
                for (const valueInputs of Object.values(prop.inpValue)) {
                    if (valueInputs.update) {
                        prop.value = valueInputs.val;
                        valueInputs.update = false;
                    }
                }
            }
        }
        let fromNode = NodeWork.getNodeById(nw, node.fromNodeID);

        let incoming = fromNode?.properties[props.from.value];
        if (incoming.outValue != null && incoming.update == true) {
            props.value.value = incoming.outValue;
            props.value.update = true;
            incoming.update = false;
        }

        let toNode = NodeWork.getNodeById(nw, node.toNodeID);
        
        if (toNode && props.value.value !== null && props.value.update) {
            let toProps = toNode.properties[props.to.value];
            if (toProps) {
                toProps.inpValue[node.nodeID] = {val: props.value.value, update: true};
                props.value.value = null;
                //ret.push(node.toNode.nodeID);
            }
        }
        return ret;
    }

    static reconnect(inserter, nw, pos) {
        let props = inserter.properties;
        const dirVec = NodiEnums.dirToVec[inserter.direction];
        const nextFromNode = NodeWork.getNodeOnGrid(nw, pos[0] - dirVec.x, pos[1] - dirVec.y);
        const nextToNode = NodeWork.getNodeOnGrid(nw, pos[0] + dirVec.x, pos[1] + dirVec.y);

        // Disconnect
        let toNode = NodeWork.getNodeById(nw, inserter.toNodeID);
        if (inserter.toNodeID != nextToNode?.nodeID) {
            let target = toNode?.properties[props.to.value];
            if (target) delete target.inpValue[inserter.nodeID];
        }
        if (inserter.fromNodeID != nextFromNode?.nodeID) {
            props.from.value = null;
        }

        let fromNode = NodeWork.getNodeById(nw, inserter.fromNodeID);
        if (nextFromNode == null && fromNode) {
            props.value.inpValue = {};
        }

        // Connect
        if (nextFromNode != null && (fromNode == null  || fromNode != nextFromNode)) {
            props.from.value = NodeWork.getNodeType(nextFromNode.type).defaultOutput;
        }

        inserter.fromNodeID = nextFromNode?.nodeID;
        fromNode = NodeWork.getNodeById(nw, inserter.fromNodeID);
        if (inserter.fromNodeID == null) {
            props.value.value = undefined;
        } else {
            props.value.value = fromNode.properties[props.from.value].value;
        }
        
        if (nextToNode != null && (toNode == null || toNode != nextToNode)) {
            if (props.to.value == null) 
                props.to.value = NodeWork.getNodeType(nextToNode.type).defaultInput;
            else 
                nextToNode.properties[props.to.value].inpValue[inserter.nodeID] = {val: undefined, update: true};
        }
        inserter.toNodeID = nextToNode?.nodeID;
    }

    static onDrawForeground(node, ctx) {
        let good = node.fromNodeID != null && node.toNodeID != null;
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
