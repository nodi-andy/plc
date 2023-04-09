import WidgetButton from "../widget/button.js";

export default class NodiBoxB1 extends WidgetButton{
    constructor() {
        super();
        this.properties["port"] = 18;
        this.properties["text"] = "1";
        this.properties["color"] = "#3399ff";
        this.type = WidgetButton.type;
    }
}
