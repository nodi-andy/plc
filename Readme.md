# Conucon PLC: IoT Function Block Diagram with Web Interface

Conucon PLC is a platform for creating IoT function block diagrams with a web interface. This platform utilizes the PLC (programmable logic controller) concept to create a user-friendly interface for building IoT projects.

With Conucon PLC, you can create complex IoT projects with ease. The platform is user-friendly and requires no prior programming experience.


## Installation

To get started with Conucon PLC, follow these steps:



``cp src/custom_edit_me.h src/custom.h``
1. Clone the repository from GitHub ``git clone https://github.com/nodi-andy/plc``
1. Install platformIO
1. Set your local WiFi name and password in `src/custom.h`.
1. Set your board in `platformio.ini`. Here, `esp32doit-devkit-v1` is used.
1. Select `esp32doit-devkit-v1` > `Platform` > `Upload Filesystem image` from the PlatformIO menu.
1. Select `esp32doit-devkit-v1` > `General` > `Upload and Monitor` from the PlatformIO menu.
1. Check the serial monitor for the IP address of your ESP32 (192.168.x.y), and type this address in your browser.

You should now see the home screen with the toolbox:
![image](https://user-images.githubusercontent.com/19575988/226483575-d08071e0-56ef-4dff-9901-b49b5f7c6bd9.png)

## Adding blocks
To add your first block:

1. Select the `basic/toggle` from menu bar. The block will appear
1. Right-click on it and select the menu `properties` > `port`
1. Set the value on 2 (default LED on esp32)
1. Set the LED value by clicking on toggle
1. Write the code into esp32 by middle mouse button
1. Based on toggle state, the LED will go on or off after code sent using middle button

![image](https://user-images.githubusercontent.com/19575988/226484676-56ec907a-3cb7-420c-95fb-651981efb0b9.png)

## Connecting the blocks
- Create a button (`widget/button`) using the same method as before.
- Set the port of the button on `0` in the same menu described above
- Port `0` is connected to the default button on esp32
- Connect the output of button in the function block diagram to the input of toggle
- This will overwrite the toggle default value and the toggle will take the value of button
- Write the code using middle mouse button. Note that one button on the esp32 board is the reset/boot button; press the other button.
- The on-board LED will go on and off after you press and release the button.

The following image shows the result:

![image](https://user-images.githubusercontent.com/19575988/226485050-dcea0894-c195-4a8a-ac60-4a712d056e47.png)

