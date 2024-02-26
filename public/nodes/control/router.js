import Node from "../../node.mjs";
import NodeWork from "../../nodework.mjs";

class Filter extends Node{
    static type = "control/filter";
    static title = "Router";

    constructor() {
        super();
        this.setProperty("in", {input: true});
        this.setProperty("pass");
        this.setProperty("out",  {output: true});

        this.selected = 0;
        this.type = Filter.type;
    }

    run(update) {
        if (update && this.properties.in.inpValue == this.properties.pass.value) {
            this.properties.out.outValue = this.properties.in.inpValue;
            this.properties.in.inpValue = null;
        }
    }
    
    onDrawBackground(ctx) {
        ctx.font = "24px Arial";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText(this.properties.pass.value + "?" , this.size[0] * 0.5, this.size[1] * 0.5 + 8);
        ctx.textAlign = "left";
    }
}

NodeWork.registerNodeType(Filter);