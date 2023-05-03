import WidgetButton from "../widget/button.js";

export default class NodiBoxB3 extends WidgetButton{
    constructor() {
        super();
        this.properties["port"] = 21;
        this.properties["label"] = "3";
        this.properties["color"] = "#3399ff";
        this.type = WidgetButton.type;
    }
}
