import { Node } from "../../node.mjs";
import NodeWork from "../../nodework.mjs";
import ToggleCore from "./toggle_server.mjs";

export default class WidgetToggle extends ToggleCore{
    static type = "widget/toggle";
    static desc = "Toggles between true or false";

    constructor() {
        super();
        this.properties = {}
        this.type = WidgetToggle.type;
        ToggleCore.setup(this.properties);
    }

    onDrawForeground(ctx) {
        var size = this.size[1] * 0.5;
        var margin = 0.25;
        var y = this.size[1] * 0.25;
        var w = 0;
        if (this.title?.trim().length) {
            ctx.font = this.properties.font || (size * 0.8).toFixed(0) + "px Arial";
            w = ctx.measureText(this.title).width;
        }
        var x = (this.size[0] - (w + size)) * 0.5;

        ctx.fillStyle = "#AAA";
        ctx.fillRect(x, y, size, size);

        ctx.fillStyle = this.properties.state.value ? this.properties.color.value : "#000";
        ctx.fillRect(x + size * margin, y + size * margin, size * (1 - margin * 2), size * (1 - margin * 2));


        if (this.properties.label.length) {
            ctx.textAlign = "center";
            ctx.fillStyle = "#AAA";
            ctx.fillText(this.properties.label, this.size[0] * 0.5, 10);
        }
    }

    updateProp(name, val) {
        this.properties[name].value = val;
        window.nodes.update(this.id, this.properties);
    }

    onMouseDown(e, local_pos) {
        if (local_pos[0] > this.size[0] * 0.25 && local_pos[1] > this.size[0] * 0.25 && local_pos[0] < this.size[0] * 0.75 && local_pos[1] < this.size[1] * 0.75) {
            let nextState = this.properties.state.value ? 0 : 1;
            window.nodes.update(this.id, {"state": {"inpValue" : nextState}});
            return true;
        }
    }
}

NodeWork.registerNodeType(WidgetToggle); 