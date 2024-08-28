import NodeWork from "../../nodework.mjs";
import { globalApp } from "../../enums.mjs";

export default class Rocket extends NodeWork {
    static type = "basic/rocket";
    static drawBase = false;
    static defaultInput = "value";
    static defaultOutput = "value";
    
    constructor() {
        super();
        Rocket.setup(this.properties);
    }

    static setup(node) {
        let props = node.properties;
        NodeWork.setProperty(props, "hp", {value : 200});
        NodeWork.setProperty(props, "mines", {value : 0});
        NodeWork.setProperty(props, "rockets", {value : 0});
    }

    static drawHexagon(ctx, x, y, r) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            let angle = (Math.PI / 3) * i; // 60 degrees in radians
            ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
        }
        ctx.closePath();
        ctx.strokeStyle = "black"; // Set the hexagon color to red
        ctx.fillStyle = "red"; // Set the hexagon color to red
        ctx.fill();
        ctx.stroke();
    }

    static onDrawForeground(node, ctx) {
        let map = window.map;
        let me = node.properties;
        me.nnids?.forEach((nid) => {
                let n = globalApp.data.nodeContainer[nid];
                ctx.beginPath();
                ctx.moveTo(32, 32);
                ctx.lineTo((n.pos[0]-node.pos[0]) * 64 + 32, (n.pos[1] - node.pos[1])* 64 + 32);
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        )

        ctx.lineWidth = 4;

        Rocket.drawHexagon(ctx, 32, 32, 16);

        ctx.strokeStyle = "";
        ctx.fillStyle = "black";
        ctx.fillText(me.rockets.value, 32 ,32);
    }

    static run(node) {
        let map = (typeof window !== "undefined" && window.map) || NodeWork;
        let me = node.properties;
        let ret = [];
        let room = globalApp.data[node.roomId];

        for (const keyInput of Object.keys(me.hp.inpValue)) {
            let valueInput = me.hp.inpValue[keyInput];
            if (valueInput.update == 1) {
                me.hp.value += valueInput.val;
                valueInput.update = 0;
            }
            delete me.hp.inpValue[keyInput];
            me.hp.outValue = {val: me.hp.value, update: 1};
            ret.push("hp");
        }

        if (room.time.tick % 5 != 0) return;

        me.nnids = map.findNodes(node, 5, (n) => n.type == "basic/miner");
        me.cv = me.nnids.length;
        me.enemies = map.findNodes(node, 5,(n) => n.owner !== node.owner);

        me.nnids?.forEach((nid) => {
            let n = room.nodeContainer[nid];
            if (!n) return;
            if (n.type == "basic/miner" && n?.properties?.mines?.value > 0 && me.rockets.value < 5) {
                NodeWork.updateInputs(n, {nodeID :nid, properties:{dec: {inpValue:  1}}});
                me.mines.value ++;
                ret.push("rockets");
            }
          }
        )

        if (me.mines.value >= 5 && me.rockets.value < 5) {
            me.mines.value -= 5;
            me.rockets.value ++;
        }

        if(me.rockets.value > 0 && me.enemies.length > 0) {
            let enemy = room.nodeContainer[me.enemies[0]];
            NodeWork.updateInputs(enemy, {nodeID :enemy.nodeID, properties:{hp: {inpValue:  -20}}});
            me.rockets.value--;
        }

        if(me.hp.value <= 0) map.removeNode(room.nodeContainer[node.parent], {nodeID: node.nodeID, parentID: node.parent});

        return ret;
    }

}

NodeWork.registerNodeType(Rocket);