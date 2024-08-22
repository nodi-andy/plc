import NodeWork from "../../nodework.mjs";
import { NodiEnums } from "../../enums.mjs";

class Connector extends NodeWork {
    static type = "basic/connector";
    static rotatable = true;
    static singleton = true;
    static drawBase = false;

    static setup(node) {
        node.fromNodeID = null;
        node.toNodeID = null;
        node.direction = NodiEnums.RIGHT;
        let props = node.properties;
        NodeWork.setProperty(props, "from");
        NodeWork.setProperty(props, "to",);
        NodeWork.setProperty(props, "value");
    }

    static run(node, nw) {
        let props = node.properties;
        let ret = [];
        let fromNode = NodeWork.getNodeById(nw, node.fromNodeID);
        let toNode = NodeWork.getNodeById(nw, node.toNodeID);
        for(let prop of Object.values(props)) {
            if (prop.inpValue !== null) {
                for (const valueInputs of Object.values(prop.inpValue)) {
                    if (valueInputs.update == 1) {
                        if (toNode) {
                            delete toNode.properties[props.to.value].inpValue[node.nodeID];
                        }
                        prop.value = valueInputs.val;
                        valueInputs.update = 0;
                    }
                }
            }
        }

        let incoming = fromNode?.properties[props.from.value];
        if (incoming?.outValue?.update > 0) {
            props.value.value = incoming.outValue.val;
            props.value.update = true;
            incoming.outValue.update++;
        }

        
        if (toNode && props.value.value !== null && props.value.update) {
            let toProps = toNode.properties[props.to.value];
            if (toProps) {
                toProps.inpValue[node.nodeID] = {val: props.value.value, update: 1};
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
            if (props.from?.value) props.value.value = fromNode.properties[props.from.value].value;
        }
        
        if (nextToNode != null && (toNode == null || toNode != nextToNode)) {
            if (nextToNode.properties[props.to.value] == null) props.to.value = null;
            if (props.to.value == null) 
                props.to.value = NodeWork.getNodeType(nextToNode.type).defaultInput;
            else {
                nextToNode.properties[props.to.value].inpValue[inserter.nodeID] = {val: undefined, update: 1};
            }
        }
        inserter.toNodeID = nextToNode?.nodeID;
    }

    static onDrawForeground(node, ctx) {
        let props = node.properties;
        let good = node.fromNodeID != null && node.toNodeID != null;
        ctx.save();
        ctx.strokeStyle = "black";
        ctx.fillStyle = good ? "darkgreen" : "gray";
        
        ctx.translate(NodiEnums.CANVAS_GRID_SIZE * 0.5, NodiEnums.CANVAS_GRID_SIZE * 0.5);
        ctx.rotate(NodiEnums.dirToRad[node.direction]);
        //ctx.translate(-NodiEnums.CANVAS_GRID_SIZE * 0.5, -NodiEnums.CANVAS_GRID_SIZE * 0.5);
        ctx.beginPath();
        ctx.moveTo(NodiEnums.CANVAS_GRID_SIZE * -0.2, NodiEnums.CANVAS_GRID_SIZE * -0.2);
        ctx.lineTo(NodiEnums.CANVAS_GRID_SIZE * 0.2, 0);
        ctx.lineTo(NodiEnums.CANVAS_GRID_SIZE * -0.2, NodiEnums.CANVAS_GRID_SIZE * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        

        ctx.restore();

        ctx.fillStyle = "black";
        if (node.direction == NodiEnums.RIGHT) {
            ctx.textBaseline = 'top';
            if (props.from.value != "value" && props.from.value != null) ctx.fillText(props.from.value, 0, 0);
            ctx.textAlign = 'right';
            if (props.to.value != "value" && props.from.value != null) ctx.fillText(props.to.value, NodiEnums.CANVAS_GRID_SIZE, 0);
        }
        if (node.direction == NodiEnums.LEFT) {
            ctx.textBaseline = 'top';
            ctx.textAlign = 'right';
            if (props.from.value != "value" && props.from.value != null) ctx.fillText(props.from.value, NodiEnums.CANVAS_GRID_SIZE, 0);
            ctx.textAlign = 'left';
            if (props.to.value != "value" && props.from.value != null) ctx.fillText(props.to.value, 0, 0);
        }
        if (node.direction == NodiEnums.DOWN) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            if (props.to.value != "value" && props.from.value != null) ctx.fillText(props.to.value, NodiEnums.CANVAS_GRID_SIZE * 0.5, 0);
            ctx.textBaseline = 'bottom';
            if (props.from.value != "value" && props.from.value != null) ctx.fillText(props.from.value, NodiEnums.CANVAS_GRID_SIZE * 0.5, NodiEnums.CANVAS_GRID_SIZE);
        }
        if (node.direction == NodiEnums.UP) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            if (props.from.value != "value" && props.from.value != null) ctx.fillText(props.from.value, NodiEnums.CANVAS_GRID_SIZE * 0.5, 0);
            ctx.textBaseline = 'bottom';
            if (props.to.value != "value" && props.from.value != null) ctx.fillText(props.to.value, NodiEnums.CANVAS_GRID_SIZE * 0.5, NodiEnums.CANVAS_GRID_SIZE);
        }

        //ctx.drawImage(Inserter.platform, 0, 0, NodiEnums.CANVAS_GRID_SIZE, NodiEnums.CANVAS_GRID_SIZE, 0, 0, NodiEnums.CANVAS_GRID_SIZE, NodiEnums.CANVAS_GRID_SIZE)

    }
}
/*
if (typeof window !== 'undefined') {
    Inserter.platform = new Image(64, 64)
    Inserter.platform.src = 'nodes/basic/inserter_platform.png'
}*/

NodeWork.registerNodeType(Connector);
