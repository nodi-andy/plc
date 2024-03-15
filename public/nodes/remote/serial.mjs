import NodeWork from "../../nodework.mjs";

export default class ComPort extends NodeWork {
  static type = "remote/serial";
  static title = "COM";

  static onDrawForeground(node, ctx) {
    let props = node.properties;
    
  }

  static setup(node) {
    let props = node.properties;
  }

  static run(node) {
    let ret = [];
    return ret;
  }

  static openSerial() {
    window.serialbuffer = "";
    window.serialport.open({ baudRate: 115200 }).then(() => {
      console.log('Port is opened!');
      window.reader = window.serialport.readable.getReader();
      window.serialwriter = window.serialport.writable.getWriter();
      const encoder = new TextEncoder();
      window.serialwriter.write(encoder.encode(JSON.stringify(["getNodework", ""])));
      const readLoop = () => {
        window.reader.read().then(({ value, done }) => {
              if (done) {
                  console.log('Stream closed or reader released.');
                  return;
              }
              const receivedData = new TextDecoder().decode(value);
              //console.log('Data received:', receivedData);
              window.serialbuffer += receivedData;
              let newlineIndex = window.serialbuffer.indexOf('\n');
              while (newlineIndex !== -1) {
                  // Extract the line including the newline character
                  let line = window.serialbuffer.substring(0, newlineIndex + 1);
                  // Call the function with the extracted line
                  if (window.serialline) window.serialline(line);

                  // Remove the processed line from the buffer
                  window.serialbuffer = window.serialbuffer.substring(newlineIndex + 1);

                  // Check for another newline character in the remaining buffer
                  newlineIndex = window.serialbuffer.indexOf('\n');
              }
              // Continue reading
              readLoop();
          }).catch(error => {
              console.error('Error reading from serial port:', error);
          });
      };
      readLoop();
    });
  }

}

NodeWork.registerNodeType(ComPort);
