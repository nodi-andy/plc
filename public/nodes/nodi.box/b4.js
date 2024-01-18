import WidgetButton from "../basic/button.mjs";

export default class NodiBoxB4 extends WidgetButton{
    static type2 = "nodi.box/b4";

    static setup(props) {
        WidgetButton.setup(props);
        props.port.value = 19;
        props.label.value = "4";
        props.color.value = "#3399ff";
        props.device = "nodi.box";
    }
}