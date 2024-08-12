import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";
import { germanyProvinces } from './germany.js'

export default class Country extends Node {
    static type = "basic/country";
    static drawBase = false;
    static defaultInput = "value";
    static defaultOutput = "value";
    
    constructor() {
        super();
        Country.setup(this.properties);
    }

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "taxRatio", {value: 0.0003, autoInput: true});
        Node.setProperty(props, "taxReady", {value: 0, autoInput: true});
        Node.setProperty(props, "military", {value: 0, autoInput: true});
        Node.setProperty(props, "militaryOrder", {value: 0, autoInput: true});

            // startup
        Object.keys(germanyProvinces).forEach(key => {
            let province = germanyProvinces[key];
            let newNode = window.NodeWork.addNode(node, {type: "basic/province", pos:province.center});
            newNode.translate = [64 * -province.center[0], 64 * -province.center[1]];
            newNode.path = province.path;
            newNode.color = province.color;
            newNode.GDP = province.GDP;
            newNode.MP = province.MP;
            newNode.name = province.name;
            newNode.Population = province.Population;+
            Object.keys(province.properties ?? {}).forEach(key => {
                newNode.properties[key].value = province.properties[key];
            })
            }
        )
    }

    static onDrawForeground(node, ctx) {
        /* // Save the current context state
        ctx.save();

        // Translate the context to the center of the green dot
        ctx.translate(node.translate[0], node.translate[1]);
        let p = new Path2D(node.path)
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000000'
        ctx.fillStyle = node.color;
        ctx.stroke(p)
        ctx.fill(p)
        ctx.restore();

        var pos = Math.min(node.size[0] * 0.5, node.size[1] * 0.5);
        ctx.beginPath();
        ctx.arc(pos, pos, node.size[0] * 0.1, 0, 2 * Math.PI, false);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        ctx.stroke();*/
    }

    static run(node) {
        for(let province of window.currentNodeWork.nodes) {
            if (province.properties["taxReady"]) {
                window.currentNodeWork.properties["taxReady"].value += province.properties["taxReady"].value
                province.properties["taxReady"].value = 0;
            }
          }
        return;
    }

}

NodeWork.registerNodeType(Country);