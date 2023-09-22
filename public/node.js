import { NodiEnums } from "./enums.js";

import LLink from "./link.js"
// *************************************************************
//   Node CLASS                                          *******
// *************************************************************

/*
title: string
pos: [x,y]
size: [x,y]

input|output: every connection
    +  { name:string, type:string, pos: [x,y]=Optional, direction: "input"|"output", links: Array });

general properties:
    + clip_area: if you render outside the node, it will be clipped
    + unsafe_execution: not allowed for safe execution
    + skip_repeated_outputs: when adding new outputs, it wont show if there is one already connected
    + resizable: if set to false it wont be resizable with the mouse
    + horizontal: slots are distributed horizontally
    + widgets_start_y: widgets start at y distance from the top of the node

flags object:
    + collapsed: if it is collapsed

supported callbacks:
    + onAdded: when added to graph (warning: this is called BEFORE the node is configured when loading)
    + onRemoved: when removed from graph
    + onStart:	when the graph starts playing
    + onStop:	when the graph stops playing
    + onDrawForeground: render the inside widgets inside the node
    + onDrawBackground: render the background area inside the node (only in edit mode)
    + onMouseDown
    + onMouseMove
    + onMouseUp
    + onMouseEnter
    + onMouseLeave
    + onExecute: execute the node
    + onPropertyChanged: when a property is changed in the panel (return true to skip default behaviour)
    + getProps: returns an array of possible inputs
    + onBounding: in case this node has a bigger bounding than the node itself (the callback receives the bounding as [x,y,w,h])
    + onDblClick: double clicked in the node
    + onInputDblClick: input slot double clicked (can be used to automatically create a node connected)
    + onOutputDblClick: output slot double clicked (can be used to automatically create a node connected)
    + onConfigure: called after the node has been configured
    + onSerialize: to add extra info when serializing (the callback receives the object that should be filled with the data)
    + onSelected
    + onDeselected
    + onDropItem : DOM item dropped over the node
    + onDropFile : file dropped over the node
    + onConnectInput : if returns false the incoming connection will be canceled
    + onConnectionsChange : a connection changed (new one or removed) (LiteGraph.INPUT or LiteGraph.OUTPUT, slot, true if connected, link_info, input_info )
    + onAction: action slot triggered
    + getExtraMenuOptions: to add option to context menu
*/

/**
 * Base Class for all the node type classes
 * @class LGraphNode
 * @param {String} name a name for the node
 */

