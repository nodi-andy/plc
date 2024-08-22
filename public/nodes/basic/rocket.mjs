import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";
import { globalApp } from "../../enums.mjs";

export default class Rocket extends Node {
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
        Node.setProperty(props, "hp", {value : 0});
        Node.setProperty(props, "mines", {value : 0});
        Node.setProperty(props, "rockets", {value : 0});
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
        
        if (globalApp.data.time.tick % 5 != 0) return;

        me.nnids = map.findNodes(node.parent, node, 5, (n) => n.type == "basic/miner");
        me.cv = me.nnids.length;
        me.enemies = map.findNodes(node.parent, node, 5,(n) => n.owner !== node.owner);

        me.nnids?.forEach((nid) => {
            let n = globalApp.data.nodeContainer[nid];
            if (n.type == "basic/miner" && n?.properties?.mines?.value > 0 && me.rockets.value < 5) {
                Node.updateInputs(n, "dec", 1);
                me.rockets.value ++;
                ret.push("rockets");
            }
          }
        )

        if (me.mines.value >= 5 && me.rockets.value < 5) {
            me.mines.value -= 5;
            me.rockets.value ++;
        }

        if(me.rockets.value > 0 && me.enemies.length > 0) {
            let enemy = globalApp.data.nodeContainer[me.enemies[0]];
            Node.updateInputs(enemy, "hpdec", 20);
            me.rockets.value--;
        }
        return ret;
    }

}

NodeWork.registerNodeType(Rocket);