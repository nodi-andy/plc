import WidgetButton from "../widget/button.js";

export default class esp32mcuB1 extends WidgetButton {
    constructor() {
        super();
        this.properties.port.value = 21;
        this.properties.label.value = "1";
        this.properties.color.value = "#3399ff";
        this.type = WidgetButton.type;
        this.device = "esp32mcu";
    }
}
