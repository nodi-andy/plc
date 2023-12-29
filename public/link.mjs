import { NodiEnums } from "./enums.mjs";

//this is the class in charge of storing link information
export default class LLink {
  constructor(id, type, origin_id, toSlot, target_id, fromSlot) {
    this.id = id;
    this.type = type;
    this.origin_id = origin_id;
    this.toSlot = toSlot;
    this.target_id = target_id;
    this.fromSlot = fromSlot;

    this._data = null;
    this.pos = [];
  }

  configure(o) {
    this.id = o.nodeID;
    this.type = o.type;
    this.origin_id = o.from;
    this.toSlot = o.fromSlot;
    this.target_id = o.to;
    this.fromSlot = o.toSlot;
  }

  serialize() {
    return [this.id, this.origin_id, this.toSlot, this.target_id, this.fromSlot, this.type];
  }

  
}
