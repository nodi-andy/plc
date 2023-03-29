import WidgetButton from "../widget/button.js";
import { LiteGraph } from "../../litegraph.js";

export default class NodiBoxB2 extends WidgetButton{
    constructor() {
        super();
        this.properties["port"] = 5;
        this.properties["text"] = "2";
        this.properties["color"] = "#3399ff";
        this.type = WidgetButton.type;
    }
}

LiteGraph.registerNodeType("nodi.box/B2", NodiBoxB2);