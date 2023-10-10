import { LiteGraph } from "../../litegraph.js";
import LGraphNode from "../../node.js";
import MathAddCore from "./add_core.mjs"

class MathAdd extends MathAddCore{
    constructor() {
        super();
        this.properties = {};
        MathAddCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.setSize([64, 128]);
        this.widgets = [this.widget];
        this.type = MathAddCore.type
        this.title = " ";
    }

    onExecute(props) {
        return MathAddCore.run(props);
    }

    onDrawBackground(ctx) {
        ctx.font = "20px Arial";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText(this.label, this.widget.size[0] * 0.5, this.widget.size[1] * 0.5);
        ctx.textAlign = "left";
    }
}

LiteGraph.registerNodeType(MathAdd.type, MathAdd);
