import WidgetButton from "../widget/button.js";

export default class NodiBoxB1 extends WidgetButton {
    constructor() {
        super();
        this.properties.port.value = 18;
        this.properties.label.value = "1";
        this.properties.color.value = "#3399ff";
        this.type = WidgetButton.type;
    }
}
