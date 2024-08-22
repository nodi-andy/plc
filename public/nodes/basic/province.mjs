import NodeWork from "../../nodework.mjs";

export default class Province extends NodeWork {
    static type = "basic/province";
    static drawBase = false;
    static defaultInput = "value";
    static defaultOutput = "value";
    
    constructor() {
        super();
        Province.setup(this.properties);
    }

    static setup(node) {
        let props = node.properties;
        node.militaryProduction = 0;
        NodeWork.setProperty(props, "taxRatio", {value: 0.03, autoInput: true});
        NodeWork.setProperty(props, "taxReady", {value: 0, autoInput: true});
        NodeWork.setProperty(props, "military", {value: 0, autoInput: true});
        NodeWork.setProperty(props, "militaryOrder", {value: 0, autoInput: true});
    }

    static onDrawForeground(node, ctx) {
        // Save the current context state
        ctx.save();

        // Translate the context to the center of the green dot
        ctx.translate(node.translate[0], node.translate[1]);
        let p = new Path2D(node.path)
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = node.color;
        ctx.stroke(p)
        ctx.fill(p)
        ctx.restore();

        var pos = Math.min(node.size[0] * 0.5, node.size[1] * 0.5);
        ctx.beginPath();
        ctx.arc(pos, pos, node.size[0] * 0.1, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.properties["militaryOrder"].value == 0 ? '#FFFFFF' : '#FF0000';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.font = "24px Arial";
        ctx.fillStyle = '#000';
        ctx.fillText(node.name, pos, pos - 12);
        if (node.properties["military"].value > 0)
        {
            ctx.textAlign = "center";
            ctx.font = "24px Arial";
            ctx.fillStyle = '#000';
            ctx.fillText(node.properties["military"].value, pos, pos + 36);
        }
    }

    static run(node) {
        if (node == null) return;
        let props = node.properties;
        let ret = [];

        for (let prop of Object.values(props)) {
            if (prop.autoInput && prop.inpValue !== null) {
                for (const inputKeys of Object.keys(prop.inpValue)) {
                prop.value = prop.inpValue[inputKeys].val;
                delete prop.inpValue[inputKeys];
                }
            }
        }

        props["taxReady"].value += (props["taxRatio"].value / 100 * node.GDP);
        if (props["militaryOrder"].value > 0) {
            node.militaryProduction += (node.MP * node.Population) / 10000000;
            if (node.militaryProduction > 1) {
              props["military"].value++;
              props["militaryOrder"].value--;
              node.militaryProduction -= 1;
            }
        }
        NodeWork.run(this);
        return ret;
    }

}

NodeWork.registerNodeType(Province);