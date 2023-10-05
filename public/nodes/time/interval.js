import { NodiEnums } from "../../enums.mjs";

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
        this.setProperty("press", "number", 1, "press", {input: false, output: false});
        this.setProperty("release", "number", 0, "release", {input: false, output: false});
        this.setProperty("ton", "number", 500, "release", {input: false, output: false});
        this.setProperty("toff", "number", 500, "release", {input: false, output: false});
        this.setProperty("state", "number", 0, "state", {input: false, output: true});

        this.last_on = 0;
        this.last_off = 0;
        this.triggered = false;
        this.newState = 0;
        this.setSize([64, 64]);
        this.type = Interval.type;
    }

    /*getProps() {
        return [["ton", "number", 500, "tOn"], ["toff", "number", 500, "tOff"]];
    }*/

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
        var now = NodiEnums.getTime();

        var dON = now - this.last_on;
        var dOFF = now - this.last_off;
        if (this.newState == 0 && dOFF > this.properties.toff.value) {
            this.newState = 1;
            this.last_on = now;
            this.properties.state.value = this.properties.release.value;
            this.properties.state.outValue = this.properties.state.value;
            console.log("ton")
        } else if (this.newState == 1 && dON > this.properties.ton.value) {
            this.newState = 0;
            this.last_off = now;
            this.properties.state.value = this.properties.press.value;
            this.properties.state.outValue = this.properties.state.value;
            console.log("toff")
        }

        if (this.properties.state.value != this.newState) {
            this.setDirtyCanvas(true, true);
        }
    }
}

LiteGraph.registerNodeType(Interval.type, Interval);
