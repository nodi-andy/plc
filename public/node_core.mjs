import LLink from "./link.mjs";
export default class NodeCore {
    constructor(title) {
        this.title = title;
        this.update = false;
        this.device = "server";
        this.properties = {}; //for the values
    }
    /**
         * configure a node from an object containing the serialized info
         * @method configure
         */
    configure(info) {
        if (this.graph) {
            this.graph._version++;
        }
        for (var j in info) {
            if (j == "properties") {
                //i don't want to clone properties, I want to reuse the old container
                for (var k in info.properties) {
                    this.properties[k] = info.properties[k];
                    if (this.onPropertyChanged) {
                        this.onPropertyChanged(k, info.properties[k]);
                    }
                }
                continue;
            }

            if (info[j] == null) {
                continue;
            } else if (typeof info[j] == "object") {
                //object
                if (this[j] && this[j].configure) {
                    this[j].configure(info[j]);
                } else {
                    this[j] = window.LiteGraph.cloneObject(info[j], this[j]);
                }
            } //value
            else {
                this[j] = info[j];
            }
        }


        for (let i = 0; i < NodeCore.getInputs(this.properties).length; ++i) {
            var input = NodeCore.getInputs(this.properties)[i];
            var link_info = this.graph ? this.graph.links[input.link] : null;
            if (this.onConnectionsChange)
                this.onConnectionsChange(window.LiteGraph.INPUT, i, true, link_info, input); //link_info has been created now, so its updated

            if (this.onInputAdded)
                this.onInputAdded(input);

        }

        for (let i = 0; i < NodeCore.getOutputs(this.properties).length; ++i) {
            var output = NodeCore.getOutputs(this.properties)[i];
            if (!output.links) {
                continue;
            }
            for (let j = 0; j < output.links.length; ++j) {
                let link_info = this.graph ? this.graph.links[output.links[j]] : null;
                if (this.onConnectionsChange)
                    this.onConnectionsChange(window.LiteGraph.OUTPUT, i, true, link_info, output); //link_info has been created now, so its updated
            }

            if (this.onOutputAdded)
                this.onOutputAdded(output);
        }

        if (this.widgets) {
            for (let i = 0; i < this.widgets.length; ++i) {
                var w = this.widgets[i];
                if (!w)
                    continue;
                if (w.options && w.options.property && this.properties[w.options.property])
                    w.value = JSON.parse(JSON.stringify(this.properties[w.options.property]));
            }
            if (info.widgets_values) {
                for (let i = 0; i < info.widgets_values.length; ++i) {
                    if (this.widgets[i]) {
                        this.widgets[i].value = info.widgets_values[i];
                    }
                }
            }
        }

        if (this.onConfigure) {
            this.onConfigure(info);
        }
    }
    /**
         * serialize the content
         * @method serialize
         */
    serialize() {
        //create serialization object
        var o = {
            id: this.id,
            type: this.type,
            pos: this.pos,
            size: this.size,
            order: this.order,
        };

        //special case for when there were errors
        if (this.constructor === LGraphNode && this.last_serialization) {
            return this.last_serialization;
        }

        if (this.title && this.title != this.constructor.title) {
            o.title = this.title;
        }

        if (this.properties) {
            o.properties = window.LiteGraph.cloneObject(this.properties);
        }

        if (this.widgets && this.serialize_widgets) {
            o.widgets_values = [];
            for (let i = 0; i < this.widgets.length; ++i) {
                if (this.widgets[i])
                    o.widgets_values[i] = this.widgets[i].value;

                else
                    o.widgets_values[i] = null;
            }
        }

        if (!o.type) {
            o.type = this.constructor.type;
        }

        if (this.color) {
            o.color = this.color;
        }
        if (this.bgcolor) {
            o.bgcolor = this.bgcolor;
        }
        if (this.boxcolor) {
            o.boxcolor = this.boxcolor;
        }


        if (this.onSerialize) {
            if (this.onSerialize(o)) {
                console.warn(
                    "node onSerialize shouldnt return anything, data should be stored in the object pass in the first parameter"
                );
            }
        }

        return o;
    }
    /* Creates a clone of this node */
    clone() {
        var node = window.LiteGraph.createNode(this.type);
        if (!node) {
            return null;
        }

        //we clone it because serialize returns shared containers
        var data = window.LiteGraph.cloneObject(this.serialize());


        delete data["id"];
        //remove links
        node.configure(data);

        return node;
    }
    /**
         * serialize and stringify
         * @method toString
         */
    toString() {
        return JSON.stringify(this.serialize());
    }
    //LGraphNode.prototype.deserialize = function(info) {} //this cannot be done from within, must be done in window.LiteGraph
    /**
         * get the title string
         * @method getTitle
         */
    getTitle() {
        return this.title || this.constructor.title;
    }

