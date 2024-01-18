import WidgetLed from "../basic/led.mjs";

export default class NodiBoxGreen extends WidgetLed {
    static type2 = "nodi.box/green_led";

    static setup(props) {
        WidgetLed.setup(props);
        props.port.value = 23;
        props.label.value = "green";
        props.color.value = "#00ff00";
        props.device = "nodi.box";
    }
}