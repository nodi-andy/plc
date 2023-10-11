import { NodiEnums } from "../../enums.mjs"
import NodeWork from "../../nodework.mjs";
import NodeCore from "../../node_core.mjs";

export default class TimeIntervalCore extends NodeCore {
    static type = "time/interval";
    static title = "T";
    static desc = "Interval";

    static setup(prop) {
        NodeCore.setProperty(prop,"press", "number", 1, "press", {input: false, output: false});
        NodeCore.setProperty(prop,"release", "number", 0, "release", {input: false, output: false});
        NodeCore.setProperty(prop,"ton", "number", 500, "release", {input: false, output: false});
        NodeCore.setProperty(prop,"toff", "number", 500, "release", {input: false, output: false});
        NodeCore.setProperty(prop,"state", "number", 0, "state", {input: false, output: true});
        NodeCore.setProperty(prop,"value", "number", 0, "state", {input: false, output: false});
        NodeCore.setProperty(prop,"lastOn", "number", 0, "state", {input: false, output: false});
        NodeCore.setProperty(prop,"lastOff", "number", 0, "state", {input: false, output: false});
        this.type = TimeIntervalCore.type
        TimeIntervalCore.reset(prop);
    }

    static run(prop) {
        var now = NodiEnums.getTime();
        if (prop.state.value == null) prop.state.value = 0;

        var dON = now - prop.lastOn.value;
        var dOFF = now - prop.lastOff.value;
        if (prop.state.value == 0 && dOFF > prop.toff.value) {
            prop.lastOn.value = now;
            prop.state.value = 1;
            prop.state.outValue = 1;
            prop.value.value = prop.release.value;
            prop.value.outValue = prop.release.value;
            console.log("ton")
            return true;
        } else if (prop.state.value == 1 && dON > prop.ton.value) {
            prop.lastOff.value = now;
            prop.state.value = 0;
            prop.state.outValue = 0;
            prop.value.value = prop.press.value;
            prop.value.outValue = prop.press.value;
            console.log("toff")
            return true;
        }

        return false;
    }

    static reset(prop) {
        prop.state.value = 0;
    }

}

NodeWork.registerType(TimeIntervalCore)