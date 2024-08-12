import NodeWork from "../../nodework.mjs";
import Node from "../../node.mjs";
import { NodiEnums } from "../../enums.mjs";

export default class GDriveFile extends Node {
    static type = "network/gdrivefile";
    static defaultInput = "value";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "value");
        Node.setProperty(props, "set");
        Node.setProperty(props, "clear");
        Node.setProperty(props, "toggle");
        Node.setProperty(props, "label");
        Node.setProperty(props, "port", {value: 2});
        Node.setProperty(props, "color", {value: "FF3333"});
    }

    static run(node) {

    }

    static onDrawForeground(node, ctx) {

        ctx.drawImage(node.icon, 0, 0, NodiEnums.CANVAS_GRID_SIZE, NodiEnums.CANVAS_GRID_SIZE,  8, 8, 48, 48)
        if (node.file.name) {
            ctx.fillText(node?.file?.name, node.size[0] * 0.5, 10);
        }

    }

    static onMouseUp(node, e, local_pos) {
        open(node.file.webViewLink);
        return true;
    }
}

NodeWork.registerNodeType(GDriveFile);