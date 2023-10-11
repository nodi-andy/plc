import { LiteGraph } from "../../litegraph.js";
import LGraphNode from "../../node.js";
import TimeIntervalCore from "./interval_core.mjs"

class TimeInterval extends TimeIntervalCore{
    static on_color = "#AAA";
    static off_color = "#222";
    
    constructor() {
        super();
        this.properties = {};
        TimeIntervalCore.setup(this.properties);
        this.widget = new LGraphNode();
        this.widget.setSize([64, 64]);
        this.widgets = [this.widget];

    }

    onExecute(props) {
        return TimeIntervalCore.run(props);
    }

    onDrawBackground() {
        this.boxcolor = this.triggered ? TimeInterval.on_color : TimeInterval.off_color;
        this.triggered = false;
    }

}

LiteGraph.registerNodeType(TimeInterval.type, TimeInterval);
