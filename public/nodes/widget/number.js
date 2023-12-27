import { Node } from "../../node.mjs";
import NodeWork from "../../nodework.mjs";
import NumberCore from "./number_server.mjs";

export default class WidgetNumber extends NumberCore {
    static title = "Number";
    static desc = "Widget to select number value";
    static title_mode = NodeWork.NO_TITLE;
    static pixels_threshold = 10;
    static markers_color = "#666";

    constructor() {
        super();
        this.properties = {}
        NumberCore.setup(this.properties);
        this.type = NumberCore.type;

        this.old_y = -1;
        this._remainder = 0;
        this._precision = 0;
        this.mouse_captured = false;
        this.title = " ";
    }

    onDrawForeground(ctx) {
        var x = this.size[0] * 0.5;
        var h = this.size[1];


        ctx.textAlign = "center";
        ctx.font = (h * 0.6).toFixed(1) + "px Arial";
        ctx.fillStyle = "#EEE";
        ctx.fillText(this.properties.value.value, x, h * 0.65);
    }
  
    updateProp(name, val) {
        this.properties[name].inpValue = val;
        window.nodes.update(this.id, this.properties);
    }

    setValue(val) {
        this.update = true;
        this.updateProp("value", val);
    }
}

NodeWork.registerNodeType(WidgetNumber);