# Conucon PLC: IoT Function Block Diagram with Web Interface

Conucon PLC uses a specific graphical programming (noditron) for creating IoT function block diagrams with a web interface. This platform utilizes the PLC (programmable logic controller) concept to create a user-friendly interface for building IoT projects.

With Conucon PLC, you can create complex IoT projects with ease. The platform is user-friendly and requires no prior programming experience.

## Installation
To get started with Conucon PLC, follow these steps:
1. Download 3 binary files from [/public/bins](https://github.com/nodi-andy/plc/tree/master/public/bins). Those are partitions.bin, firmware.bin and littlefs.bin
1. Go to the Adafruits online ESPTools: https://adafruit.github.io/Adafruit_WebSerial_ESPTool/
1. Click on "Choose a file.." and select partitions.bin. Do not change the Offset
1. Click on the next "Choose a file.." button and select firmware.bin. Enter the offset as "Ox10000" (10k)
1. Repeat the same for littlefs.bin. Enter the offset as "Ox170000" (170k)
1. Click on "Program" and reset after done.
1. Now you can find "noditron" in the wifi search

## Compilation

To build conucon PLC, follow these steps:

1. Clone the repository from GitHub ``git clone https://github.com/nodi-andy/plc``
1. Install platformIO
1. Select `esp32doit-devkit-v1` > `Platform` > `Upload Filesystem image` from the PlatformIO menu.
1. Select `esp32doit-devkit-v1` > `General` > `Upload and Monitor` from the PlatformIO menu.
1. Connect to the wifi "noditron" 
1. Type 192.168.4.1 in your browser

You should now see the home screen with the toolbox:

<img src="https://user-images.githubusercontent.com/19575988/235246671-21eeefc2-d2bd-49ad-991a-6593dcc27c2d.png" width="640">

## Adding blocks
To add your first block:

1. Select the `basic/toggle` from menu bar. The block will appear
1. Right-click on it and select the menu `properties` > `port`
1. Set the value on 2 (default LED on esp32)
1. Set the LED value by clicking on toggle
1. Write the code into esp32 by middle mouse button
1. Based on toggle state, the LED will go on or off after code sent using middle button

<img src="https://user-images.githubusercontent.com/19575988/226484676-56ec907a-3cb7-420c-95fb-651981efb0b9.png" width="640">

## Connecting the blocks
1. Create a button (`widget/button`) using the same method as before.
1. Set the port of the button on `0` in the same menu described above
1. Port `0` is connected to the default button on esp32
1. Connect the output of button in the function block diagram to the input of toggle
1. This will overwrite the toggle default value and the toggle will take the value of button
1. Write the code using middle mouse button. Note that one button on the esp32 board is the reset/boot button; press the other button.
1. The on-board LED will go on and off after you press and release the button.

The following image shows the result:

<img src="https://user-images.githubusercontent.com/19575988/226485050-dcea0894-c195-4a8a-ac60-4a712d056e47.png" width="640">

## Create a logic circuit
1. Add a AND gate (logic/and) and another button
1. Assign the port number of the new button (e.g. 19). Note that this port shall be available as input port
1. Create following circuit
1. Connect a simple button between the new port (e.g.19) and GND:

<img src="https://user-images.githubusercontent.com/19575988/226487773-96bfc14f-9e38-4068-bce4-273e687a883e.png" width="640">

Pressing the on-board button and the new button will turn the led on. There is no need for additional hardware.
Create complex circuit using other logic blocks

<img src="https://user-images.githubusercontent.com/19575988/226489351-d69562fd-92a5-4989-8da4-26ad10537bf9.png" width="640">
