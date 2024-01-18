import WidgetButton from "../basic/button.mjs";

export default class esp32mcuB1 extends WidgetButton {
    static type2 = "esp32mcu/b1";

    static setup(node) {
        WidgetButton.setup(node);
        let props = node.properties;
        props.port.value = 0;
        props.label.value = "1";
        props.color.value = "#3399ff";
        props.device = "nodi.box";
    }
}
