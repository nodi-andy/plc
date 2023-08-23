import WidgetButton from "../widget/button.js";

export default class NodiBoxB2 extends WidgetButton{
    constructor() {
        super();
        this.properties.port.value = 5;
        this.properties.label.value = "2";
        this.properties.color.value = "#3399ff";
        this.type = WidgetButton.type;
    }
}
