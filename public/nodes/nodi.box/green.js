import WidgetLed from "../widget/led.mjs";

export default class NodiBoxGreen extends WidgetLed {
    static type = "nodi.box/green_led";
    constructor() {
        super();
        this.properties.port.value = 23;
        this.properties.label.value = "green";
        this.properties.color.value = "00ff00";
        this.type = WidgetLed.type;
        this.device = "nodi.box";
    }
}

