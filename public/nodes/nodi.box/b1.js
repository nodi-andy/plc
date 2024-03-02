import WidgetButton from "../basic/button.mjs";

export default class NodiBoxB1 extends WidgetButton {

    static setup(props) {
        WidgetButton.setup(props);
        props.port.value = 18;
        props.label.value = "1";
        props.color.value = "#3399ff";
        props.device = "nodi.box";
    }
}