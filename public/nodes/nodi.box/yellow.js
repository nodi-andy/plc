import WidgetLed from "../widget/led.js";

export default class NodiBoxYellow extends WidgetLed {
    constructor() {
        super();
        this.properties.port.value = 22;
        this.properties.label.value = "yellow";
        this.properties.color.value = "FFC300";
        this.type = WidgetLed.type;
        this.device = "nodi.box";
    }
}
