import WidgetLed from "../widget/led.js";

export default class NodiBoxGreen extends WidgetLed {
    constructor() {
        super();
        this.properties["port"] = 23;
        this.properties["label"] = "green";
        this.properties["color"] = "00ff00";
        this.type = WidgetLed.type;
    }
}