    /**
         * sets the value of a property
         * @method setProperty
         * @param {String} name
         * @param {*} value
         */
    static setProperty(properties, name, info) {
        if (!properties) return;
        
        if (!properties[name]) properties[name]  = {};
        
        var prop = properties[name];
        prop.name = name;
        prop.value = 0;
        prop.label = name;
        prop.input = false;
        prop.output = false;
        for (let i in info) {
            prop[i] = info[i];
        }
    }
    
    // Execution *************************
    /**
         * sets the output data
         * @method setOutputData
         * @param {number} slot
         * @param {*} data
         */
    setOutputData(slot, data) {

        //this maybe slow and a niche case
        //if(slot && slot.constructor === String)
        //	slot = this.findOutputSlot(slot);
        if (slot == -1 || slot >= NodeCore.getOutputs(this.properties).length) {
            return;
        }

        var output_info = NodeCore.getOutputs(this.properties)[slot];
        if (!output_info) {
            return;
        }

        //store data in the output itself in case we want to debug
        output_info._data = data;
    }

    /**
         * Retrieves the input data (data traveling through the connection) from one slot
         * @method getInputData
         * @param {number} slot
         * @param {boolean} force_update if set to true it will force the connected node of this slot to output data into this link
         * @return {*} data or if it is not connected returns undefined
         */
    getInputData(slot, force_update) {
        return NodeCore.getInputs(this.properties)[slot].value;
    }


    /**
         * tells you if there is a connection in one input slot
         * @method isInputConnected
         * @param {number} slot
         * @return {boolean}
         */
    isInputConnected(slot) {
        return slot < NodeCore.getInputs(this.properties).length && NodeCore.getInputs(this.properties)[slot].links.length > 0;
    }

    /**
         * Returns the link info in the connection of an input slot
         * @method getInputLink
         * @param {number} slot
         * @return {LinkCore} object or null
         */
    getInputLink(slot) {
        if (!NodeCore.getInputs(this.properties)) {
            return null;
        }
        if (slot < NodeCore.getInputs(this.properties).length) {
            var slot_info = NodeCore.getInputs(this.properties)[slot];
            return this.graph.links[slot_info.link];
        }
        return null;
    }
    /**
         * returns the node connected in the input slot
         * @method getInputNode
         * @param {number} slot
         * @return {LGraphNode} node or null
         */
    getInputNode(slot) {

        if (slot >= NodeCore.getInputs(this.properties).length) {
            return null;
        }
        var input = NodeCore.getInputs(this.properties)[slot];
        if (!input || input.link === null) {
            return null;
        }
        var link_info = this.graph.links[input.link];
        if (!link_info) {
            return null;
        }
        return this.graph.getNodeById(link_info.origin_id);
    }

    getInputByName(name) {
        let slot = this.properties[name];
        return slot.input ? slot : null;
    }

    getInputIndexByName(name) {
        return Object.values(this.properties).filter(obj => (obj.input == true)).findIndex(el => el.name === name);
    }
    getInputNameByIndex(index) {
        return getInputByIndex(index).name;
    }
    getInputByIndex(index) {
        return Object.values(this.properties).filter(obj => (obj.input == true))[index];
    }
    /**
         * tells you the last output data that went in that slot
         * @method getOutputData
         * @param {number} slot
         * @return {Object}  object or null
         */
    getOutputData(slot) {
        if (!NodeCore.getOutputs(this.properties)) {
            return null;
        }
        if (slot >= NodeCore.getOutputs(this.properties).length) {
            return null;
        }

        var info = NodeCore.getOutputs(this.properties)[slot];
        return info.value;
    }

    getOutputByName(name) {
        let slot = this.properties[name];
        return slot.output ? slot : null;
    }


    /**
         * tells you if there is a connection in one output slot
         * @method isOutputConnected
         * @param {number} slot
         * @return {boolean}
         */
    isOutputConnected(slot) {
        if (!NodeCore.getOutputs(this.properties)) {
            return false;
        }
        return (
            slot < NodeCore.getOutputs(this.properties).length &&
            NodeCore.getOutputs(this.properties)[slot].links &&
            NodeCore.getOutputs(this.properties)[slot].links.length
        );
    }
    
