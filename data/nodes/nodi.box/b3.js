import WidgetButton from "../widget/button.js";
import { LiteGraph } from "../../litegraph.js";

export default class NodiBoxB3 extends WidgetButton{
    constructor() {
        super();
        this.properties["port"] = 21;
        this.properties["text"] = "3";
        this.properties["color"] = "#3399ff";
        this.type = WidgetButton.type;
    }
}

LiteGraph.registerNodeType("nodi.box/B3", NodiBoxB3);