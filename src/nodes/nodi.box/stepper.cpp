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
        props["properties"][inputObj["name"]] = nullptr;
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
    speed = 0;
    setSpeed(2000);
    timerAlarmWrite(My_timer, speed, true);
    timerAlarmEnable(My_timer);
}

int Stepper::onExecute() {
    bool update = false;

    for (auto& input : inputs) {
      if (input.second) {
        update = true;
        /*Serial.print("Stepper.");
        Serial.print(input.first.c_str());
        Serial.print(": ");
        Serial.println(*input.second);*/
        inputVals[input.first] = input.second;
        input.second = nullptr;
      }
    }

    if (inputVals["pos"] != nullptr && targetPos != *(inputVals["pos"]) && *(inputVals["pos"]) != INT_MAX) {
      targetPos = *(inputVals["pos"]);
      Serial.print("Stepper.targetPos.changed: ");
      Serial.print(targetPos);
      Serial.print("speed is: ");
      Serial.println(speed);
    }

    if (inputs["speed"] && targetSpeed != *inputs["speed"]) {
      targetSpeed = *(inputVals["speed"]);
      /*Serial.print("Stepper.speed.changed: ");
      Serial.println(speed);*/
    }

    if (inputVals["reset"] && *(inputVals["reset"]) == 1) {
      Serial.print("Stepper.reset ");
      pos = 0;
      targetPos = 0;
      inputVals["reset"] = 0;
    }

    int posGiven = 0, speedGiven = 0;
    if (inputs["pos"] != nullptr && inputs["speed"] == nullptr) {
        posGiven = 1;
    }
    if (inputs["pos"] == nullptr && inputs["speed"] != nullptr) {
        speedGiven = 1;
    }

    setOutput("pos", &pos);
    setOutput("speed", &speed);
    setSpeed(targetSpeed);
    if (posGiven == 0 && speedGiven == 1) {
        targetPos = targetSpeed > 0 ? pos + 1000 : targetPos = pos - 1000;
        //Serial.print("Speed control: Stepper.pos: ");
        //Serial.print(pos);
        //Serial.print("\tStepper.targetpos: ");
        //Serial.print(targetPos);
        //Serial.print("\tStepper.speed: ");
        //Serial.println(speed);
    }

    return 0;
}

void Stepper::setSpeed(int newSpeed) {
  if (newSpeed == speed) return;
  if (!My_timer) return;
  newSpeed = abs(newSpeed);
  if (newSpeed == 0) {
        speed = 0;
        timerAlarmDisable(My_timer);
        timerState = 0;
        Serial.print("Timer OFF. ");
  } else {
    if (timerState == 0) {
        Serial.print("Timer ON. ");
        timerAlarmEnable(My_timer);
        timerState = 1;
    }
    if (newSpeed != speed) {
      Serial.print("Set Speed.");
      Serial.println(speed);
      timerAlarmWrite(My_timer, speed, true);
    }
    speed = newSpeed;
  }
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