    /**
         * retrieves all the nodes connected to this output slot
         * @method getOutputNodes
         * @param {number} slot
         * @return {array}
         */
    getOutputNodes(slot) {
        if (!NodeCore.getOutputs(this.properties) || NodeCore.getOutputs(this.properties).length == 0) {
            return null;
        }

        if (slot >= NodeCore.getOutputs(this.properties).length) {
            return null;
        }

        var output = NodeCore.getOutputs(this.properties)[slot];
        if (!output.links || output.links.length == 0) {
            return null;
        }

        var r = [];
        for (var i = 0; i < output.links.length; i++) {
            var link_id = output.links[i];
            var link = this.graph.links[link_id];
            if (link) {
                var target_node = this.graph.getNodeById(link.target_id);
                if (target_node) {
                    r.push(target_node);
                }
            }
        }
        return r;
    }

    onAfterExecuteNode(param, options) {
        var trigS = this.findOutputSlot("onExecuted");
        if (trigS != -1) {

            //console.debug(this.id+":"+this.order+" triggering slot onAfterExecute");
            //console.debug(param);
            //console.debug(options);
            this.triggerSlot(trigS, param, null, options);

        }
    }
   
    /**
         * Triggers an action, wrapped by logics to control execution flow
         * @method actionDo
         * @param {String} action name
         * @param {*} param
         */
    actionDo(action, param, options) {
        options = options || {};
        if (this.onAction) {

            // enable this to give the event an ID
            if (!options.action_call)
                options.action_call = this.id + "_" + (action ? action : "action") + "_" + Math.floor(Math.random() * 9999);

            this.graph.nodes_actioning[this.id] = (action ? action : "actioning"); //.push(this.id);

            this.onAction(action, param, options);

            this.graph.nodes_actioning[this.id] = false; //.pop();


            // save execution/action ref
            if (options && options.action_call) {
                this.action_call = options.action_call; // if (param)
                this.graph.nodes_executedAction[this.id] = options.action_call;
            }
        }
        this.action_triggered = 2; // the nFrames it will be used (-- each step), means "how old" is the event
        if (this.onAfterExecuteNode)
            this.onAfterExecuteNode(param, options);
    }
    
    /**
         * add a new property to this node
         * @method addProperty
         * @param {string} name
         * @param {*} default_value
         * @param {string} type string defining the output type ("vec3","number",...)
         * @param {Object} extra_info this can be used to have special properties of the property (like values, etc)
         */
    addProperty(name, default_value, type, extra_info) {

        if (type === undefined) type = typeof default_value
        var o = { name: name, type: type, default_value: default_value };
        if (extra_info) {
            for (var i in extra_info) {
                o[i] = extra_info[i];
            }
        }


        if (!this.properties) {
            this.properties = {};
        }
        this.properties[name] = default_value;
        return o;
    }

    removeProperty(name) {
        delete this.properties[name];
    }
    //connections
    /**
         * add a new output slot to use in this node
         * @method addOutput
         * @param {string} name
         * @param {string} type string defining the output type ("vec3","number",...)
         * @param {Object} extra_info this can be used to have special properties of an output (label, special color, position, etc)
         */
    addOutput(name, type, extra_info, label) {
        label = label || name;
        var output = { name: name, type: type, links: null, label: label };
        if (extra_info) {
            for (var i in extra_info) {
                output[i] = extra_info[i];
            }
        }

        NodeCore.getOutputs(this.properties).push(output);
        if (this.onOutputAdded) {
            this.onOutputAdded(output);
        }

        return output;
    }
    /**
         * add a new output slot to use in this node
         * @method addOutputs
         * @param {Array} array of triplets like [[name,type,extra_info],[...]]
         */
    addOutputs(array) {
        for (var i = 0; i < array.length; ++i) {
            var info = array[i];
            var o = { name: info[0], type: info[1], link: null };
            if (array[2]) {
                for (var j in info[2]) {
                    o[j] = info[2][j];
                }
            }

            NodeCore.getOutputs(this.properties).push(o);
            if (this.onOutputAdded) {
                this.onOutputAdded(o);
            }

        }
    }
    /**
         * remove an existing output slot
         * @method removeOutput
         * @param {number} slot
         */
    removeOutput(slot) {
        this.disconnectOutput(slot);
        NodeCore.getOutputs(this.properties).splice(slot, 1);
        for (var i = slot; i < NodeCore.getOutputs(this.properties).length; ++i) {
            if (!NodeCore.getOutputs(this.properties)[i] || !NodeCore.getOutputs(this.properties)[i].links) {
                continue;
            }
            var links = NodeCore.getOutputs(this.properties)[i].links;
            for (var j = 0; j < links.length; ++j) {
                var link = this.graph.links[links[j]];
                if (!link) {
                    continue;
                }
                link.origin_slot -= 1;
            }
        }

        if (this.onOutputRemoved) {
            this.onOutputRemoved(slot);
        }
    }

