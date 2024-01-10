import WidgetButton from "../widget/button.mjs";

export default class NodiBoxB2 extends WidgetButton {
    static type2 = "nodi.box/b2";

    static setup(props) {
        WidgetButton.setup(props);
        props.port.value = 5;
        props.label.value = "2";
        props.color.value = "#3399ff";
        props.device = "nodi.box";
    }
}
