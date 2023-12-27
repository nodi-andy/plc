import WidgetLed from "../widget/led.mjs";

export default class esp32mcuLED extends WidgetLed {
    static type = "esp32mcu/led";
    constructor() {
        super();
        this.properties.port.value = 2;
        this.properties.label.value = " ";
        this.properties.color.value = "1111ff";
        this.type = WidgetLed.type;
        this.device = "esp32mcu";
    }
}

