import WidgetButton from "../widget/button.js";

export default class NodiBoxB4 extends WidgetButton{
    constructor() {
        super();
        this.properties["port"] = 19;
        this.properties["text"] = "4";
        this.properties["color"] = "#3399ff";
        this.addProperty("pressing", 1);
        this.addProperty("pressed", 1);
        this.addProperty("releasing", 0);
        this.addProperty("released", 0);
        this.type = WidgetButton.type;
    }
}
