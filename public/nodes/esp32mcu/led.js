import WidgetLed from "../widget/led.js";

export default class esp32mcuLED extends WidgetLed {
    constructor() {
        super();
        this.properties.port.value = 2;
        this.properties.label.value = "red";
        this.properties.color.value = "ff0000";
        this.type = WidgetLed.type;
        this.device = "esp32mcu";
    }
}

