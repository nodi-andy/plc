import WidgetNumber from "../basic/number.js";

export default class NodiBoxAnalog extends WidgetNumber {
    constructor() {
        super();
        this.properties["port"] = 19;
        this.properties["label"] = "1";
        this.properties["color"] = "#3399ff";
        this.type = WidgetNumber.type;
    }
}
