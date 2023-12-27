import WidgetButton from "../widget/button.mjs";

export default class NodiBoxB2 extends WidgetButton {
    static type = "nodi.box/b2";
    constructor() {
        super();
        this.properties.port.value = 5;
        this.properties.label.value = "2";
        this.properties.color.value = "#3399ff";
        this.type = WidgetButton.type;
        this.device = "nodi.box";
    }
}
