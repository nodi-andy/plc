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
    name = "nodi.box/stepper";
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
    //Serial.print(" And inputs:");
    for( const auto& inputObj : props["inputs"].as<JsonArray>() ) {
        Serial.println(inputObj["name"].as<std::string>().c_str());
        addInput(inputObj["name"].as<std::string>());
        inputVals[inputObj["name"].as<std::string>()] = 0;
    }

    //Serial.print(" And outputs:");
    for( const auto& inputObj : props["outputs"].as<JsonArray>() ) {
        Serial.println(inputObj["name"].as<std::string>().c_str());
        addOutput(inputObj["name"].as<std::string>());
    }

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

    bool update = false;
    value = 1;
    for (auto& input : inputs) {
      if (input.second) {
        update = true;
        inputVals[input.first] = *(input.second);
        Serial.println(*input.second);
      }
    }
    inputs.clear();

    targetPos = inputVals["pos"];
    if (speed != inputVals["speed"]) {
      setOutput("speed", &speed);
      speed = inputVals["speed"];
    }


    if (speed != 0 && My_timer) {
        timerAlarmWrite(My_timer, speed, true);
        timerAlarmEnable(My_timer);
    }
    
    if (inputVals["reset"]) {
        pos = 0;
        targetPos = 0;
        inputVals["reset"] = 0;
        //Serial.print("TargetPos: ");
        //Serial.println(targetPos);
    }
        
    if (updatePos) {
        setOutput("pos", &pos);
        updatePos = false;
    }
    return 0;
}

void Stepper::onTimer() {
    /*Serial.print("INTR TargetPos: ");
    Serial.print(targetPos);
    Serial.print(" INTR POS: ");
    Serial.println(pos);*/
    
    dir = targetPos > pos;
    digitalWrite(dirPort, dir);
    if (targetPos != pos) {
        digitalWrite(stepPort, !digitalRead(stepPort));
        updatePos = true;
        if (digitalRead(stepPort)) {
            if (dir) pos++;
            else pos--;
        }
    }

}
