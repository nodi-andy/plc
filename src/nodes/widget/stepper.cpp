#include "stepper.h"

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
    stepPort = 27;
    dirPort = 14;
    enablePort = 32;
    if(props["properties"].containsKey("step port") > 0 ) {
      stepPort = props["properties"]["step port"].as<int>();
    }
    
    if(props["properties"].containsKey("dir port") > 0 ) {
      dirPort = props["properties"]["dir port"].as<int>();
    }

    if(props["properties"].containsKey("enable port") > 0 ) {
      enablePort = props["properties"]["enable port"].as<int>();
    }

    pos = 0;
    moveForced = false;


    addInput("speed");
    addInput("pos");
    addInput("reset");
    addOutput("speed");
    addOutput("pos");

    My_timer = NULL;

    // initialize the control pins for the A4988 driver
    pinMode(stepPort, OUTPUT);
    pinMode(2, OUTPUT);
    pinMode(dirPort, OUTPUT);
    pinMode(enablePort, OUTPUT);
    digitalWrite(enablePort, 0);
    digitalWrite(dirPort, 1);
    
    My_timer = timerBegin(0, 80, true);
    timerAttachInterrupt(My_timer, &Stepper::onTimer, true);
    speed = 2000;
    timerAlarmWrite(My_timer, speed, true);
    timerAlarmEnable(My_timer);
}

int Stepper::onExecute() {
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
    return 0;
}

void Stepper::onTimer() {
    /*Serial.print("INTR TargetPos: ");
    Serial.print(targetPos);
    Serial.print(" INTR POS: ");
    Serial.println(pos);*/
    dir = targetPos > pos;
    digitalWrite(dirPort, dir);
    if (targetPos != pos || moveForced) {
        digitalWrite(stepPort, !digitalRead(stepPort));
        if (digitalRead(stepPort)) {
            if (dir) pos++;
            else pos--;
        }
    }

}
