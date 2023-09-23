import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

class Junction extends LGraphNode {
    static type = "control/junction";
    static title = "Junction";
    static desc = "Junction";
    static title_mode = LiteGraph.NO_TITLE;
    static fixsize = [32, 32];

    constructor() {
        super();
        this.setProperty("in", "number", 0, " ", {input: true, output: false, pos : [16, 16], shape: LiteGraph.CIRCLE_SHAPE});
        this.setProperty("value", "number", 0, " ", {input: false, output: false, pos : [16, 16], shape: LiteGraph.CIRCLE_SHAPE});
        this.setProperty("out", "number", 0, " ", {input: false, output: true, pos : [16, 16], shape: LiteGraph.CIRCLE_SHAPE});

        this.setSize([32, 32]);
        this._shape = LiteGraph.CIRCLE_SHAPE;
        this.type = Junction.type;
    }

    onExecute(update) {
        if (update) {
            if (this.properties.in.inpValue != null) {
                this.properties.out.outValue = this.properties.in.inpValue;
          }
        }
    }
}


LiteGraph.registerNodeType(Junction.type, Junction);