import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";

export default class Custom extends Node {
    static type = "custom/new";
    static drawBase = false;
    static onGrid = false;
    static movable = true;
    
    static funcToString(funcString) {
        funcString.substring(funcString.indexOf("{") + 1, funcString.lastIndexOf("}"));
    }

    static setup(node) {
        node.script = {};
        node.type = Custom.type

        node.initStr = "let map = window.map;\nlet me = this.script;\nme.cv = 0;";
        node.init = new Function('node', node.initStr);
        node.init.bind(node);
        node.init();

        node.runStr = "let map = window.map;\nlet me = this.script;\nme.cv++;";
        node.run = new Function('node', node.runStr);
        node.run.bind(node);

        node.drawStr = "let map = window.map;\nlet me = this.script;\nctx.fillStyle = 'green';\nctx.fillRect(0, 0, node.size[0], node.size[1]);\nctx.fillText(me.cv, 0, 0);"
        node.onDrawForeground = new Function('node', 'ctx', node.drawStr);
        node.onDrawForeground.bind(node);
    }
    
}

NodeWork.registerNodeType(Custom)