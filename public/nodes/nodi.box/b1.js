import WidgetButton from "../widget/button.mjs";

export default class NodiBoxB1 extends WidgetButton {
    static type = "nodi.box/b1";
    constructor() {
        super();
        this.properties.port.value = 18;
        this.properties.label.value = "1";
        this.properties.color.value = "#3399ff";
        this.type = WidgetButton.type;
        this.device = "nodi.box";
    }
}
