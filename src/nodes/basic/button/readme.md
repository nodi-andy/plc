Push Button

properties:
- port
- pressed
- released

inputs:
value: integer

outputs:
value: integer

function:
if pressed, send either default pressed value or input value
if released, send default released value

