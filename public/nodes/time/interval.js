import { NodiEnums } from "../../enums.js";

import LGraphNode from "../../node.js";
import { LiteGraph } from "../../litegraph.js";

export default class Interval extends LGraphNode {
    static title = "Timer";
    static desc = "Sends an event every N milliseconds";
    static title_mode = LiteGraph.NO_TITLE;
    static on_color = "#AAA";
    static off_color = "#222";
    static type = "time/interval";

    constructor() {
        super();
        this.addProperty("ton", 500);
        this.addProperty("toff", 500);
        this.addProperty("pressing", null);
        this.addProperty("pressed", 1);
        this.addProperty("releasing", null);
        this.addProperty("released", 0);
        this.addInput("ton", "number", "", "tOn");
        this.addInput("toff", "number", "", "tOff");
        this.addOutput("tick", "number", "", "tick");
        this.last_on = 0;
        this.last_off = 0;
        this.triggered = false;
        this.state = 0;
        this.size = [128, 128];
    }

    onStart() {
        this.time = 0;
    }

    getTitle() {
        return "Timer: ";
    }

    onDrawBackground() {
        this.boxcolor = this.triggered ? Interval.on_color : Interval.off_color;
        this.triggered = false;
    }

    onExecute() {
        if (this.state == null) this.state = 0;
        var now = NodiEnums.getTime();

        var dON = now - this.last_on;
        var dOFF = now - this.last_off;
        if (this.state == 0 && dOFF > this.properties.toff) {
            this.newState = 1;
            this.last_on = now;
        } else if (this.state == 1 && dON > this.properties.ton) {
            this.newState = 0;
            this.last_off = now;
        }

        this.output = null;

        if (this.newState == 0 && this.state == 0) {
            this.output = this.properties.released;
        } if (this.newState == 0 && this.state == 1) {
            this.output = this.properties.releasing;
            this.last_on = now;
        } if (this.newState == 1 && this.state == 1) {
            this.output = this.properties.pressed;
        } if (this.newState == 1 && this.state == 0) {
            this.output = this.properties.pressing;
            this.last_off = now;
        }
        if (this.state != this.newState) {
            this.setDirtyCanvas(true, true);
        }
        this.state = this.newState;
        this.setOutputData(0, this.output);
        //console.log(this.output);
    }
}

LiteGraph.registerNodeType(Interval.type, Interval);
