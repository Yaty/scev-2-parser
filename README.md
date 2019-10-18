# SCEV-2 IFSC Official Timing System parser

This little utility reads data from serial port coming from the SCEV-2 device from [deepron](http://www.deepron.fr/).
It sends the timing system data to a webpage to get displayed in real time.

## Install

### RS485 to USB converter

You need to have a device like [this one](https://www.amazon.fr/DSD-TECH-SH-U10-Convertisseur-Compatible/dp/B078X5H8H7/ref=sr_1_3).

#### Connect the serial output from the connection box to the RS485 to USB converter

If it's a Sub-D9 connector :
- 2 to B
- 5 to 5 (GND)
- 8 to A

If it's a Neutrik NL4 MP connector :
- 1+ to A
- 2+ to 5 (GND)
- 1- to B
- 2- not connected

You can ask Deepron the documentation if you want more information.

### Start

`sudo node .`

## Disclaimer

I'm not responsible for any damages to you or to your devices.
