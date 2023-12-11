import { LiteGraph } from "../../litegraph.js";
import LGraphNode from "../../node.js";
import ButtonCore from "./button_server.mjs"

export default class WidgetButton extends ButtonCore {
    static margin = 12;

    constructor() {
        super();
        this.properties = {}
        ButtonCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widgets = [this.widget];
        this.title = " ";
    }

    onDrawForeground(ctx) {
        
        if (this.properties.state.value == 1) {
            this.margin = 16;
        } else {
            this.margin = 14;
            ctx.fillStyle = "black";
            ctx.fillRect(this.margin + 2, this.margin + 2, this.widget.size[0] - this.margin * 2, this.widget.size[1] - this.margin * 2);
        }

        ctx.fillStyle = this.properties.color.value;
        ctx.fillRect(this.margin, this.margin, this.widget.size[0] - this.margin * 2, this.widget.size[1] - this.margin * 2);

        if (this.properties.label || this.properties.label.value === 0) {
            var font_size = this.properties.font_size || 30;
            ctx.textAlign = "center";
            ctx.fillStyle = this.properties.state.value ? "black" : "white";
            ctx.font = font_size + "px Arial";
            ctx.fillText(this.properties.label.value, this.widget.size[0] * 0.5, this.widget.size[1] * 0.5 + font_size * 0.3);
            ctx.textAlign = "left";
        }
    }

    onMouseDown(e, local_pos) {
        if (local_pos[0] > WidgetButton.margin && local_pos[1] > WidgetButton.margin && local_pos[0] < this.widget.size[0] - WidgetButton.margin && local_pos[1] < this.widget.size[1] - WidgetButton.margin) {
            //this.properties.state.value = this.properties.press.value;
            //this.properties.state.outValue = this.properties.state.value;
            window.nodes.update(this.id, {"state": {"inpValue" : 1}});
            return true;
        }
        this.graph.canvas.setDirty(true);

        return false;
    }

    onExecute() {
        for(let input in this.getInputs()) {
            if (this.properties[input.name].inpuValue != null) {
                this.properties[input.name].value = this.properties[input.name].inpValue;
                this.properties[input.name].inpValue = null;
            }
        }
        this.output = null;
        if (this.inpValue == 0 && this.state == 1) {
            this.output = this.properties.release;
        } 
        if (this.inpValue == 1 && this.state == 0) {
            this.output = this.properties.press;
        }
        
        if (this.output != null) {
            if (this.getInputs()[0]?.link == null) {
                this.setOutputData(0, this.output);
            } else {
                this.setOutputData(0, this.properties.A);
            }
            for(let input of this.getInputs()) {
                input.value = null;
            }
        }
    }

    onMouseUp(/*e*/) {
        ButtonCore.reset(this.properties);
        window.nodes.update(this.id, {"state": {"inpValue" : 0}});
    }

}

LiteGraph.registerNodeType(WidgetButton.type, WidgetButton);