import WidgetLed from "../widget/led.js";

export default class NodiBoxYellow extends WidgetLed {
    constructor() {
        super();
        this.properties["port"] = 22;
        this.properties["label"] = "yellow";
        this.properties["color"] = "FFC300";
        this.type = WidgetLed.type;
    }
}
