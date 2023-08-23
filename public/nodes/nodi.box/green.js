import WidgetLed from "../widget/led.js";

export default class NodiBoxGreen extends WidgetLed {
    constructor() {
        super();
        this.properties.port.value = 23;
        this.properties.label.value = "green";
        this.properties.color.value = "00ff00";
        this.type = WidgetLed.type;
    }
}

