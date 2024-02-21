import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";
import { NodiEnums } from "../../enums.mjs";

class Inserter extends Node {
    static type = "basic/inserter";
    static rotatable = true;
    static singleton = true;
    static drawBase = false;

    static setup(node) {
        node.fromNode = null;
        node.toNode = null;
        node.direction = 0;
        let props = node.properties;
        Node.setProperty(props, "from");
        Node.setProperty(props, "to",);
        Node.setProperty(props, "value");
    }

    static run(node, nodework) {
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
        
        if (node.toNode && props.value.value !== null) {
            let toProps = node.toNode.properties[props.to.value];
            if (toProps) {
                toProps.inpValue[node.nodeID] = {val: props.value.value, update: true};
                props.value.value = null;
                //ret.push(node.toNode.nodeID);
            }
        }
        let out = node.fromNode?.properties[props.from.value]?.outValue;
        if ( props.from.value && out != null) {
            props.value.value = out;
            nodework.cleanUpOutputs.push([node.fromNode.nodeID, node.properties.from.value]);
        }
        return ret;
    }

    static reconnect(inserter, nw, pos) {
        let props = inserter.properties;
        const dirVec = NodiEnums.dirToVec[inserter.direction];
        const nextFromNode = nw.getNodeOnGrid(pos[0] - dirVec.x, pos[1] - dirVec.y);
        const nextToNode = nw.getNodeOnGrid(pos[0] + dirVec.x, pos[1] + dirVec.y);

        // Disconnect
        if (inserter.toNode != nextToNode) {
            let target = inserter.toNode?.properties[props.to.value];
            if (target) delete target.inpValue[inserter.nodeID];
        }
        if (inserter.fromNode != nextFromNode) {
            props.from.value = null;
        }

        if (nextFromNode == null && inserter.fromNode) {
            props.value.inpValue = {};
        }

        // Connect
        if (nextFromNode != null && (inserter.fromNode == null  || inserter.fromNode != nextFromNode)) {
            props.from.value = NodeWork.getNodeType(nextFromNode.type).defaultOutput;
        }
        inserter.fromNode = nextFromNode;
        if (inserter.fromNode == null) {
            props.value.value = undefined;
        } else {
            props.value.value = inserter.fromNode.properties[props.from.value].value;
        }
        
        if (nextToNode != null && (inserter.toNode == null || inserter.toNode != nextToNode)) {
            if (props.to.value == null) 
                props.to.value = NodeWork.getNodeType(nextToNode.type).defaultInput;
            else 
                nextToNode.properties[props.to.value].inpValue[inserter.nodeID] = {val: undefined, update: true};
        }
        inserter.toNode = nextToNode;
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
