import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class Custom extends Node {
    static type = "basic/custom";
    static drawBase = false;
    static onGrid = false;

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "value");
        node.type = Custom.type

        node.run = Custom.run.bind(node);
        props.cv = 0;
        const runFunctionString = Custom.run.toString();
        node.runStr = runFunctionString.substring(runFunctionString.indexOf("{") + 1, runFunctionString.lastIndexOf("}"));
        node.run = new Function('node', node.runStr);

        const drawFunctionString = Custom.onDrawForeground.toString();
        node.drawStr = drawFunctionString.substring(drawFunctionString.indexOf("{") + 1, drawFunctionString.lastIndexOf("}"));
        node.onDrawForeground = new Function('node', 'ctx', node.drawStr);
    } 

    static run(node) {
        let props = node.properties;
        props.cv++;
    }

    static onDrawForeground(node, ctx) {
        let props = node.properties;
        ctx.fillStyle = 'green';
        ctx.fillRect(0, 0, node.size[0], node.size[1]);
        ctx.fillText(props.cv, 0, 0);
    }
}

NodeWork.registerNodeType(Custom)