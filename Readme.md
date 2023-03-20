# Conucon PLC

PLC Function Block Diagram for IoT with Webinterface


## Installation


``
git clone https://github.com/nodi-andy/plc 
cp src/custom_edit_me.h src/custom.h
``

- Install platformIO
- Set your local WIFI name and password in src/custom.h
- Set your board in platformio.ini: here is esp32doit-devkit-v1 used
- Select in platformIO menu: esp32doit-devkit-v1 > Platform > Upload Filesystem image
- Select in platformIO menu: esp32doit-devkit-v1 > General > Upload and Monitor
- Check in serial monitor the IP address of esp32 (192.168.x.y) and type the IP address in browser


