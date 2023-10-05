export default class NodeWork {
    static typeList = []

    static registerType (type, className) {
        NodeWork.typeList[type] = className;
    }

    static getType (type) {
        return NodeWork.typeList[type];
    }

    constructor() {
        this.nodes = [];
        this.links = [];
    }
}