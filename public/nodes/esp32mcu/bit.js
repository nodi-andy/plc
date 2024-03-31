import WidgetBit from "../basic/bit.mjs";

export default class esp32mcuBit extends WidgetBit {

    static setup(node) {
        WidgetBit.setup(node);
        let props = node.properties;
        props.port.value = 2;
        props.label.value = " ";
        props.color.value = "#1111ff";
        props.device = "esp32mcu";
    }    
}