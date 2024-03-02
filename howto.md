## Compilation

To build conucon PLC, follow these steps:

1. Clone the repository from GitHub ``git clone https://github.com/nodi-andy/plc``
1. Install platformIO
1. Select `esp32doit-devkit-v1` > `Platform` > `Upload Filesystem image` from the PlatformIO menu.
1. Select `esp32doit-devkit-v1` > `General` > `Upload and Monitor` from the PlatformIO menu.
1. Connect to the wifi "noditron" 
1. Type 192.168.4.1 in your browser

## Server image
1. Run `npm run debug` to start debugging
1. Run `npm run build` create file system image
1. Select `esp32doit-devkit-v1` > `Platform` > `Upload Filesystem image` from the PlatformIO menu.
   

You should now see the home screen with the toolbox:

<img src="https://user-images.githubusercontent.com/19575988/235246671-21eeefc2-d2bd-49ad-991a-6593dcc27c2d.png" width="640">

## Get flash content

C:\Users\user\.platformio\packages\tool-esptoolpy
esptool.py --chip esp32 --port COMx read_flash 0x00000 0x400000 noditron.bin