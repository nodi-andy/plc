import WidgetLed from "../widget/led.js";

export default class NodiBoxRed extends WidgetLed {
    constructor() {
        super();
        this.properties["port"] = 23;
        this.properties["color"] = "00ff00";
        this.type = WidgetLed.type;
    }
}

