import { NodiEnums } from "../../enums.mjs"
import NodeWork from "../../nodework.mjs";
import NodeCore from "../../node_core.mjs";

export default class TimeIntervalCore extends NodeCore {
    static type = "time/interval";
    static title = "T";
    static desc = "Interval";

    static setup(prop) {
        NodeCore.setProperty(prop,"state", {output: true});
        NodeCore.setProperty(prop,"press", {value: 1});
        NodeCore.setProperty(prop,"release");
        NodeCore.setProperty(prop,"ton", {value: 500});
        NodeCore.setProperty(prop,"toff", {value: 500});
        NodeCore.setProperty(prop,"value");
        NodeCore.setProperty(prop,"lastOn");
        NodeCore.setProperty(prop,"lastOff");
        this.type = TimeIntervalCore.type
        TimeIntervalCore.reset(prop);
    }

    static run(prop) {
        var now = NodiEnums.getTime();
        for(let input in prop) {
            if (prop[input].inpValue != null) {
                prop[input].value = parseInt(prop[input].inpValue);
                prop[input].inpValue = null;
            }
        }
        
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