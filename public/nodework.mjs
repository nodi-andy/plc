export default class NodeWork {
    static typeList = []

    static registerType (className) {
        NodeWork.typeList[className.type] = className;
    }

    static getType (type) {
        return NodeWork.typeList[type];
    }

    constructor() {
        this.nodes = [];
        this.links = [];
    }
}