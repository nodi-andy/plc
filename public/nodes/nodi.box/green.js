import WidgetBit from "../basic/bit.mjs";

export default class NodiBoxGreen extends WidgetBit {

    static setup(props) {
        WidgetBit.setup(props);
        props.port.value = 23;
        props.label.value = "green";
        props.color.value = "#00ff00";
        props.device = "nodi.box";
    }
}