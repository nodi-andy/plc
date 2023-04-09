import WidgetToggle from "../widget/toggle.js";

export default class NodiBoxRed extends WidgetToggle {
    constructor() {
        super();
        this.properties["port"] = 23;
        this.properties["color"] = "#ff0000";
        this.type = WidgetToggle.type;
    }
}

