import WidgetButton from "../widget/button.js";

export default class NodiBoxB2 extends WidgetButton{
    constructor() {
        super();
        this.properties["port"] = 5;
        this.properties["label"] = "2";
        this.properties["color"] = "#3399ff";
        this.addProperty("pressing", 1);
        this.addProperty("pressed", null);
        this.addProperty("releasing", 0);
        this.addProperty("released", null);
        this.type = WidgetButton.type;
    }
}
