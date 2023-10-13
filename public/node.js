import { NodiEnums } from "./enums.mjs";

import LLink from "./link.mjs"
import NodeCore from "./node_core.mjs";

export default class LGraphNode extends NodeCore {
    constructor(title) {
        super();
        this.title = title;
        this.setSize([window.LiteGraph.NODE_WIDTH, 64]);
        this.graph = null;
        this.update = false;
        this.type = null;
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
        if (!NodeCore.getOutputs(this.properties) || !NodeCore.getOutputs(this.properties).length) {
            return;
        }

        if (this.graph)
            this.graph._last_trigger_time = NodiEnums.getTime();

        for (var i = 0; i < NodeCore.getOutputs(this.properties).length; ++i) {
            var output = NodeCore.getOutputs(this.properties)[i];
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
        if (!NodeCore.getOutputs(this.properties)) {
            return;
        }

        if (slot == null) {
            console.error("slot must be a number");
            return;
        }

        if (slot.constructor !== Number)
            console.warn("slot must be a number, use node.trigger('name') if you want to use a string");

        var output = NodeCore.getOutputs(this.properties)[slot];
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
        if (!NodeCore.getOutputs(this.properties)) {
            return;
        }

        var output = NodeCore.getOutputs(this.properties)[slot];
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
    setSize(size, update = true) {
        if (size == null) return;
        if (!this.fixsize) {
            this.size = [window.LiteGraph.CANVAS_GRID_SIZE * Math.round(size[0] / window.LiteGraph.CANVAS_GRID_SIZE),
                         window.LiteGraph.CANVAS_GRID_SIZE * Math.round(size[1] / window.LiteGraph.CANVAS_GRID_SIZE)];
        }
        if (this.onResize) this.onResize(this.size);
        if (update) window.socket.emit("setSize", {id: this.id, size:this.size});
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

        if (!NodeCore.getOutputs(this.properties)) {
            NodeCore.getOutputs(this.properties) = [];
        }
        NodeCore.getOutputs(this.properties).push(output);
        if (this.onOutputAdded) {
            this.onOutputAdded(output);
        }

        if (window.LiteGraph.auto_load_slot_types)
            window.LiteGraph.registerNodeAndSlotType(this, type, true);

        this.setSize(this.widget.computeSize());
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

            if (!NodeCore.getOutputs(this.properties)) {
                NodeCore.getOutputs(this.properties) = [];
            }
            NodeCore.getOutputs(this.properties).push(o);
            if (this.onOutputAdded) {
                this.onOutputAdded(o);
            }

            if (window.LiteGraph.auto_load_slot_types)
                window.LiteGraph.registerNodeAndSlotType(this, info[1], true);

        }

        this.setSize(this.widget.computeSize(this.properties));
        this.setDirtyCanvas(true, true);
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

        this.setSize(this.widget.computeSize());
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
         */
    addInput(props, name, type, defaultValue, label) {
        type = type || "number";
        defaultValue = defaultValue || 0;
        label = label || name;
        var input = { name: name, type: type, link: null, label: label };

        props[name] = input;
        this.setSize(this.widget.computeSize());

        this.setDirtyCanvas(true, true);
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
        this.setSize(this.widget.computeSize());
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
    computeSize(props) {
        if (this.fixsize) {
            this.size = this.fixsize;
            return this.fixsize;
        }
        if (this.constructor.size) {
            return this.constructor.size.concat();
        }

        var rows = Math.max(NodeCore.getInputs(props).length , NodeCore.getInputs(props).length);
        if (rows < 1) rows = 1;
        var size = [0, 0];
        rows = Math.max(rows, 1);
        var font_size = window.LiteGraph.NODE_TEXT_SIZE; //although it should be graphcanvas.inner_text_font size

        var input_width = 0;
        var output_width = 0;


        for (var i = 0, l = NodeCore.getInputs(props).length; i < l; ++i) {
            var input = NodeCore.getInputs(props)[i];
            var text = input.label || input.name || "";
            var text_width = compute_text_size(text);
            if (input_width < text_width) {
                input_width = text_width;
            }
        }

        for (let i = 0, l = NodeCore.getOutputs(props).length; i < l; ++i) {
            var output = NodeCore.getOutputs(props)[i];
            let text = output.label || output.name || "";
            let text_width = compute_text_size(text);
            if (output_width < text_width) {
                output_width = text_width;
            }
        }

        size[0] = Math.max(input_width + output_width + 10, 32);
        size[0] = Math.max(size[0], window.LiteGraph.NODE_WIDTH);
        if (this.widgets && this.widgets.length) {
            size[0] = Math.max(size[0], window.LiteGraph.NODE_WIDTH * 1.5);
        }

        size[1] = (this.constructor.slot_start_y || 0) + rows * window.LiteGraph.NODE_SLOT_HEIGHT;


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
        this.setSize(this.widget.computeSize());
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

        var margin_top = 0;
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
        if (NodeCore.getInputs(this.properties)) {
            for (var i = 0, l = NodeCore.getInputs(this.properties).length; i < l; ++i) {
                var input = NodeCore.getInputs(this.properties)[i];
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

        if (NodeCore.getOutputs(this.properties)) {
            for (let i = 0, l = NodeCore.getOutputs(this.properties).length; i < l; ++i) {
                var output = NodeCore.getOutputs(this.properties)[i];
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
    
    //
         // returns the center of a connection point in canvas coords
         // @method getConnectionPos
         // @param {boolean} is_input true if if a input slot, false if it is an output
         // @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
         // @param {vec2} out [optional] a place to store the output, to free garbage
         // @return {[x,y]} the position

    getConnectionPos(is_input, slot_number, out) {
        out = out || new Float32Array(2);
        if (this.type == "control/junction") {
            out = [this.pos[0] + 8, this.pos[1] + 8];
            return out;
        }
        var num_slots = 0;
        if (is_input && NodeCore.getInputs(this.properties)) {
            num_slots = NodeCore.getInputs(this.properties).length;
        }
        if (!is_input && NodeCore.getOutputs(this.properties)) {
            num_slots = NodeCore.getOutputs(this.properties).length;
        }

        if (!is_input && num_slots > slot_number && NodeCore.getOutputs(this.properties)[slot_number].pos) {
            out[0] = this.pos[0] + NodeCore.getOutputs(this.properties)[slot_number].pos[0];
            out[1] = this.pos[1] + NodeCore.getOutputs(this.properties)[slot_number].pos[1];
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
        if (this.type == "control/junction" ) gridSize /= 4;
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
    setPos(x, y) {
        this.pos[0] = x;
        this.pos[1] = y;
        this.alignToGrid();
    }
}
