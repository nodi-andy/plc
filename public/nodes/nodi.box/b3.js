import WidgetButton from "../widget/button.js";

export default class NodiBoxB3 extends WidgetButton{
    constructor() {
        super();
        this.properties.port.value = 21;
        this.properties.label.value = "3";
        this.properties.color.value = "#3399ff";
        this.type = WidgetButton.type;
        this.device = "nodi.box";
    }
}
