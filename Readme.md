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

## First block

- Select the basic/toggle from menu bar. The block will appear
- Right click on it and select the menu properties > port
- Set the value on 2 (default LED on esp32)
- Set the LED value by clicking on toggle
- Write the code into esp32 by middle mouse button
- Based on toggle state, the LED will go on or off after code sent using middle button
![image](https://user-images.githubusercontent.com/19575988/226484676-56ec907a-3cb7-420c-95fb-651981efb0b9.png)

## First link
- Create a button (widget/button) with the same manner
- Set the port of the button on "0" in the same menu described above
- Port 0 is connected to the button on esp32
- Connect the output of button to the input of toggle
- This will overwrite the toggle default value and the toggle will take the value of button
- Write the code and pay attention that one button on esp32 is the reset/boot button. Press the other button
- The on-board LED will go on and off after you press and release the button.
![image](https://user-images.githubusercontent.com/19575988/226485050-dcea0894-c195-4a8a-ac60-4a712d056e47.png)

