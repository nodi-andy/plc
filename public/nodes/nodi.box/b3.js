import WidgetButton from "../widget/button.mjs";

export default class NodiBoxB3 extends WidgetButton{
    static type2 = "nodi.box/b3";

    static setup(props) {
        WidgetButton.setup(props);
        props.port.value = 21;
        props.label.value = "3";
        props.color.value = "#3399ff";
        props.device = "nodi.box";
    }
}
