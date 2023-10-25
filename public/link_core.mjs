//this is the class in charge of storing link information
export default class LinkCore {
    constructor(id, type, origin_id, origin_slot, target_id, target_slot) {
        this.id = id;
        this.type = type;
        this.origin_id = origin_id;
        this.origin_slot = origin_slot;
        this.target_id = target_id;
        this.target_slot = target_slot;

        this._data = null;
        this.pos = new Float32Array(2); //center
    }
    configure(o) {
        if (o.constructor === Array) {
            this.id = o[0];
            this.origin_id = o[1];
            this.origin_slot = o[2];
            this.target_id = o[3];
            this.target_slot = o[4];
            this.type = o[5];
        } else {
            this.id = o.nodeID;
            this.type = o.type;
            this.origin_id = o.from;
            this.origin_slot = o.fromSlot;
            this.target_id = o.to;
            this.target_slot = o.toSlot;
        }
    }
    serialize() {
        return [
            this.id,
            this.origin_id,
            this.origin_slot,
            this.target_id,
            this.target_slot,
            this.type
        ];
    }
}