    updateProperties(name, type, val) {
        this.properties[name][type] = val;
        window.sendToServer("updateNode", {"nodeID":this.id, "newData": {"properties": this.properties}});

    }
    addInputByName(name) {
        this.updateProperties(name, "input", true);
        let prop = this.properties[name];
        this.addInput(name, prop.defaultValue, prop.label)
        window.sendToServer("addInput", {"nodeID":this.id, "newData": {"input": this.properties[name]}});

        window.updateEditDialog();
    }

    addOutputByName(name) {
        this.updateProperties(name, "output", true);

        let prop = this.properties[name];
        this.addOutput(name, prop.type, null, prop.label)
        window.updateEditDialog();
    }
    /**
         * add a new input slot to use in this node
         * @method addInput
         * @param {string} name
         * @param {string} type string defining the input type ("vec3","number",...), it its a generic one use 0
         * @param {Object} extra_info this can be used to have special properties of an input (label, color, position, etc)
         */
    addInput(name, defaultValue, label, extra_info) {
        defaultValue = defaultValue || 0;
        label = label || name;
        var input = { name: name, link: [], label: label };
        if (extra_info) {
            for (var i in extra_info) {
                input[i] = extra_info[i];
            }
        }

        NodeCore.getInputs(this.properties).push(input);

        if (this.onInputAdded) {
            this.onInputAdded(input);
        }

        return input;
    }
    
    removeInputByName(name) {
        this.updateProperties(name, "input", false);

        let slot = NodeCore.getInputs(this.properties).findIndex(item => item.name === name)
        if (slot >= 0) {
            this.removeInput(slot);
        }
        window.updateEditDialog();
    }

    removeOutputByName(name) {
        this.updateProperties(name, "output", false);
        let slot = NodeCore.getOutputs(this.properties).findIndex(item => item.name === name)
        if (slot >= 0) {
            this.removeOutput(slot);
        }
        window.updateEditDialog();
    }

    /**
         * remove an existing input slot
         * @method removeInput
         * @param {number} slot
         */
    removeInput(slot) {
        this.disconnectInput(slot);
        var slot_info = NodeCore.getInputs(this.properties).splice(slot, 1);
        for (var i = slot; i < NodeCore.getInputs(this.properties).length; ++i) {
            if (!NodeCore.getInputs(this.properties)[i]) {
                continue;
            }
            var link = this.graph.links[NodeCore.getInputs(this.properties)[i].link];
            if (!link) {
                continue;
            }
            link.target_slot -= 1;
        }
        if (this.onInputRemoved) {
            this.onInputRemoved(slot, slot_info[0]);
        }
    }

    /**
         * returns all the info available about a property of this node.
         *
         * @method getPropertyInfo
         * @param {String} property name of the property
         * @return {Object} the object with all the available info
        */
    getPropertyInfo(property) {
        var info = null;

        //litescene mode using the constructor
        if (this.constructor["@" + property])
            info = this.constructor["@" + property];

        if (this.constructor.widgets_info && this.constructor.widgets_info[property])
            info = this.constructor.widgets_info[property];

        //litescene mode using the constructor
        if (!info && this.onGetPropertyInfo) {
            info = this.onGetPropertyInfo(property);
        }

        if (!info)
            info = {};
        if (!info.type)
            info.type = typeof this.properties[property];
        if (info.widget == "combo")
            info.type = "enum";

        return info;
    }
   
    /**
         * returns the input slot with a given name (used for dynamic slots), -1 if not found
         * @method findInputSlot
         * @param {string} name the name of the slot
         * @param {boolean} returnObj if the obj itself wanted
         * @return {number_or_object} the slot (-1 if not found)
         */
    findInputSlot(name, returnObj) {
        if (!NodeCore.getInputs(this.properties)) {
            return -1;
        }
        for (var i = 0, l = NodeCore.getInputs(this.properties).length; i < l; ++i) {
            if (name == NodeCore.getInputs(this.properties)[i].name) {
                return !returnObj ? i : NodeCore.getInputs(this.properties)[i];
            }
        }
        return -1;
    }

