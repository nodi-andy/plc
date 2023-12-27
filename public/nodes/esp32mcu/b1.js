import WidgetButton from "../widget/button.mjs";

export default class esp32mcuB1 extends WidgetButton {
    static type = "esp32mcu/b1";
    constructor() {
        super();
        this.properties.port.value = 0;
        this.properties.label.value = "1";
        this.properties.color.value = "#3399ff";
        this.type = WidgetButton.type;
        this.device = "esp32mcu";
    }
}
