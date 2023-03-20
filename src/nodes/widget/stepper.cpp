#include "stepper.h"

#define STEP   27
#define DIR    14
#define ENABLE 32

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
    moveForced = false;

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
    timerAttachInterrupt(My_timer, &Stepper::onTimer, true);
    speed = 2000;
    timerAlarmWrite(My_timer, speed, true);
    timerAlarmEnable(My_timer);
}

void Stepper::onExecute() {
    moveForced = false;

    int *newSpeed = getInput(0);
    if (newSpeed && *newSpeed != speed && My_timer) {
        speed = *newSpeed;
        moveForced = true;
        timerAlarmWrite(My_timer, speed, true);
        timerAlarmEnable(My_timer);
    }
    
    int *newTargetPos = getInput(1);
    if (newTargetPos) {
        targetPos = *newTargetPos;
        //Serial.print("TargetPos: ");
        //Serial.println(targetPos);
    }

    setOutput(0, &speed);
    setOutput(1, &pos);
}

void Stepper::onTimer() {
    /*Serial.print("INTR TargetPos: ");
    Serial.print(targetPos);
    Serial.print(" INTR POS: ");
    Serial.println(pos);*/
    dir = targetPos > pos;
    digitalWrite(DIR, dir);
    if (targetPos != pos || moveForced) {
        digitalWrite(STEP, !digitalRead(STEP));
        if (digitalRead(STEP)) {
            if (dir) pos++;
            else pos--;
        }
    }

}
