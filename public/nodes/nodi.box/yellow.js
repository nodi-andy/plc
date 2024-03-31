import WidgetBit from "../basic/bit.mjs";

export default class NodiBoxYellow extends WidgetBit {

    static setup(props) {
        WidgetBit.setup(props);
        props.port.value = 22;
        props.label.value = "yellow";
        props.color.value = "FFC300";
        props.device = "nodi.box";
    }
}