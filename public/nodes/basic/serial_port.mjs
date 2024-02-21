import Node from "../../node.mjs";
import NodeWork from "../../nodework.mjs";

export default class SerialPort extends Node {
    static type = "basic/serial_port";
    static pixels_threshold = 10;
    static old_y = -1;
    static _remainder = 0;
    static _precision = 0;
    static mouse_captured = false;
    static defaultInput = "value";
    static defaultOutput = "value";
    
    constructor() {
        super();
        SerialPort.setup(this.properties);
    }

    static setup(node) {
        let props = node.properties;
        Node.setProperty(props, "write");
        Node.setProperty(props, "read");
        Node.setProperty(props, "port");
        SerialPort.reset(props);
    }

    static run(node) {
        let props = node.properties;
        let ret = [];
        let valueUpdate = false;
        let maxVal = -Infinity

      
        for (const valueInputs of Object.values(props.write.inpValue)) {
            if (valueInputs.update === true) valueUpdate = true;
            maxVal = Math.max(maxVal, valueInputs.val);
            valueInputs.update = false;
        }

        if (valueUpdate) {
            props.value.value = maxVal;
            props.value.outValue = props.value.value;
            ret.push("value");
        }

        

        return ret;
    }

    static reset(props) {
        window.serialport.open({ baudRate: 115200 }).then(() => {
            console.log('Port is opened!');
            props.reader = window.serialport.readable.getReader();
            const readLoop = () => {
                props.reader.read().then(({ value, done }) => {
                    if (done) {
                        console.log('Stream closed or reader released.');
                        return;
                    }
                    console.log('Data received:', new TextDecoder().decode(value));
                    props.read.inpValue.serialport = new TextDecoder().decode(value);
                    // Continue reading
                    readLoop();
                }).catch(error => {
                    console.error('Error reading from serial port:', error);
                });
            };
            readLoop();
        });
    }

    static onDrawForeground(node, ctx) {
        var x = node.size[0] * 0.5;
        var h = node.size[1];


        ctx.textAlign = "center";
        ctx.font = (h * 0.6).toFixed(1) + "px Arial";
        ctx.fillStyle = "#EEE";
        //ctx.fillText(node.properties.value.value, x, h * 0.65);
    }
  
    static updateProp(node, name, val) {
        node.properties[name].inpValue = val;
        window.nodes.update(node.nodeID, node.properties);
    }
}

NodeWork.registerNodeType(SerialPort);