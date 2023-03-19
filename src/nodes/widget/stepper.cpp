#include "stepper.h"

#define STEP   27
#define DIR    14
#define ENABLE 32

void IRAM_ATTR onTimer(){
    digitalWrite(STEP, !digitalRead(STEP));
    /*if (dir > 0) {

    }*/
}

Stepper::Stepper() {
}

Stepper::~Stepper() {
    //timerDetachInterrupt(My_timer);
}

// init the node
void Stepper::setup() {
    title = "Counter";
    desc = "Read input";
    name = "widget/stepper";

    pos = 0;
    addInput("speed");
    addInput("pos");
    addInput("reset");
    addOutput("speed");
    addOutput("pos");

    My_timer = NULL;

    // initialize the control pins for the A4988 driver
    pinMode(STEP, OUTPUT);
    pinMode(2, OUTPUT);
    pinMode(DIR, OUTPUT);
    pinMode(ENABLE, OUTPUT);
    digitalWrite(ENABLE, 0);
    digitalWrite(DIR, 1);
    
    My_timer = timerBegin(0, 80, true);
    timerAttachInterrupt(My_timer, &onTimer, true);
}

void Stepper::onExecute() {
    int newSpeed = *getInput(0);
    if (newSpeed > 0 && newSpeed != speed && My_timer) {
        speed = newSpeed;
        timerAlarmWrite(My_timer, speed, true);
        timerAlarmEnable(My_timer);
    }
    targetPos = *getInput(1);
    dir = (targetPos > pos);

    digitalWrite(DIR, dir);

    setOutput(0, &speed);
    setOutput(1, &pos);
}