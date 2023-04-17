import WidgetButton from "../widget/button.js";

export default class NodiBoxB2 extends WidgetButton{
    constructor() {
        super();
        this.properties["port"] = 5;
        this.properties["text"] = "2";
        this.properties["color"] = "#3399ff";
        this.type = WidgetButton.type;
    }
}
