import WidgetToggle from "../widget/toggle.js";

export default class NodiBoxYellow extends WidgetToggle {
    constructor() {
        super();
        this.properties["port"] = 22;
        this.properties["color"] = "#FFC300";
        this.type = WidgetToggle.type;
    }
}
