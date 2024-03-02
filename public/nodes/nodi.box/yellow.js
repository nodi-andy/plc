import WidgetLed from "../basic/led.mjs";

export default class NodiBoxYellow extends WidgetLed {

    static setup(props) {
        WidgetLed.setup(props);
        props.port.value = 22;
        props.label.value = "yellow";
        props.color.value = "FFC300";
        props.device = "nodi.box";
    }
}