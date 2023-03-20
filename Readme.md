# Conucon PLC

PLC Function Block Diagram for IoT with Webinterface


## Installation


``
git clone https://github.com/nodi-andy/plc \
cp src/custom_edit_me.h src/custom.h
``

- Install platformIO
- Set your local WIFI name and password in src/custom.h
- Set your board in platformio.ini: here is esp32doit-devkit-v1 used
- Select in platformIO menu: esp32doit-devkit-v1 > Platform > Upload Filesystem image
- Select in platformIO menu: esp32doit-devkit-v1 > General > Upload and Monitor
- Check in serial monitor the IP address of esp32 (192.168.x.y) and type the IP address in browser

You will see the home screen with toolbox
![image](https://user-images.githubusercontent.com/19575988/226483575-d08071e0-56ef-4dff-9901-b49b5f7c6bd9.png)

## First steps

- Select the basic/toggle from menu bar. The block will appear
- Right click on it and select the menu properties > port
- Set the value on 2 (default LED on esp32)
- Set the LED value by clicking on toggle
- Write the code by middle mouse button
- Based on toggle state, the LED will go on or off after code sent using middle button
