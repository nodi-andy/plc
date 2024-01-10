import WidgetLed from "../widget/led.mjs";

export default class NodiBoxYellow extends WidgetLed {
    static type2 = "nodi.box/yellow_led";

    static setup(props) {
        WidgetLed.setup(props);
        props.port.value = 22;
        props.label.value = "yellow";
        props.color.value = "FFC300";
        props.device = "nodi.box";
    }
}