import NodeWork from "../../nodework.mjs";
import { NodiEnums } from "../../enums.mjs";

export default class GDriveFile extends NodeWork {
    static type = "network/gdrivefile";
    static defaultInput = "value";
    static defaultOutput = "value";

    static setup(node) {
        let props = node.properties;
        NodeWork.setProperty(props, "value");
        NodeWork.setProperty(props, "set");
        NodeWork.setProperty(props, "clear");
        NodeWork.setProperty(props, "toggle");
        NodeWork.setProperty(props, "label");
        NodeWork.setProperty(props, "port", {value: 2});
        NodeWork.setProperty(props, "color", {value: "FF3333"});
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