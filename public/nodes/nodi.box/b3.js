import WidgetButton from "../widget/button.js";

export default class NodiBoxB3 extends WidgetButton{
    constructor() {
        super();
        this.properties["port"] = 21;
        this.properties["text"] = "3";
        this.properties["color"] = "#3399ff";
        this.addProperty("pressing", 1);
        this.addProperty("pressed", 1);
        this.addProperty("releasing", 0);
        this.addProperty("released", 0);
        this.type = WidgetButton.type;
    }
}
