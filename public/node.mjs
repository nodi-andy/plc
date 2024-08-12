
export default class Node {
  static onGrid = true;
  /* Creates a clone of this node */
  static clone(node) {
    let data = { ...node };
    for (let key in data) {
      node[key] = data[key];
    }

    return node;
  }

  static checkValueUpdate(props) {
    return Object.values(props).some(prop =>
        prop.inpValue && Object.values(prop.inpValue).some(input => input.update === 1)
    );
  }
  
  static setProperty(properties, name, info) {
    if (!properties) return;
    if (properties[name]) return;
    
    properties[name] = {};

    var prop = properties[name];
    if (!prop.name) prop.name = name;
    if (!prop.inpValue) prop.inpValue = {};
    if (!prop.value) prop.value = null;
    if (!prop.outValue) prop.outValue = {};
    for (let i in info) {
      prop[i] = info[i];
    }
  }

  static updateProp(node, propName, propType, value) {
    if (typeof propType === "object") {
      Object.keys(propType).forEach((subPropName) => {
        let p = node.properties[propName][subPropName];
        if (typeof p === "object") {
          node.properties[propName][subPropName]["user"] = {val: subPropName[propName], update: true};
        } else {
          node.properties[propName][subPropName] = subPropName[propName];
        }
      })
    } else {
      node.properties[propName][propType] = value;
    }
  }

  static updateInputs(node, key, prop) {
      node.properties[key]["inpValue"]["user"] = {val: prop["inpValue"], update: 1};
  }

  static updateValues(node, key, prop) {
    node.properties[key]["value"] = {val: prop["value"], update: 1};
  }

  static updateOutputs(node, key, prop) {
    node.properties[key]["outValue"] = {val: prop["outValue"], update: 1};
  }

}
