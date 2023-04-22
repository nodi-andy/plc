import WidgetButton from "../widget/button.js";

export default class NodiBoxB1 extends WidgetButton {
    constructor() {
        super();
        this.properties["port"] = 18;
        this.properties["label"] = "1";
        this.properties["color"] = "#3399ff";
        this.addProperty("pressing", 1);
        this.addProperty("pressed", null);
        this.addProperty("releasing", 0);
        this.addProperty("released", null);
        this.type = WidgetButton.type;
    }
}
