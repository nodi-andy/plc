import NodeWork from "../../nodework.mjs";
import { globalApp } from "../../enums.mjs";

export default class Custom extends NodeWork {
    static type = "basic/custom";
    static drawBase = false;
    static onGrid = false;
    static movable = true;
    static enabled = false;
    
    static funcToString(funcString) {
        funcString.substring(funcString.indexOf("{") + 1, funcString.lastIndexOf("}"));
    }

    static setup(node) {
        node.type = Custom.type
        node.script = {};

        node.initStr = "let map = globalApp;\nlet me = this.script;\nme.cv = 0;";
        node.init = new Function('globalApp', node.initStr);
        node.init.bind(node);
        node.init(globalApp);

        Custom.updateRunStr(node,  "let map = globalApp;\nlet me = this.script;\nme.cv++;");
        
        Custom.updateDrawStr(node, "let map = window.currentNodeWork;\nlet me = this.script;\nctx.fillStyle = 'green';\nctx.fillRect(0, 0, node.size[0], node.size[1]);\nctx.fillText(me.cv, 0, 0);");
    }

    static updateDrawStr(node, code) {
        node.drawStr = code;
        node.onDrawForeground = new Function('node', 'ctx', node.drawStr);
        node.onDrawForeground.bind(node);
    }

    static updateRunStr(node, code) {
        node.runStr = code;
        node.run = new Function('node', 'globalApp', code);
        node.run.bind(node);

    }
    
}

NodeWork.registerNodeType(Custom)