    /**
         * returns the output slot with a given name (used for dynamic slots), -1 if not found
         * @method findOutputSlot
         * @param {string} name the name of the slot
         * @param {boolean} returnObj if the obj itself wanted
         * @return {number_or_object} the slot (-1 if not found)
         */
    findOutputSlot(name, returnObj) {
        returnObj = returnObj || false;
        if (!NodeCore.getOutputs(this.properties)) {
            return -1;
        }
        for (var i = 0, l = NodeCore.getOutputs(this.properties).length; i < l; ++i) {
            if (name == NodeCore.getOutputs(this.properties)[i].name) {
                return !returnObj ? i : NodeCore.getOutputs(this.properties)[i];
            }
        }
        return -1;
    }

    static getInputs(prop) {
        if (prop) {
            return Object.values(prop).filter(obj => (obj.input == true));
        } else {
            return [];
        }
    }

    static getOutputs(prop) {
        if (prop) {
            return Object.values(prop).filter(obj => (obj.output == true));
        } else {
            return [];
        }
    }

    /**
         * connect this node output to the input of another node
         * @method connect
         * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
         * @param {LGraphNode} node the target node
         * @param {number_or_string} target_slot the input slot of the target node (could be the number of the slot or the string with the name of the slot, or -1 to connect a trigger)
         * @return {Object} the link_info is created, otherwise null
         */
    connect(slot, target_node, target_slot, id) {
        if (!this.graph) {
            //could be connected before adding it to a graph
            console.log(
                "Connect: Error, node doesn't belong to any graph. Nodes must be added first to a graph before connecting them."
            ); //due to link ids being associated with graphs
            return null;
        }

        //seek for the output slot
        if (slot.constructor === String) {
            slot = this.getOutputByName(slot);
            if (slot == -1) {
                if (window.LiteGraph.debug) {
                    console.log("Connect: Error, no slot:" + slot);
                }
                return null;
            }
        } else if (!NodeCore.getOutputs(this.properties) || slot >= NodeCore.getOutputs(this.properties).length) {
            if (window.LiteGraph.debug) {
                console.log("Connect: Error, slot number not found");
            }
            return null;
        }


        target_node = this.graph.getNodeById(target_node);

        if (!target_node) {
            throw "target node is null";
        }

        //seek for the output slot
        if (target_slot.constructor === String) {
            target_slot = target_node.getInputByName(target_slot);
        } 

        var link_info = new LLink(id, "number", this.id,slot.name, target_node.id, target_slot.name);


        //add to graph links list
        this.graph.links[link_info.id] = link_info;

        if (slot.links == null) slot.links = [];
        if (target_slot.links == null) target_slot.links = [];
        slot.links.push(link_info.id);
        target_slot.links.push(link_info.id);
        if (this.graph) {
            this.graph._version++;
        }


        return link_info;
    }
    
    /**
         * disconnect one output to an specific node
         * @method disconnectOutput
         * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
         * @param {LGraphNode} target_node the target node to which this slot is connected [Optional, if not target_node is specified all nodes will be disconnected]
         * @return {boolean} if it was disconnected successfully
         */
    disconnectOutput(link) {
        var output = this.getOutputByName(link.origin_slot);
        if (!output) {
            return false;
        }

        var link_id = link.id;
        if (link_id != null && output && output.links) {
            // Find the index of the value you want to remove
            let indexToRemove = output.links.indexOf(link_id);

            // Check if the value exists in the array
            if (indexToRemove !== -1) {
                // Use splice to remove the value
                output.links.splice(indexToRemove, 1);
                console.log(`Removed ${link_id} from the array.`);
            } else {
                console.log(`${link_id} not found in the array.`);
            }

        } //link != null


        return true;
    }
    /**
         * disconnect one input
         * @method disconnectInput
         * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
         * @return {boolean} if it was disconnected successfully
         */
    disconnectInput(link) {
        var input = this.getInputByName(link.target_slot);
        if (!input) return false;
        if (!input.links) return false;

        var link_id = link.id;
        if (link_id != null) {
            // Find the index of the value you want to remove
            let indexToRemove = input.links.indexOf(link_id);

            // Check if the value exists in the array
            if (indexToRemove !== -1) {
                // Use splice to remove the value
                input.links.splice(indexToRemove, 1);
                console.log(`Removed ${link_id} from the array.`);
            } else {
                console.log(`${link_id} not found in the array.`);
            }

        } //link != null

        return true;
    }
   

}