export default class LGraphNode {
    constructor(title) {
        this.title = title;
        this.size = [window.LiteGraph.NODE_WIDTH, 60];
        this.graph = null;
        this.update = false;
        this.pos = [0, 0];

        this.id = -1; //not know till not added
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

        if (!info.title) {
            this.title = this.constructor.title;
        }

        for (let i = 0; i < this.getInputs().length; ++i) {
            var input = this.getInputs()[i];
            var link_info = this.graph ? this.graph.links[input.link] : null;
            if (this.onConnectionsChange)
                this.onConnectionsChange(window.LiteGraph.INPUT, i, true, link_info, input); //link_info has been created now, so its updated

            if (this.onInputAdded)
                this.onInputAdded(input);

        }

        for (let i = 0; i < this.getOutputs().length; ++i) {
            var output = this.getOutputs()[i];
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
    setProperty(name, type, value, label, extra_info) {
        if (!this.properties) {
            this.properties = {};
        }
        this.properties[name] = {}
        if (value === this.properties[name])
            return;
        var prev_value = this.properties[name];
        var prop = this.properties[name];
        prop.name = name;
        prop.value = value;
        prop.type = type;
        prop.label = label;
        if (extra_info) {
            for (var i in extra_info) {
                this.properties[name][i] = extra_info[i];
            }
        }
        if (this.onPropertyChanged) {
            if (this.onPropertyChanged(name, value, prev_value) === false) //abort change
                this.properties[name] = prev_value;
        }
        if (prop.input) {
            this.addInput(name, type, value, label, extra_info)
        }
        if (prop.output) {
            this.addOutput(name, type, extra_info, label )
        }
        if (this.widgets) //widgets could be linked to properties
            for (var i = 0; i < this.widgets.length; ++i) {
                var w = this.widgets[i];
                if (!w)
                    continue;
                if (w.options.property == name) {
                    w.value = value;
                    break;
                }
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
        if (slot == -1 || slot >= this.getOutputs().length) {
            return;
        }

        var output_info = this.getOutputs()[slot];
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
        return this.getInputs()[slot]?.value;
    }

    /**
         * Retrieves the input data from one slot using its name instead of slot number
         * @method getInputDataByName
         * @param {String} slot_name
         * @param {boolean} force_update if set to true it will force the connected node of this slot to output data into this link
         * @return {*} data or if it is not connected returns null
         */
    getInputDataByName(slot_name,
        force_update) {
        var slot = this.findInputSlot(slot_name);
        if (slot == -1) {
            return null;
        }
        return this.getInputData(slot, force_update);
    }
    /**
         * tells you if there is a connection in one input slot
         * @method isInputConnected
         * @param {number} slot
         * @return {boolean}
         */
    isInputConnected(slot) {
        return slot < this.getInputs().length && this.getInputs()[slot]?.links.length > 0;
    }

    /**
         * Returns the link info in the connection of an input slot
         * @method getInputLink
         * @param {number} slot
         * @return {LLink} object or null
         */
    getInputLink(slot) {
        if (!this.getInputs()) {
            return null;
        }
        if (slot < this.getInputs().length) {
            var slot_info = this.getInputs()[slot];
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

        if (slot >= this.getInputs().length) {
            return null;
        }
        var input = this.getInputs()[slot];
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
        if (this.properties) {
            return Object.values(this.properties).filter(obj => (obj.input == true && obj.name == name))[0];
        } else {
            return [];
        }
    }
    setInputDataByName(name, val) {
        for (let i = 0; i < this.getInputs().length; i++) {
            if (this.getInputs()[i].name === name) {
              this.getInputs()[i].value = val;
            }
          }
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
        if (!this.getOutputs()) {
            return null;
        }
        if (slot >= this.getOutputs().length) {
            return null;
        }

        var info = this.getOutputs()[slot];
        return info.value;
    }

    getOutputByName(name) {
        for (let i = 0; i < this.getOutputs().length; i++) {
            if (this.getOutputs()[i].name === name) {
              return this.getOutputs()[i];
            }
          }
    }

    getOutputDataByName(name) {
        for (let i = 0; i < this.getOutputs().length; i++) {
            if (this.getOutputs()[i].name === name) {
              return this.getOutputs()[i].value;
            }
          }
    }
    setOutputDataByName(name, val) {
        for (let i = 0; i < this.getOutputs().length; i++) {
            if (this.getOutputs()[i].name === name) {
              this.getOutputs()[i].value = val;
            }
          }
    }

    /**
         * tells you if there is a connection in one output slot
         * @method isOutputConnected
         * @param {number} slot
         * @return {boolean}
         */
    isOutputConnected(slot) {
        if (!this.getOutputs()) {
            return false;
        }
        return (
            slot < this.getOutputs().length &&
            this.getOutputs()[slot].links &&
            this.getOutputs()[slot].links.length
        );
    }
    /**
         * tells you if there is any connection in the output slots
         * @method isAnyOutputConnected
         * @return {boolean}
         */
    isAnyOutputConnected() {
        if (!this.getOutputs()) {
            return false;
        }
        for (var i = 0; i < this.getOutputs().length; ++i) {
            if (this.getOutputs()[i].links && this.getOutputs()[i].links.length) {
                return true;
            }
        }
        return false;
    }
    /**
         * retrieves all the nodes connected to this output slot
         * @method getOutputNodes
         * @param {number} slot
         * @return {array}
         */
    getOutputNodes(slot) {
        if (!this.getOutputs() || this.getOutputs().length == 0) {
            return null;
        }

        if (slot >= this.getOutputs().length) {
            return null;
        }

        var output = this.getOutputs()[slot];
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
    addOnTriggerInput() {
        var trigS = this.findInputSlot("onTrigger");
        if (trigS == -1) { //!trigS || 
            this.addInput("onTrigger", window.LiteGraph.EVENT, { optional: true, nameLocked: true });
            return this.findInputSlot("onTrigger");
        }
        return trigS;
    }
    addOnExecutedOutput() {
        var trigS = this.findOutputSlot("onExecuted");
        if (trigS == -1) { //!trigS || 
            this.addOutput("onExecuted", window.LiteGraph.ACTION, { optional: true, nameLocked: true });
            return this.findOutputSlot("onExecuted");
        }
        return trigS;
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
    changeMode(modeTo) {
        switch (modeTo) {
            case window.LiteGraph.ON_EVENT:
                // this.addOnExecutedOutput();
                break;

            case window.LiteGraph.ON_TRIGGER:
                this.addOnTriggerInput();
                this.addOnExecutedOutput();
                break;

            case window.LiteGraph.NEVER:
                break;

            case window.LiteGraph.ALWAYS:
                break;

            case window.LiteGraph.ON_REQUEST:
                break;

            default:
                return false;
        }
        return true;
    }
    /**
         * Triggers the node code execution, place a boolean/counter to mark the node as being executed
         * @method execute
         * @param {*} param
         * @param {*} options
         */
    doExecute(param, options) {
        options = options || {};
        if (this.onExecute) {

            // enable this to give the event an ID
            if (!options.action_call)
                options.action_call = this.id + "_exec_" + Math.floor(Math.random() * 9999);

            this.graph.nodes_executing[this.id] = true; //.push(this.id);

            this.onExecute(param, options);

            this.graph.nodes_executing[this.id] = false; //.pop();


            // save execution/action ref
            this.exec_version = this.graph.iteration;
            if (options && options.action_call) {
                this.action_call = options.action_call; // if (param)
                this.graph.nodes_executedAction[this.id] = options.action_call;
            }
        }
        this.execute_triggered = 2; // the nFrames it will be used (-- each step), means "how old" is the event
        if (this.onAfterExecuteNode)
            this.onAfterExecuteNode(param, options); // callback
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
         * Triggers an event in this node, this will trigger any output with the same name
         * @method trigger
         * @param {String} event name ( "on_play", ... ) if action is equivalent to false then the event is send to all
         * @param {*} param
         */
    trigger(action, param, options) {
        if (!this.getOutputs() || !this.getOutputs().length) {
            return;
        }

        if (this.graph)
            this.graph._last_trigger_time = NodiEnums.getTime();

        for (var i = 0; i < this.getOutputs().length; ++i) {
            var output = this.getOutputs()[i];
            if (!output || output.type !== NodiEnums.EVENT || (action && output.name != action))
                continue;
            this.triggerSlot(i, param, null, options);
        }
    }
    /**
         * Triggers a slot event in this node: cycle output slots and launch execute/action on connected nodes
         * @method triggerSlot
         * @param {Number} slot the index of the output slot
         * @param {*} param
         * @param {Number} link_id [optional] in case you want to trigger and specific output link in a slot
         */
    triggerSlot(slot, param, link_id, options) {
        options = options || {};
        if (!this.getOutputs()) {
            return;
        }

        if (slot == null) {
            console.error("slot must be a number");
            return;
        }

        if (slot.constructor !== Number)
            console.warn("slot must be a number, use node.trigger('name') if you want to use a string");

        var output = this.getOutputs()[slot];
        if (!output) {
            return;
        }

        var links = output.links;
        if (!links || !links.length) {
            return;
        }

        if (this.graph) {
            this.graph._last_trigger_time = NodiEnums.getTime();
        }

        //for every link attached here
        for (var k = 0; k < links.length; ++k) {
            var id = links[k];
            if (link_id != null && link_id != id) {
                //to skip links
                continue;
            }
            var link_info = this.graph.links[links[k]];
            if (!link_info) {
                //not connected
                continue;
            }
            link_info._last_time = NodiEnums.getTime();
            var node = this.graph.getNodeById(link_info.target_id);
            if (!node) {
                //node not found?
                continue;
            }

            //used to mark events in graph
            var target_connection = node.getInputs()[link_info.target_slot];

             if (node.onAction) {
                // generate unique action ID if not present
                if (!options.action_call)
                    options.action_call = this.id + "_act_" + Math.floor(Math.random() * 9999);
                //pass the action name
                target_connection = node.getInputs()[link_info.target_slot];
                // wrap node.onAction(target_connection.name, param);
                node.actionDo(target_connection.name, param, options);
            }
        }
    }
    /**
         * clears the trigger slot animation
         * @method clearTriggeredSlot
         * @param {Number} slot the index of the output slot
         * @param {Number} link_id [optional] in case you want to trigger and specific output link in a slot
         */
    clearTriggeredSlot(slot, link_id) {
        if (!this.getOutputs()) {
            return;
        }

        var output = this.getOutputs()[slot];
        if (!output) {
            return;
        }

        var links = output.links;
        if (!links || !links.length) {
            return;
        }

        //for every link attached here
        for (var k = 0; k < links.length; ++k) {
            var id = links[k];
            if (link_id != null && link_id != id) {
                //to skip links
                continue;
            }
            var link_info = this.graph.links[links[k]];
            if (!link_info) {
                //not connected
                continue;
            }
            link_info._last_time = 0;
        }
    }
    /**
         * changes node size and triggers callback
         * @method setSize
         * @param {vec2} size
         */
    setSize(size) {
        if (!this.constructor.fixsize) {
            this.size = [window.LiteGraph.CANVAS_GRID_SIZE * Math.round(size[0] / window.LiteGraph.CANVAS_GRID_SIZE),
            window.LiteGraph.CANVAS_GRID_SIZE * Math.round(size[1] / window.LiteGraph.CANVAS_GRID_SIZE)];
        }
        if (this.onResize)
            this.onResize(this.size);
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

        if (!this.getOutputs()) {
            this.getOutputs() = [];
        }
        this.getOutputs().push(output);
        if (this.onOutputAdded) {
            this.onOutputAdded(output);
        }

        if (window.LiteGraph.auto_load_slot_types)
            window.LiteGraph.registerNodeAndSlotType(this, type, true);

        this.setSize(this.computeSize());
        this.setDirtyCanvas(true, true);
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

            if (!this.getOutputs()) {
                this.getOutputs() = [];
            }
            this.getOutputs().push(o);
            if (this.onOutputAdded) {
                this.onOutputAdded(o);
            }

            if (window.LiteGraph.auto_load_slot_types)
                window.LiteGraph.registerNodeAndSlotType(this, info[1], true);

        }

        this.setSize(this.computeSize());
        this.setDirtyCanvas(true, true);
    }
    /**
         * remove an existing output slot
         * @method removeOutput
         * @param {number} slot
         */
    removeOutput(slot) {
        this.disconnectOutput(slot);
        this.getOutputs().splice(slot, 1);
        for (var i = slot; i < this.getOutputs().length; ++i) {
            if (!this.getOutputs()[i] || !this.getOutputs()[i].links) {
                continue;
            }
            var links = this.getOutputs()[i].links;
            for (var j = 0; j < links.length; ++j) {
                var link = this.graph.links[links[j]];
                if (!link) {
                    continue;
                }
                link.origin_slot -= 1;
            }
        }

        this.setSize(this.computeSize());
        if (this.onOutputRemoved) {
            this.onOutputRemoved(slot);
        }
        this.setDirtyCanvas(true, true);
    }

    updateProperties(name, type, val) {
        this.properties[name][type] = val;
        window.socket.emit("updateNode", {"nodeID":this.id, "newData": {"properties": this.properties}});

    }
    addInputByName(name) {
        this.updateProperties(name, "input", true);
        let prop = this.properties[name];
        this.addInput(name, prop.type, prop.defaultValue, prop.label)
        window.socket.emit("addInput", {"nodeID":this.id, "newData": {"input": this.properties[name]}});

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
    addInput(name, type, defaultValue, label, extra_info) {
        type = type || "number";
        defaultValue = defaultValue || 0;
        label = label || name;
        var input = { name: name, type: type, link: null, label: label };
        if (extra_info) {
            for (var i in extra_info) {
                input[i] = extra_info[i];
            }
        }

        this.getInputs().push(input);
        this.setSize(this.computeSize());

        if (this.onInputAdded) {
            this.onInputAdded(input);
        }

        window.LiteGraph.registerNodeAndSlotType(this, type);
        this.setDirtyCanvas(true, true);
        return input;
    }
    

    removeInputByName(name) {
        this.updateProperties(name, "input", false);

        let slot = this.getInputs().findIndex(item => item.name === name)
        if (slot >= 0) {
            this.removeInput(slot);
        }
        window.updateEditDialog();
    }

    removeOutputByName(name) {
        this.updateProperties(name, "output", false);
        let slot = this.getOutputs().findIndex(item => item.name === name)
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
        var slot_info = this.getInputs().splice(slot, 1);
        for (var i = slot; i < this.getInputs().length; ++i) {
            if (!this.getInputs()[i]) {
                continue;
            }
            var link = this.graph.links[this.getInputs()[i].link];
            if (!link) {
                continue;
            }
            link.target_slot -= 1;
        }
        this.setSize(this.computeSize());
        if (this.onInputRemoved) {
            this.onInputRemoved(slot, slot_info[0]);
        }
        this.setDirtyCanvas(true, true);
    }

    /**
         * computes the minimum size of a node according to its inputs and output slots
         * @method computeSize
         * @param {number} minHeight
         * @return {number} the total size
         */
    computeSize(out) {
        if (this.constructor.size) {
            return this.constructor.size.concat();
        }

        var rows = Math.max(this.getInputs().length , this.getInputs().length);
        if (rows < 1) rows = 1;
        var size = out || new Float32Array([0, 0]);
        rows = Math.max(rows, 1);
        var font_size = window.LiteGraph.NODE_TEXT_SIZE; //although it should be graphcanvas.inner_text_font size

        var input_width = 0;
        var output_width = 0;


        for (var i = 0, l = this.getInputs().length; i < l; ++i) {
            var input = this.getInputs()[i];
            var text = input.label || input.name || "";
            var text_width = compute_text_size(text);
            if (input_width < text_width) {
                input_width = text_width;
            }
        }

        if (this.getOutputs()) {
            for (let i = 0, l = this.getOutputs().length; i < l; ++i) {
                var output = this.getOutputs()[i];
                let text = output.label || output.name || "";
                let text_width = compute_text_size(text);
                if (output_width < text_width) {
                    output_width = text_width;
                }
            }
        }

        size[0] = Math.max(input_width + output_width + 10, 32);
        size[0] = Math.max(size[0], window.LiteGraph.NODE_WIDTH);
        if (this.widgets && this.widgets.length) {
            size[0] = Math.max(size[0], window.LiteGraph.NODE_WIDTH * 1.5);
        }

        size[1] = (this.constructor.slot_start_y || 0) + rows * window.LiteGraph.NODE_SLOT_HEIGHT;

        var widgets_height = 0;
        if (this.widgets && this.widgets.length) {
            for (let i = 0, l = this.widgets.length; i < l; ++i) {
                if (this.widgets[i].computeSize)
                    widgets_height += this.widgets[i].computeSize(size[0])[1] + 4;

                else
                    widgets_height += window.LiteGraph.NODE_WIDGET_HEIGHT + 4;
            }
            widgets_height += 8;
        }

        //compute height using widgets height
        if (this.widgets_up)
            size[1] = Math.max(size[1], widgets_height);
        else if (this.widgets_start_y != null)
            size[1] = Math.max(size[1], widgets_height + this.widgets_start_y);

        else
            size[1] += widgets_height;

        function compute_text_size(text) {
            if (!text) {
                return 0;
            }
            return font_size * text.length * 0.6;
        }

        if (this.constructor.min_height &&
            size[1] < this.constructor.min_height) {
            size[1] = this.constructor.min_height;
        }

        size[1] += 6; //margin

        return size;
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
         * Defines a widget inside the node, it will be rendered on top of the node, you can control lots of properties
         *
         * @method addWidget
         * @param {String} type the widget type (could be "number","string","combo"
         * @param {String} name the text to show on the widget
         * @param {String} value the default value
         * @param {Function|String} callback function to call when it changes (optionally, it can be the name of the property to modify)
         * @param {Object} options the object that contains special properties of this widget
         * @return {Object} the created widget object
         */
    addWidget(type, name, value, callback, options) {
        if (!this.widgets) {
            this.widgets = [];
        }

        if (!options && callback && callback.constructor === Object) {
            options = callback;
            callback = null;
        }

        if (options && options.constructor === String) //options can be the property name
            options = { property: options };

        if (callback && callback.constructor === String) //callback can be the property name
        {
            if (!options)
                options = {};
            options.property = callback;
            callback = null;
        }

        if (callback && callback.constructor !== Function) {
            console.warn("addWidget: callback must be a function");
            callback = null;
        }

        var w = {
            type: type.toLowerCase(),
            name: name,
            value: value,
            callback: callback,
            options: options || {}
        };

        if (w.options.y !== undefined) {
            w.y = w.options.y;
        }

        if (!callback && !w.options.callback && !w.options.property) {
            console.warn("window.LiteGraph addWidget(...) without a callback or property assigned");
        }
        if (type == "combo" && !w.options.values) {
            throw "window.LiteGraph addWidget('combo',...) requires to pass values in options: { values:['red','blue'] }";
        }
        this.widgets.push(w);
        this.setSize(this.computeSize());
        return w;
    }
    addCustomWidget(custom_widget) {
        if (!this.widgets) {
            this.widgets = [];
        }
        this.widgets.push(custom_widget);
        return custom_widget;
    }
    /**
         * returns the bounding of the object, used for rendering purposes
         * bounding is: [topleft_cornerx, topleft_cornery, width, height]
         * @method getBounding
         * @return {Float32Array[4]} the total size
         */
    getBounding(out) {
        out = out || new Float32Array(4);
        out[0] = this.pos[0] - 4;
        out[1] = this.pos[1] - window.LiteGraph.NODE_TITLE_HEIGHT;
        out[2] = this.size[0] + 4;
        out[3] =  this.size[1] + window.LiteGraph.NODE_TITLE_HEIGHT;

        if (this.onBounding) {
            this.onBounding(out);
        }
        return out;
    }
    /**
         * checks if a point is inside the shape of a node
         * @method isPointInside
         * @param {number} x
         * @param {number} y
         * @return {boolean}
         */
    isPointInside(x, y, margin, skip_title) {
        margin = margin || 0;

        var margin_top = this.graph && this.graph.isLive() ? 0 : window.LiteGraph.NODE_TITLE_HEIGHT;
        if (skip_title) {
            margin_top = 0;
        }
        if (this.pos[0] - 4 - margin < x &&
            this.pos[0] + this.size[0] + 4 + margin > x &&
            this.pos[1] - margin_top - margin < y &&
            this.pos[1] + this.size[1] + margin > y) {
            return true;
        }
        return false;
    }
    /**
         * checks if a point is inside a node slot, and returns info about which slot
         * @method getSlotInPosition
         * @param {number} x
         * @param {number} y
         * @return {Object} if found the object contains { input|output: slot object, slot: number, link_pos: [x,y] }
         */
    getSlotInPosition(x, y) {
        //search for inputs
        var link_pos = new Float32Array(2);
        if (this.getInputs()) {
            for (var i = 0, l = this.getInputs().length; i < l; ++i) {
                var input = this.getInputs()[i];
                this.getConnectionPos(true, i, link_pos);
                if (Math.isInsideRectangle(
                    x,
                    y,
                    link_pos[0] - 10,
                    link_pos[1] - 5,
                    20,
                    10
                )) {
                    return { input: input, slot: i, link_pos: link_pos };
                }
            }
        }

        if (this.getOutputs()) {
            for (let i = 0, l = this.getOutputs().length; i < l; ++i) {
                var output = this.getOutputs()[i];
                this.getConnectionPos(false, i, link_pos);
                if (Math.isInsideRectangle(
                    x,
                    y,
                    link_pos[0] - 10,
                    link_pos[1] - 5,
                    20,
                    10
                )) {
                    return { output: output, slot: i, link_pos: link_pos };
                }
            }
        }

        return null;
    }
    /**
         * returns the input slot with a given name (used for dynamic slots), -1 if not found
         * @method findInputSlot
         * @param {string} name the name of the slot
         * @param {boolean} returnObj if the obj itself wanted
         * @return {number_or_object} the slot (-1 if not found)
         */
    findInputSlot(name, returnObj) {
        if (!this.getInputs()) {
            return -1;
        }
        for (var i = 0, l = this.getInputs().length; i < l; ++i) {
            if (name == this.getInputs()[i].name) {
                return !returnObj ? i : this.getInputs()[i];
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
        if (!this.getOutputs()) {
            return -1;
        }
        for (var i = 0, l = this.getOutputs().length; i < l; ++i) {
            if (name == this.getOutputs()[i].name) {
                return !returnObj ? i : this.getOutputs()[i];
            }
        }
        return -1;
    }
    // TODO refactor: USE SINGLE findInput/findOutput functions! :: merge options
    /**
         * returns the first free input slot
         * @method findInputSlotFree
         * @param {object} options
         * @return {number_or_object} the slot (-1 if not found)
         */
    findInputSlotFree(optsIn) {
        if (optsIn == null)  optsIn = {};
        var optsDef = {
            returnObj: false,
            typesNotAccepted: []
        };
        var opts = Object.assign(optsDef, optsIn);
        if (!this.getInputs()) {
            return -1;
        }
        for (var i = 0, l = this.getInputs().length; i < l; ++i) {
            if (this.getInputs()[i].links && this.getInputs()[i].links != null) {
                continue;
            }
            if (opts.typesNotAccepted && opts.typesNotAccepted.includes && opts.typesNotAccepted.includes(this.getInputs()[i].type)) {
                continue;
            }
            return !opts.returnObj ? i : this.getInputs()[i];
        }
        return -1;
    }
    /**
         * returns the first output slot free
         * @method findOutputSlotFree
         * @param {object} options
         * @return {number_or_object} the slot (-1 if not found)
         */
    findOutputSlotFree(optsIn) {
        if (optsIn == null)  optsIn = {};
        var optsDef = {
            returnObj: false,
            typesNotAccepted: []
        };
        var opts = Object.assign(optsDef, optsIn);
        if (!this.getOutputs()) {
            return -1;
        }
        for (var i = 0, l = this.getOutputs().length; i < l; ++i) {
            if (this.getOutputs()[i].links && this.getOutputs()[i].links != null) {
                continue;
            }
            if (opts.typesNotAccepted && opts.typesNotAccepted.includes && opts.typesNotAccepted.includes(this.getOutputs()[i].type)) {
                continue;
            }
            return !opts.returnObj ? i : this.getOutputs()[i];
        }
        return -1;
    }
    /**
         * findSlotByType for INPUTS
         */
    findInputSlotByType(type, returnObj, preferFreeSlot, doNotUseOccupied) {
        return this.findSlotByType(true, type, returnObj, preferFreeSlot, doNotUseOccupied);
    }
    /**
         * findSlotByType for OUTPUTS
         */
    findOutputSlotByType(type, returnObj, preferFreeSlot, doNotUseOccupied) {
        return this.findSlotByType(false, type, returnObj, preferFreeSlot, doNotUseOccupied);
    }
    /**
         * returns the output (or input) slot with a given type, -1 if not found
         * @method findSlotByType
         * @param {boolean} input uise inputs instead of outputs
         * @param {string} type the type of the slot
         * @param {boolean} returnObj if the obj itself wanted
         * @param {boolean} preferFreeSlot if we want a free slot (if not found, will return the first of the type anyway)
         * @return {number_or_object} the slot (-1 if not found)
         */
    findSlotByType(input, type, returnObj, preferFreeSlot, doNotUseOccupied) {
        input = input || false;
        returnObj = returnObj || false;
        preferFreeSlot = preferFreeSlot || false;
        doNotUseOccupied = doNotUseOccupied || false;
        var aSlots = input ? this.getInputs() : this.getOutputs();
        if (!aSlots) {
            return -1;
        }
        // !! empty string type is considered 0, * !!
        if (type == "" || type == "*")
            type = 0;
        for (var i = 0, l = aSlots.length; i < l; ++i) {
            var aSource = (type + "").toLowerCase().split(",");
            var aDest = aSlots[i].type == "0" || aSlots[i].type == "*" ? "0" : aSlots[i].type;
            aDest = (aDest + "").toLowerCase().split(",");
            for (let sI = 0; sI < aSource.length; sI++) {
                for (let dI = 0; dI < aDest.length; dI++) {
                    if (aSource[sI] == "_event_")
                        aSource[sI] = window.LiteGraph.EVENT;
                    if (aDest[sI] == "_event_")
                        aDest[sI] = window.LiteGraph.EVENT;
                    if (aSource[sI] == "*")
                        aSource[sI] = 0;
                    if (aDest[sI] == "*")
                        aDest[sI] = 0;
                    if (aSource[sI] == aDest[dI]) {
                        if (preferFreeSlot && aSlots[i].links && aSlots[i].links !== null)
                            continue;
                        return !returnObj ? i : aSlots[i];
                    }
                }
            }
        }
        // if didnt find some, stop checking for free slots
        if (preferFreeSlot && !doNotUseOccupied) {
            for (let i = 0, l = aSlots.length; i < l; ++i) {
                let aSource = (type + "").toLowerCase().split(",");
                let aDest = aSlots[i].type == "0" || aSlots[i].type == "*" ? "0" : aSlots[i].type;
                aDest = (aDest + "").toLowerCase().split(",");
                for (let sI = 0; sI < aSource.length; sI++) {
                    for (let dI = 0; dI < aDest.length; dI++) {
                        if (aSource[sI] == "*")
                            aSource[sI] = 0;
                        if (aDest[sI] == "*")
                            aDest[sI] = 0;
                        if (aSource[sI] == aDest[dI]) {
                            return !returnObj ? i : aSlots[i];
                        }
                    }
                }
            }
        }
        return -1;
    }

    getInputs() {
        if (this.properties) {
            return Object.values(this.properties).filter(obj => (obj.input == true));
        } else {
            return [];
        }
    }

    getOutputs() {
        if (this.properties) {
            return Object.values(this.properties).filter(obj => (obj.output == true));
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
    connect(slot, target_node, target_slot) {
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
        } else if (!this.getOutputs() || slot >= this.getOutputs().length) {
            if (window.LiteGraph.debug) {
                console.log("Connect: Error, slot number not found");
            }
            return null;
        }


        if (target_node && target_node.constructor === Number) {
            target_node = this.graph.getNodeById(target_node);
        }
        if (!target_node) {
            throw "target node is null";
        }

        //seek for the output slot
        if (target_slot.constructor === String) {
            target_slot = target_node.getInputByName(target_slot);
        } 

        var changed = false;

        var link_info = null;

        // allow target node to change slot
        if (target_node.onBeforeConnectInput) {
            // This way node can choose another slot (or make a new one?)
            target_slot = target_node.onBeforeConnectInput(target_slot); //callback
        }

        //allows nodes to block connection, callback
        if (target_node.onConnectInput) {
            if (target_node.onConnectInput(target_slot, output.type, output, this, slot) === false) {
                return null;
            }
        }
        if (this.onConnectOutput) { // callback
            if (this.onConnectOutput(slot, input.type, input, target_node, target_slot) === false) {
                return null;
            }
        }

        this.graph.beforeChange();
        changed = true;

        //create link class
        link_info = new LLink(this.graph.getNextID(), "number", this.id,slot.name, target_node.id, target_slot.name);

        //add to graph links list
        this.graph.links[link_info.id] = link_info;

        if (slot.links == null) slot.links = [];
        if (target_slot.links == null) target_slot.links = [];
        slot.links.push(link_info.id);
        target_slot.links.push(link_info.id);
        if (this.graph) {
            this.graph._version++;
        }
        if (this.onConnectionsChange) {
            this.onConnectionsChange(window.LiteGraph.OUTPUT, slot, true, link_info, slot);
        } //link_info has been created now, so its updated
        if (target_node.onConnectionsChange) {
            target_node.onConnectionsChange(window.LiteGraph.INPUT, target_slot, true, link_info,input );
        }
        if (this.graph && this.graph.onNodeConnectionChange) {
            this.graph.onNodeConnectionChange(window.LiteGraph.INPUT, target_node, target_slot, this, slot);
            this.graph.onNodeConnectionChange(window.LiteGraph.OUTPUT, this, slot, target_node, target_slot );
        }

        this.setDirtyCanvas(false, true);
        this.graph.afterChange();
        this.graph.connectionChange(this, link_info);

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
        if (link_id != null && output?.links) {
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

        this.setDirtyCanvas(false, true);
        if (this.graph)
            this.graph.connectionChange(this);
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
        if (!input) {
            return false;
        }

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

        this.setDirtyCanvas(false, true);
        if (this.graph)
            this.graph.connectionChange(this);
        return true;
    }
    //
         // returns the center of a connection point in canvas coords
         // @method getConnectionPos
         // @param {boolean} is_input true if if a input slot, false if it is an output
         // @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
         // @param {vec2} out [optional] a place to store the output, to free garbage
         // @return {[x,y]} the position

    getConnectionPos(is_input, slot_number, out) {
        out = out || new Float32Array(2);
        var num_slots = 0;
        if (is_input && this.getInputs()) {
            num_slots = this.getInputs().length;
        }
        if (!is_input && this.getOutputs()) {
            num_slots = this.getOutputs().length;
        }

        if (!is_input && num_slots > slot_number && this.getOutputs()[slot_number].pos) {
            out[0] = this.pos[0] + this.getOutputs()[slot_number].pos[0];
            out[1] = this.pos[1] + this.getOutputs()[slot_number].pos[1];
            return out;
        }

        //horizontal distributed slots
        if (this.horizontal) {
            out[0] =
                this.pos[0] + (slot_number + 0.5) * (this.size[0] / num_slots);
            if (is_input) {
                out[1] = this.pos[1] - window.LiteGraph.NODE_TITLE_HEIGHT;
            } else {
                out[1] = this.pos[1] + this.size[1];
            }
            return out;
        }

        //default vertical slots
        if (is_input) {
            out[0] = this.pos[0];
        } else {
            out[0] = this.pos[0] + this.size[0];
        }
        out[1] =
            this.pos[1] + (slot_number + 0.5) * window.LiteGraph.NODE_SLOT_HEIGHT +
            (this.constructor.slot_start_y || 0);
        return out;
    }
    /* Force align to grid */
    alignToGrid() {

        let gridSize = window.LiteGraph.CANVAS_GRID_SIZE
        if (this.constructor.type == "control/junction" ) gridSize /= 4;
        if (this.size[0] >= gridSize) {
            this.pos[0] = gridSize * Math.round(this.pos[0] / gridSize);
        } else {
            this.pos[0] = gridSize * (Math.round(this.pos[0] / gridSize) + 0.5) - this.size[0] / 2;
        }
        if (this.size[1] >= gridSize) {
            this.pos[1] = gridSize * Math.round(this.pos[1] / gridSize);
        }else {
            this.pos[1] = gridSize * (Math.round(this.pos[1] / gridSize) + 0.5) - this.size[1] / 2;
        }
    }
    /* Console output */
    trace(msg) {
        if (!this.console) {
            this.console = [];
        }

        this.console.push(msg);
        if (this.console.length > LGraphNode.MAX_CONSOLE) {
            this.console.shift();
        }

        if (this.graph.onNodeTrace)
            this.graph.onNodeTrace(this, msg);
    }
    /* Forces to redraw or the main canvas (LGraphNode) or the bg canvas (links) */
    setDirtyCanvas(dirty_foreground,
        dirty_background) {
        if (!this.graph) {
            return;
        }
        this.graph.sendActionToCanvas("setDirty", [
            dirty_foreground,
            dirty_background
        ]);
    }
    loadImage(url) {
        var img = new Image();
        img.src = window.LiteGraph.node_images_path + url;
        img.ready = false;

        var that = this;
        img.onload = function () {
            this.ready = true;
            that.setDirtyCanvas(true);
        };
        return img;
    }
   
    /* Allows to get onMouseMove and onMouseUp events even if the mouse is out of focus */
    captureInput(v) {
        if (!this.graph || !this.graph.list_of_graphcanvas) {
            return;
        }

        var list = this.graph.list_of_graphcanvas;

        for (var i = 0; i < list.length; ++i) {
            var c = list[i];
            //releasing somebody elses capture?!
            if (!v && c.node_capturing_input != this) {
                continue;
            }

            //change
            c.node_capturing_input = v ? this : null;
        }
    }

    /**
         * Forces the node to do not move or realign on Z
         * @method pin
         **/
    pin(v) {
        this.graph._version++;

    }
    localToScreen(x, y, graphcanvas) {
        return [
            (x + this.pos[0]) * graphcanvas.scale + graphcanvas.offset[0],
            (y + this.pos[1]) * graphcanvas.scale + graphcanvas.offset[1]
        ];
    }

    setPos(x, y) {
        this.pos[0] = x;
        this.pos[1] = y;
        this.alignToGrid();
    }
}
