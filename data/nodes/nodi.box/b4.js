import WidgetButton from "../widget/button.js";
import { LiteGraph } from "../../litegraph.js";

export default class NodiBoxB4 extends WidgetButton{
    constructor() {
        super();
        this.properties["port"] = 19;
        this.properties["text"] = "4";
        this.properties["color"] = "#3399ff";
        this.type = WidgetButton.type;
    }
}

LiteGraph.registerNodeType("nodi.box/B4", NodiBoxB4);