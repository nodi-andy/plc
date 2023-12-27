import WidgetButton from "../widget/button.mjs";

export default class NodiBoxB4 extends WidgetButton{
    static type = "nodi.box/b4";
    constructor() {
        super();
        this.properties.port.value = 19;
        this.properties.label.value = "4";
        this.properties.color.value = "#3399ff";
        this.type = WidgetButton.type;
        this.device = "nodi.box";
    }
}
