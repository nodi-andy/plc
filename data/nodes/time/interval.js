import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class Interval extends LGraphNode {
    static title = "Timer";
    static desc = "Sends an event every N milliseconds";
    static title_mode = LiteGraph.NO_TITLE;
    static on_color = "#AAA";
    static off_color = "#222";

    constructor() {
        super();
        this.addProperty("ton", 1000);
        this.addProperty("toff", 1000);
        this.addProperty("down", "1");
        this.addProperty("pressed", "1");
        this.addProperty("up", "0");
        this.addProperty("released", "0");
        this.addInput("ton", "number", "", "tOn");
        this.addInput("toff", "number", "", "tOff");
        this.addOutput("tick", "number", "", "tick");
        this.time = 0;
        this.last_interval = 1000;
        this.triggered = false;
        this.size = [128, 128];
    }

    onStart() {
        this.time = 0;
    }

    getTitle() {
        return "Timer: " + this.last_interval.toString() + "ms";
    }

    onDrawBackground() {
        this.boxcolor = this.triggered ? Interval.on_color : Interval.off_color;
        this.triggered = false;
    }

    onExecute() {
        /*var dt = this.graph.elapsed_time * 1000; //in ms

        var trigger = this.time == 0;

        this.time += dt;
        this.last_interval = Math.max(
            1,
            this.getInputOrProperty("interval") | 0
        );

        if (!trigger &&
            (this.time < this.last_interval || isNaN(this.last_interval))) {
            if (this.inputs && this.inputs.length > 1 && this.inputs[1]) {
                this.setOutputData(1, false);
            }
            return;
        }

        this.triggered = true;
        this.time = this.time % this.last_interval;
        this.trigger("on_tick", this.properties.event);
        if (this.inputs && this.inputs.length > 1 && this.inputs[1]) {
            this.setOutputData(1, true);
        }*/
    }

    onGetInputs() {
        return [["interval", "number"]];
    }

    onGetOutputs() {
        return [["tick", "boolean"]];
    }
}

LiteGraph.registerNodeType("time/interval", Interval);
