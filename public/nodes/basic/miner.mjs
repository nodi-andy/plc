import NodeWork from "../../nodework.mjs";
import { globalApp } from "./../../enums.mjs";

export default class Miner extends NodeWork {
    static type = "basic/miner";
    static drawBase = false;
    static defaultInput = "value";
    static defaultOutput = "value";
    
    constructor() {
        super();
        Miner.setup(this.properties);
    }

    static setup(node) {
        let props = node.properties;
        NodeWork.setProperty(props, "hp", {value : 100});
        NodeWork.setProperty(props, "dec");
        NodeWork.setProperty(props, "mines", {value : 0});
    }

    static onDrawForeground(node, ctx) {
        let map = window.map;
        let me = node.properties;
        me.nn?.forEach((n) => {
                ctx.beginPath();
                ctx.moveTo(32, 32);
                ctx.lineTo((n.pos[0]-node.pos[0]) * 64 + 32, (n.pos[1] - node.pos[1])* 64 + 32);
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        )

        ctx.beginPath();
        ctx.arc(32, 32, 16, 0, 2 * Math.PI);
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "black";
        ctx.stroke();

        ctx.strokeStyle = "";
        ctx.fillStyle = "black";
        ctx.fillText(me.mines.value, 26 ,36);
    }

    static run(node) {
        let room = globalApp.data[node.roomId];
        if (room.time.tick % 20 != 0) return;

        let map = (typeof window !== "undefined" && window.map) || NodeWork;
        let me = node.properties;
        let ret = [];

        for (const valueInputs of Object.values(me.dec.inpValue)) {
            if (valueInputs.update == 1) {
                me.mines.value -= valueInputs.val;
                valueInputs.update = 0;
            }
            me.mines.outValue = {val: me.mines.value, update: 1};
            ret.push("mines");
        }

        for (const valueInputs of Object.values(me.hp.inpValue)) {
            if (valueInputs.update == 1) {
                me.hp.value = valueInputs.val;
                valueInputs.update = 0;
            }
            me.hp.outValue = {val: me.hp.value, update: 1};
            ret.push("hp");
        }

        me.nnids = map.findNodes(node, 5 ,  (n) => n.type == "basic/number");
        me.cv = me.nnids.length;
        if (!me.mines) me.mines = 0;

        let container = globalApp.data[node.roomId]?.nodeContainer;
        if (!container) container = globalApp.data.nodeContainer;
        me.nnids?.forEach((nid) => {
            let n = container[nid];
            if (n?.properties?.value?.value > 0 && me.mines.value < 100) {
                NodeWork.updateInputs(n, {nodeID :nid, properties:{dec: {inpValue:  1}}});
                me.mines.value ++;
                ret.push("mines");
            }
          }
        )

        if(me.hp.value <= 0) map.removeNode(container[node.parent], {nodeID: node.nodeID, parentID: node.parent});
        return ret;
    }

}

NodeWork.registerNodeType(Miner);