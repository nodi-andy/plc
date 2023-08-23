import WidgetButton from "../widget/button.js";

export default class NodiBoxB4 extends WidgetButton{
    constructor() {
        super();
        this.properties.port.value = 19;
        this.properties.label.value = "4";
        this.properties.color.value = "#3399ff";
        this.type = WidgetButton.type;
    }
}
