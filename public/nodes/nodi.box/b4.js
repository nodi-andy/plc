import WidgetButton from "../widget/button.js";

export default class NodiBoxB4 extends WidgetButton{
    constructor() {
        super();
        this.properties["port"] = 19;
        this.properties["label"] = "4";
        this.properties["color"] = "#3399ff";
        this.type = WidgetButton.type;
    }
}
