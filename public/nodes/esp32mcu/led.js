import WidgetLed from "../widget/led.mjs";

export default class esp32mcuLED extends WidgetLed {
    static type2 = "esp32mcu/led";

    static setup(node) {
        WidgetLed.setup(node);
        let props = node.properties;
        props.port.value = 2;
        props.label.value = " ";
        props.color.value = "#1111ff";
        props.device = "esp32mcu";
    }    
}