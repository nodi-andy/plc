import { NodiEnums } from "../../enums.mjs";
import LGraphCanvas from "./canvas.js"
import LLink from "./link.mjs"
import LGraphNode from "./node.js"
import NodeCore from "./node_core.mjs";
/**
 * The Global Scope. It contains all the registered node classes.
 *
 * @class LiteGraph
 * @constructor
 */
var global = window;
//basic nodes


export var LiteGraph = (global.LiteGraph = {
    VERSION: 0.1,

    CANVAS_GRID_SIZE: 64,

    NODE_TITLE_HEIGHT: 0,
    NODE_TITLE_TEXT_Y: 10,
    NODE_SLOT_HEIGHT: 64,
    NODE_WIDGET_HEIGHT: 20,
    NODE_WIDTH: 64,
    NODE_COLLAPSED_RADIUS: 10,
    NODE_COLLAPSED_WIDTH: 80,
    NODE_TITLE_COLOR: "#999",
    NODE_SELECTED_TITLE_COLOR: "#FFF",
    NODE_TEXT_SIZE: 14,
    NODE_TEXT_COLOR: "#AAA",
    NODE_SUBTEXT_SIZE: 12,
    NODE_DEFAULT_COLOR: "#333",
    NODE_DEFAULT_BGCOLOR: "#353535",
    NODE_DEFAULT_BOXCOLOR: "#666",
    NODE_DEFAULT_SHAPE: "box",
    NODE_BOX_OUTLINE_COLOR: "#FFF",
    DEFAULT_SHADOW_COLOR: "rgba(0,0,0,0.5)",
    DEFAULT_GROUP_FONT: 24,

    WIDGET_BGCOLOR: "#222",
    WIDGET_OUTLINE_COLOR: "#666",
    WIDGET_TEXT_COLOR: "#DDD",
    WIDGET_SECONDARY_TEXT_COLOR: "#999",

    LINK_COLOR: "#6B6",
    CONNECTING_LINK_COLOR: "#AFA",

    MAX_NUMBER_OF_NODES: 1000, //avoid infinite loops
    DEFAULT_POSITION: [32, 32], //default node position

    //shapes are used for nodes but also for slots
    BOX_SHAPE: 1,
    ROUND_SHAPE: 2,
    CIRCLE_SHAPE: 3,
    CARD_SHAPE: 4,
    ARROW_SHAPE: 5,
    GRID_SHAPE: 6, // intended for slot arrays

    //enums
    INPUT: 1,
    OUTPUT: 2,

    EVENT: -1, //for outputs
    ACTION: -1, //for inputs

    ALWAYS: 0,
    ON_EVENT: 1,
    NEVER: 2,
    ON_TRIGGER: 3,

    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4,
    CENTER: 5,

    LINK_RENDER_MODES: ["Straight", "Linear", "Spline"], // helper
    STRAIGHT_LINK: 0,
    LINEAR_LINK: 1,
    SPLINE_LINK: 2,

    NORMAL_TITLE: 0,
    NO_TITLE: 1,
    TRANSPARENT_TITLE: 2,
    AUTOHIDE_TITLE: 3,
    CENTRAL_TITLE: 4,
    VERTICAL_LAYOUT: "vertical", // arrange nodes vertically

    proxy: null, //used to redirect calls
    node_images_path: "",

    debug: false,
    catch_exceptions: true,
    throw_errors: true,
    allow_scripts: false, //if set to true some nodes like Formula would be allowed to evaluate code that comes from unsafe sources (like node configuration), which could lead to exploits
    registered_node_types: {}, //nodetypes by string
    node_types_by_file_extension: {}, //used for dropping files in the canvas
    Nodes: {}, //node types by classname
    Globals: {}, //used to store vars between graphs

    searchbox_extras: {}, //used to add extra features to the search box
    auto_sort_node_types: false, // [true!] If set to true, will automatically sort node types / categories in the context menus
    
    node_box_coloured_when_on: false, // [true!] this make the nodes box (top left circle) coloured when triggered (execute/action), visual feedback
    node_box_coloured_by_mode: false, // [true!] nodebox based on node mode, visual feedback
    
    dialog_close_on_mouse_leave: true, // [false on mobile] better true if not touch device, TODO add an helper/listener to close if false
    dialog_close_on_mouse_leave_delay: 500,
    
    shift_click_do_break_link_from: false, // [false!] prefer false if results too easy to break links - implement with ALT or TODO custom keys
    click_do_break_link_to: false, // [false!]prefer false, way too easy to break links
    
    search_hide_on_mouse_leave: true, // [false on mobile] better true if not touch device, TODO add an helper/listener to close if false
    search_filter_enabled: false, // [true!] enable filtering slots type in the search widget, !requires auto_load_slot_types or manual set registered_slot_[in/out]_types and slot_types_[in/out]
    search_show_all_on_open: true, // [true!] opens the results list when opening the search widget
    
    auto_load_slot_types: false, // [if want false, use true, run, get vars values to be statically set, than disable] nodes types and nodeclass association with node types need to be calculated, if dont want this, calculate once and set registered_slot_[in/out]_types and slot_types_[in/out]
    
    // set these values if not using auto_load_slot_types
    registered_slot_in_types: {}, // slot types for nodeclass
    registered_slot_out_types: {}, // slot types for nodeclass
    slot_types_in: [], // slot types IN
    slot_types_out: [], // slot types OUT
    slot_types_default_in: [], // specify for each IN slot type a(/many) deafult node(s), use single string, array, or object (with node, title, parameters, ..) like for search
    slot_types_default_out: [], // specify for each OUT slot type a(/many) deafult node(s), use single string, array, or object (with node, title, parameters, ..) like for search
    
    alt_drag_do_clone_nodes: false, // [true!] very handy, ALT click to clone and drag the new node

    
    allow_multi_output_for_events: true, // [false!] being events, it is strongly reccomended to use them sequentually, one by one

    middle_click_slot_add_default_node: false, //[true!] allows to create and connect a ndoe clicking with the third button (wheel)
    
    release_link_on_empty_shows_menu: false, //[true!] dragging a link to empty space will open a menu, add from list, search or defaults
    
    pointerevents_method: "mouse", // "mouse"|"pointer" use mouse for retrocompatibility issues? (none found @ now)

    alphabet : [],

    // TODO implement pointercancel, gotpointercapture, lostpointercapture, (pointerover, pointerout if necessary)

    /**
     * Register a node class so it can be listed when the user wants to create a new one
     * @method registerNodeType
     * @param {String} type name of the node and path
     * @param {Class} base_class class containing the structure of a node
     */

    registerNodeType: function(type, base_class) {
        if (!base_class.prototype) {
            throw "Cannot register a simple object, it must be a class with a prototype";
        }

        if (LiteGraph.debug) {
            console.log("Node registered: " + type);
        }

        var categories = type.split("/");
        var classname = base_class.name;

        base_class.category = categories[0]
        base_class.elementName = categories[1]

        if (!base_class.title) {
            base_class.title = classname;
        }
        //info.name = name.substr(pos+1,name.length - pos);

        //extend class
        if (base_class.prototype) {
            //is a class
            for (var i in LGraphNode.prototype) {
                if (!base_class.prototype[i]) {
                    base_class.prototype[i] = LGraphNode.prototype[i];
                }
            }
        }

        var prev = this.registered_node_types[type];
        if(prev)
            console.log("replacing node type: " + type);
        else
        {
            if( !Object.hasOwnProperty( base_class.prototype, "shape") )
            Object.defineProperty(base_class.prototype, "shape", {
                set: function(v) {
                    switch (v) {
                        case "default":
                            delete this._shape;
                            break;
                        case "box":
                            this._shape = LiteGraph.BOX_SHAPE;
                            break;
                        case "round":
                            this._shape = LiteGraph.ROUND_SHAPE;
                            break;
                        case "circle":
                            this._shape = LiteGraph.CIRCLE_SHAPE;
                            break;
                        case "card":
                            this._shape = LiteGraph.CARD_SHAPE;
                            break;
                        default:
                            this._shape = v;
                    }
                },
                get: function(v) {
                    return this._shape;
                },
                enumerable: true,
                configurable: true
            });

            //warnings
            if (base_class.prototype.onPropertyChange) {
                console.warn(
                    "LiteGraph node class " +
                        type +
                        " has onPropertyChange method, it must be called onPropertyChanged with d at the end"
                );
            }

            //used to know which nodes create when dragging files to the canvas
            if (base_class.supported_extensions) {
                for (var i in base_class.supported_extensions) {
                    var ext = base_class.supported_extensions[i];
                    if(ext && ext.constructor === String)
                        this.node_types_by_file_extension[ ext.toLowerCase() ] = base_class;
                }
            }
        }

        this.registered_node_types[type] = base_class;
        if (base_class.constructor.name) {
            this.Nodes[classname] = base_class;
        }
        if (LiteGraph.onNodeTypeRegistered) {
            LiteGraph.onNodeTypeRegistered(base_class.type, base_class);
        }
        if (prev && LiteGraph.onNodeTypeReplaced) {
            LiteGraph.onNodeTypeReplaced(base_class.type, base_class, prev);
        }

        //warnings
        if (base_class.prototype.onPropertyChange) {
            console.warn(
                "LiteGraph node class " +
                    type +
                    " has onPropertyChange method, it must be called onPropertyChanged with d at the end"
            );
        }

        //used to know which nodes create when dragging files to the canvas
        if (base_class.supported_extensions) {
            for (i=0; i < base_class.supported_extensions.length; i++) {
                ext = base_class.supported_extensions[i];
                if(ext && ext.constructor === String)
                    this.node_types_by_file_extension[ ext.toLowerCase() ] = base_class;
            }
        }
    },

    /**
     * removes a node type from the system
     * @method unregisterNodeType
     * @param {String|Object} type name of the node or the node constructor itself
     */
    unregisterNodeType: function(type) {
        var base_class = type.constructor === String ? this.registered_node_types[type] : type;
        if(!base_class)
            throw("node type not found: " + type );
        delete this.registered_node_types[base_class.type];
        if(base_class.constructor.name)
            delete this.Nodes[base_class.constructor.name];
    },


    

    /**
     * Removes all previously registered node's types
     */
    clearRegisteredTypes: function() {
        this.registered_node_types = {};
        this.node_types_by_file_extension = {};
        this.Nodes = {};
        this.searchbox_extras = {};
    },

    /**
     * Adds this method to all nodetypes, existing and to be created
     * (You can add it to LGraphNode.prototype but then existing node types wont have it)
     * @method addNodeMethod
     * @param {Function} func
     */
    addNodeMethod: function(name, func) {
        LGraphNode.prototype[name] = func;
        for (var i in this.registered_node_types) {
            var type = this.registered_node_types[i];
            if (type.prototype[name]) {
                type.prototype["_" + name] = type.prototype[name];
            } //keep old in case of replacing
            type.prototype[name] = func;
        }
    },

    /**
     * Create a node of a given type with a name. The node is not attached to any graph yet.
     * @method createNode
     * @param {String} type full name of the node class. p.e. "math/sin"
     * @param {String} name a name to distinguish from other nodes
     * @param {Object} options to set options
     */

    createNode: function(type, title, options) {
        var base_class = this.registered_node_types[type];
        if (!base_class) {
            if (LiteGraph.debug) {
                console.log(
                    'GraphNode type "' + type + '" not registered.'
                );
            }
            return null;
        }

        var node = new base_class(title);

        if (!node.properties) {
            node.properties = {};
        }

        node.widget.setSize(node.widget.computeSize(node.properties), false);
        node.widget.pos = LiteGraph.DEFAULT_POSITION.concat();
        if (node.type == null) node.type = type;
        if (options) {
            node.id = options.id;
            node.widget.id = options.id;
        }
        for (var i in options) {
            node.properties[i] = options[i];
        }

        if (options?.widget) {
            node.widget.pos = options.widget.pos;
            node.pos = options.widget.pos;
        }
        // callback
        if ( node.onNodeCreated ) {
            node.onNodeCreated();
        }
        
        return node;
    },

    /**
     * Returns a registered node type with a given name
     * @method getNodeType
     * @param {String} type full name of the node class. p.e. "math/sin"
     * @return {Class} the node class
     */
    getNodeType: function(type) {
        return this.registered_node_types[type];
    },

    /**
     * Returns a list of node types matching one category
     * @method getNodeType
     * @param {String} category category name
     * @return {Array} array with all the node classes
     */

    getNodeTypesInCategory: function(category, filter) {
        var r = [];
        for (var i in this.registered_node_types) {
            var type = this.registered_node_types[i];
            if (type.filter != filter) {
                continue;
            }

            if (category == "") {
                if (type.category == null) {
                    r.push(type);
                }
            } else if (type.category == category) {
                r.push(type);
            }
        }

        if (this.auto_sort_node_types) {
            r.sort(function(a,b){return a.title.localeCompare(b.title)});
        }

        return r;
    },

    /**
     * Returns a list with all the node type categories
     * @method getNodeTypesCategories
     * @param {String} filter only nodes with ctor.filter equal can be shown
     * @return {Array} array with all the names of the categories
     */
    getNodeTypesCategories: function( filter ) {
        var categories = { "": 1 };
        for (var i in this.registered_node_types) {
            var type = this.registered_node_types[i];
            if ( type.category && !type.skip_list )
            {
                if(type.filter != filter)
                    continue;
                categories[type.category] = 1;
            }
        }
        var result = [];
        for (var i in categories) {
            result.push(i);
        }
        return this.auto_sort_node_types ? result.sort() : result;
    },

    //debug purposes: reloads all the js scripts that matches a wildcard
    reloadNodes: function(folder_wildcard) {
        var tmp = document.getElementsByTagName("script");
        //weird, this array changes by its own, so we use a copy
        var script_files = [];
        for (var i=0; i < tmp.length; i++) {
            script_files.push(tmp[i]);
        }

        var docHeadObj = document.getElementsByTagName("head")[0];
        folder_wildcard = document.location.href + folder_wildcard;

        for (var i=0; i < script_files.length; i++) {
            var src = script_files[i].src;
            if (
                !src ||
                src.substr(0, folder_wildcard.length) != folder_wildcard
            ) {
                continue;
            }

            try {
                if (LiteGraph.debug) {
                    console.log("Reloading: " + src);
                }
                var dynamicScript = document.createElement("script");
                dynamicScript.type = "text/javascript";
                dynamicScript.src = src;
                docHeadObj.appendChild(dynamicScript);
                docHeadObj.removeChild(script_files[i]);
            } catch (err) {
                if (LiteGraph.throw_errors) {
                    throw err;
                }
                if (LiteGraph.debug) {
                    console.log("Error while reloading " + src);
                }
            }
        }

        if (LiteGraph.debug) {
            console.log("Nodes reloaded");
        }
    },

    //separated just to improve if it doesn't work
    cloneObject: function(obj, target) {
        if (obj == null) {
            return null;
        }
        var r = JSON.parse(JSON.stringify(obj));
        if (!target) {
            return r;
        }

        for (var i in r) {
            target[i] = r[i];
        }
        return target;
    },


    /**
     * Register a string in the search box so when the user types it it will recommend this node
     * @method registerSearchboxExtra
     * @param {String} node_type the node recommended
     * @param {String} description text to show next to it
     * @param {Object} data it could contain info of how the node should be configured
     * @return {Boolean} true if they can be connected
     */
    registerSearchboxExtra: function(node_type, description, data) {
        this.searchbox_extras[description.toLowerCase()] = {
            type: node_type,
            desc: description,
            data: data
        };
    },

    /**
     * Wrapper to load files (from url using fetch or from file using FileReader)
     * @method fetchFile
     * @param {String|File|Blob} url the url of the file (or the file itself)
     * @param {String} type an string to know how to fetch it: "text","arraybuffer","json","blob"
     * @param {Function} on_complete callback(data)
     * @param {Function} on_error in case of an error
     * @return {FileReader|Promise} returns the object used to 
     */
    fetchFile: function( url, type, on_complete, on_error ) {
        var that = this;
        if(!url)
            return null;

        type = type || "text";
        if( url.constructor === String )
        {
            if (url.substr(0, 4) == "http" && LiteGraph.proxy) {
                url = LiteGraph.proxy + url.substr(url.indexOf(":") + 3);
            }
            return fetch(url)
            .then(function(response) {
                if(!response.ok)
                        throw new Error("File not found"); //it will be catch below
                if(type == "arraybuffer")
                    return response.arrayBuffer();
                else if(type == "text" || type == "string")
                    return response.text();
                else if(type == "json")
                    return response.json();
                else if(type == "blob")
                    return response.blob();
            })
            .then(function(data) {
                if(on_complete)
                    on_complete(data);
            })
            .catch(function(error) {
                console.error("error fetching file:",url);
                if(on_error)
                    on_error(error);
            });
        }
        else if( url.constructor === File || url.constructor === Blob)
        {
            var reader = new FileReader();
            reader.onload = function(e)
            {
                var v = e.target.result;
                if( type == "json" )
                    v = JSON.parse(v);
                if(on_complete)
                    on_complete(v);
            }
            if(type == "arraybuffer")
                return reader.readAsArrayBuffer(url);
            else if(type == "text" || type == "json")
                return reader.readAsText(url);
            else if(type == "blob")
                return reader.readAsBinaryString(url);
        }
        return null;
    }
});


for (let i = 97; i <= 123; i++) {
    LiteGraph.alphabet.push(String.fromCharCode(i));
}



//*********************************************************************************
// LGraph CLASS
//*********************************************************************************

/**
 * LGraph is the class that contain a full graph. We instantiate one and add nodes to it, and then we can run the execution loop.
 * supported callbacks:
    + onNodeAdded: when a new node is added to the graph
    + onNodeRemoved: when a node inside this graph is removed
    *
    * @class LGraph
    * @constructor
    * @param {Object} o data from previous serialization [optional]
    */


class LGraph {
    constructor(o) {
        if (LiteGraph.debug) {
            console.log("Graph created");
        }
        this.clear();
        if (o) {
            this.configure(o);
        }
    }
    //used to know which types of connections support this graph (some graphs do not allow certain types)
    getSupportedTypes() {
        return this.supported_types || LGraph.supported_types;
    }
    /**
         * Removes all nodes from this graph
         * @method clear
         */
    clear() {
        this.stop();
        this.status = LGraph.STATUS_STOPPED;

        this._version = -1; //used to detect changes


        //safe clear
        if (this._nodes) {
            for (var i = 0; i < this._nodes.length; ++i) {
                var node = this._nodes[i];
                if (node.onRemoved) {
                    node.onRemoved();
                }
            }
        }

        //nodes
        this._nodes = [];
        this._nodes_by_id = {};
        this._nodes_in_order = []; //nodes sorted in execution order
        this._nodes_executable = null; //nodes that contain onExecute sorted in execution order


        //other scene stuff
        this._groups = [];

        //links
        this.links = {}; //container with all the links


        //iterations
        this.iteration = 0;

        //custom data
        this.config = {};
        this.vars = {};
        this.extra = {}; //to store custom data


        //timing
        this.globaltime = 0;
        this.runningtime = 0;
        this.fixedtime = 0;
        this.fixedtime_lapse = 0.01;
        this.elapsed_time = 0.01;
        this.last_update_time = 0;
        this.starttime = 0;

        this.catch_errors = true;

        this.nodes_actioning = [];
        this.nodes_executedAction = [];

        //notify canvas to redraw
        this.change();
    }

    /**
     * Starts running this graph every interval milliseconds.
     * @method start
     * @param {number} interval amount of milliseconds between executions, if 0 then it renders to the monitor refresh rate
     */
    start(interval) {
        if (this.status == LGraph.STATUS_RUNNING) {
            return;
        }
        this.status = LGraph.STATUS_RUNNING;

        if (this.onPlayEvent) {
            this.onPlayEvent();
        }


        //launch
        this.starttime = NodiEnums.getTime();
        this.last_update_time = this.starttime;
        interval = interval || 0;
        var that = this;

        //execute once per frame
        if (interval == 0 && typeof window != "undefined" && window.requestAnimationFrame) {
            function on_frame() {
                if (that.execution_timer_id != -1) {
                    return;
                }
                window.requestAnimationFrame(on_frame);
                if (that.onBeforeStep)
                    that.onBeforeStep();
                that.runStep(1, !that.catch_errors);
                if (that.onAfterStep)
                    that.onAfterStep();
            }
            this.execution_timer_id = -1;
            on_frame();
        } else { //execute every 'interval' ms
            this.execution_timer_id = setInterval(function () {
                //execute
                if (that.onBeforeStep)
                    that.onBeforeStep();
                that.runStep(1, !that.catch_errors);
                if (that.onAfterStep)
                    that.onAfterStep();
            }, interval);
        }
    }
    /**
         * Stops the execution loop of the graph
         * @method stop execution
         */
    stop() {
        if (this.status == LGraph.STATUS_STOPPED) {
            return;
        }

        this.status = LGraph.STATUS_STOPPED;

        if (this.onStopEvent) {
            this.onStopEvent();
        }

        if (this.execution_timer_id != null) {
            if (this.execution_timer_id != -1) {
                clearInterval(this.execution_timer_id);
            }
            this.execution_timer_id = null;
        }

    }

    runStep() {
        var start = NodiEnums.getTime();
        this.globaltime = 0.001 * (start - this.starttime);

        var nodes = this._nodes;

        if (!nodes) {
            return;
        }

        for (let linkID in this.links) {
            let link = this.links[linkID];
            let dataFromNode = this._nodes_by_id[link.origin_id].properties[link.origin_slot].outValue;
            if(dataFromNode !== null) {
                this._nodes_by_id[link.target_id].properties[link.target_slot].inpValue = dataFromNode;
                this._nodes_by_id[link.target_id].update = true;
            }
        }
        
        for (let linkID in this.links) {
            let link = this.links[linkID];
            this._nodes_by_id[link.origin_id].properties[link.origin_slot].outValue = null;
        }

        for (var j = 0; j < nodes.length; ++j) {
            var node = nodes[j];
            if ( node.onExecute) {
                node.onExecute(node.update);
                node.update = false;
            }
        }

        this.fixedtime += this.fixedtime_lapse;
        if (this.onExecuteStep) {
            this.onExecuteStep();
        }



        if (this.onAfterExecute) {
            this.onAfterExecute();
        }
        
        var now = NodiEnums.getTime();
        var elapsed = now - start;
        if (elapsed == 0) {
            elapsed = 1;
        }
        this.execution_time = 0.001 * elapsed;
        this.globaltime += 0.001 * elapsed;
        this.iteration += 1;
        this.elapsed_time = (now - this.last_update_time) * 0.001;
        this.last_update_time = now;
        this.nodes_actioning = [];
        this.nodes_executedAction = [];
    }

    
    /**
         * Returns the amount of time the graph has been running in milliseconds
         * @method getTime
         * @return {number} number of milliseconds the graph has been running
         */
    getTime() {
        return this.globaltime;
    }
    /**
         * Returns the amount of time accumulated using the fixedtime_lapse var. This is used in context where the time increments should be constant
         * @method getFixedTime
         * @return {number} number of milliseconds the graph has been running
         */
    getFixedTime() {
        return this.fixedtime;
    }
    /**
         * Returns the amount of time it took to compute the latest iteration. Take into account that this number could be not correct
         * if the nodes are using graphical actions
         * @method getElapsedTime
         * @return {number} number of milliseconds it took the last cycle
         */
    getElapsedTime() {
        return this.elapsed_time;
    }

    getNextID() {
        for (let i = 0; i < Number.MAX_SAFE_INTEGER; i++) {
            if (this._nodes_by_id[i] == null && this.links[i] == null) {
                return i;
            }
        }
    }
    /**
         * Adds a new node instance to this graph
         * @method add
         * @param {LGraphNode} node the instance of the node
         */
    add(node) {
        if (!node) return;

        //nodes
        if (node.id == null || (node.id != -1 && this._nodes_by_id[node.id] != null)) {
            console.warn(
                "LiteGraph: there is already a node with this ID, changing it"
            );
            node.id = this.getNextID();
        }

        node.graph = this;
        this._nodes.push(node);
        this._nodes_by_id[node.id] = node;

        if (this.config.align_to_grid) {
            node.alignToGrid();
        }


        this.canvas.setDirty(true);
        this.change();

        return node; //to chain actions
    }

    removeNodeByID(nodeID) {
        this.remove(this._nodes_by_id[nodeID]);
    }

    /**
         * Removes a node from the graph
         * @method remove
         * @param {LGraphNode} node the instance of the node
         */
    remove(node) {

        if (this._nodes_by_id[node.id] == null) {
            return;
        } //not found

        if (node.ignore_remove) {
            return;
        } //cannot be removed

        var i, links, link;
        //disconnect inputs
        for (i = 0; i < NodeCore.getInputs(this.properties).length; i++) {
            links = NodeCore.getInputs(this.properties)[i].links;
            if (links) {
                    for (link of links) {
                    node.disconnectInput(link);
                    window.socket.sendToServer("remLink", {"nodeID": link.id});
                    this.removeLink(link);
                }
            }
        }

        //disconnect outputs
        for (i = 0; i < NodeCore.getOutputs(this.properties).length; i++) {
            links = NodeCore.getOutputs(this.properties)[i].links;
            if (links) {
                for (link of links) {
                    node.disconnectOutput(link);
                    window.socket.sendToServer("remLink", {"nodeID": link.id});
                    this.removeLink(link);
                }
            }
        }

        //callback
        if (node.onRemoved) {
            node.onRemoved();
        }

        node.graph = null;
        this._version++;

        //remove from canvas render
        if (this.list_of_graphcanvas) {
            for (i = 0; i < this.list_of_graphcanvas.length; ++i) {
                var canvas = this.list_of_graphcanvas[i];
                if (canvas.selected_nodes[node.id]) {
                    delete canvas.selected_nodes[node.id];
                }
                if (canvas.node_dragged == node) {
                    canvas.node_dragged = null;
                }
            }
        }

        //remove from containers
        this._nodes = this._nodes.filter(obj => obj.id !== node.id);

        delete this._nodes_by_id[node.id];

        if (this.onNodeRemoved) {
            this.onNodeRemoved(node);
        }

        this.canvas.set(true, true);
        this.change();

    }
    /**
         * Returns a node by its id.
         * @method getNodeById
         * @param {Number} id
         */
    getNodeById(id) {
        if (id == null) return null;
        return this._nodes_by_id[id];
    }
    /**
         * Returns a list of nodes that matches a class
         * @method findNodesByClass
         * @param {Class} classObject the class itself (not an string)
         * @return {Array} a list with all the nodes of this type
         */
    findNodesByClass(classObject, result) {
        result = result || [];
        result.length = 0;
        for (var i = 0, l = this._nodes.length; i < l; ++i) {
            if (this._nodes[i].constructor === classObject) {
                result.push(this._nodes[i]);
            }
        }
        return result;
    }

    
    /**
         * Returns a list of nodes that matches a name
         * @method findNodesByTitle
         * @param {String} name the name of the node to search
         * @return {Array} a list with all the nodes with this name
         */
    findNodesByTitle(title) {
        var result = [];
        for (var i = 0, l = this._nodes.length; i < l; ++i) {
            if (this._nodes[i].title == title) {
                result.push(this._nodes[i]);
            }
        }
        return result;
    }
    /**
         * Returns the top-most node in this position of the canvas
         * @method getNodeOnPos
         * @param {number} x the x coordinate in canvas space
         * @param {number} y the y coordinate in canvas space
         * @param {Array} nodes_list a list with all the nodes to search from, by default is all the nodes in the graph
         * @return {LGraphNode} the node at this position or null
         */
    getNodeOnPos(x, y, nodes_list, margin) {
        nodes_list = nodes_list || this._nodes;
        var nRet = null;
        for (var i = nodes_list.length - 1; i >= 0; i--) {
            var n = nodes_list[i];
            if (n.widget.isPointInside(x, y, margin)) {

                return n;

            }
        }
        return nRet;
    }

    /**
         * Checks that the node type matches the node type registered, used when replacing a nodetype by a newer version during execution
         * this replaces the ones using the old version with the new version
         * @method checkNodeTypes
         */
    checkNodeTypes() {
        for (var i = 0; i < this._nodes.length; i++) {
            var node = this._nodes[i];
            var ctor = LiteGraph.registered_node_types[node.type];
            if (node.constructor == ctor) {
                continue;
            }
            console.log("node being replaced by newer version: " + node.type);
            var newnode = LiteGraph.createNode(node.type);
            this._nodes[i] = newnode;
            newnode.configure(node.serialize());
            newnode.graph = this;
            this._nodes_by_id[newnode.id] = newnode;
        }
    }
    // ********** GLOBALS *****************
    onAction(action, param, options) {
        this._input_nodes = this.findNodesByClass(
            LiteGraph.GraphInput,
            this._input_nodes
        );
        for (var i = 0; i < this._input_nodes.length; ++i) {
            var node = this._input_nodes[i];
            if (node.properties.name != action) {
                continue;
            }
            //wrap node.onAction(action, param);
            node.actionDo(action, param, options);
            break;
        }
    }
    trigger(action, param) {
        if (this.onTrigger) {
            this.onTrigger(action, param);
        }
    }
    

    triggerInput(name, value) {
        var nodes = this.findNodesByTitle(name);
        for (var i = 0; i < nodes.length; ++i) {
            nodes[i].onTrigger(value);
        }
    }
    setCallback(name, func) {
        var nodes = this.findNodesByTitle(name);
        for (var i = 0; i < nodes.length; ++i) {
            nodes[i].setTrigger(func);
        }
    }



    /**
         * clears the triggered slot animation in all links (stop visual animation)
         * @method clearTriggeredSlots
         */
    clearTriggeredSlots() {
        for (var i in this.links) {
            var link_info = this.links[i];
            if (!link_info) {
                continue;
            }
            if (link_info._last_time) {
                link_info._last_time = 0;
            }
        }
    }
    /* Called when something visually changed (not the graph!) */
    change() {
        if (LiteGraph.debug) {
            console.log("Graph changed");
        }
        if (this.on_change) {
            this.on_change(this);
        }
    }

    /**
         * Destroys a link
         * @method removeLink
         * @param {Number} link_id
         */
    removeLink(link_id) {
        var link = this.links[link_id];
        if (!link) {
            return;
        }

        var node = this.getNodeById(link.target_id);
        if (node) {
            node.disconnectInput(link);
        }

        node = this.getNodeById(link.origin_id);
        if (node) {
            node.disconnectOutput(link);
        }
        if (this.links[link_id]) {
            delete this.links[link_id];
        } 
    }
    //save and recover app state ***************************************
    /**
         * Creates a Object containing all the info about this graph, it can be serialized
         * @method serialize
         * @return {Object} value of the node
         */
    serialize() {
        var nodes_info = [];
        for (var i = 0, l = this._nodes.length; i < l; ++i) {
            nodes_info.push(this._nodes[i].serialize());
        }

        //pack link info into a non-verbose format
        var links = [];
        for (var i in this.links) {
            //links is an OBJECT
            var link = this.links[i];
            if (!link.serialize) {
                //weird bug I havent solved yet
                console.warn(
                    "weird LLink bug, link info is not a LLink but a regular object"
                );
                var link2 = new LLink();
                for (var j in link) {
                    link2[j] = link[j];
                }
                this.links[i] = link2;
                link = link2;
            }

            links.push(link.serialize());
        }

        var groups_info = [];
        for (var i = 0; i < this._groups.length; ++i) {
            groups_info.push(this._groups[i].serialize());
        }

        var data = {
            nodes: nodes_info,
            links: links,
            groups: groups_info,
            config: this.config,
            extra: this.extra,
            version: LiteGraph.VERSION
        };

        if (this.onSerialize)
            this.onSerialize(data);

        return data;
    }
    /**
         * Configure a graph from a JSON string
         * @method configure
         * @param {String} str configure a graph from a JSON string
         * @param {Boolean} returns if there was any error parsing
         */
    configure(data) {
        if (!data) return;

        this.clear();

        var nodes = data.nodes;
        var i, l;


        //copy all stored fields
        for (i in data) {
            if (i == "nodes" || i == "groups") //links must be accepted
                continue;
            this[i] = data[i];
        }

        var error = false;

        //create nodes
        this._nodes = [];
        if (nodes) {
            for (i = 0, l = nodes.length; i < l; ++i) {
                var n_info = nodes[i]; //stored info
                if (!n_info) continue;
                var node = LiteGraph.createNode(n_info.type, n_info.title, n_info.properties);
                node.id = n_info.nodeID; //id it or it will create a new id
                node.widget.id = n_info.nodeID;
                node.widget.pos = [n_info.posX, n_info.posY];
                //node.widget.size = n_info.widget.size;
                this.add(node, true); //add before configure, otherwise configure cannot create links
            }

            //configure nodes afterwards so they can reach each other
            for (i = 0, l = nodes.length; i < l; ++i) {
                n_info = nodes[i];
                if (!n_info) continue;
                node = this.getNodeById(n_info.nodeID);
                if (node) {
                    node.configure(n_info.properties);
                }
            }
        }

        //decode links info (they are very verbose)
        if (data.links) {
            for (i = 0; i < data.links.length; ++i) {
                var link = new LLink();
                link.configure(data.links[i]);
                this.links[link.id] = link;
            }
        }

        this.extra = data.extra || {};

        if (this.onConfigure)
            this.onConfigure(data);

        this._version++;
        this.canvas.setDirty(true, true);
        return error;
    }
    load(url, callback) {
        var that = this;

        //from file
        if (url.constructor === File || url.constructor === Blob) {
            var reader = new FileReader();
            reader.addEventListener('load', function (event) {
                var data = JSON.parse(event.target.result);
                that.configure(data);
                if (callback)
                    callback();
            });

            reader.readAsText(url);
            return;
        }

        //is a string, then an URL
        var req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.send(null);
        req.onload = function (oEvent) {
            if (req.status !== 200) {
                console.error("Error loading graph:", req.status, req.response);
                return;
            }
            var data = JSON.parse(req.response);
            that.configure(data);
            if (callback)
                callback();
        };
        req.onerror = function (err) {
            console.error("Error loading graph:", err);
        };
    }
    onNodeTrace(node, msg, color) {
        //TODO
    }
}

//default supported types
LGraph.supported_types = ["number", "string", "boolean"];
LGraph.STATUS_STOPPED = 1;
LGraph.STATUS_RUNNING = 2;

global.LGraph = LiteGraph.LGraph = LGraph;
LiteGraph.LLink = LLink;



global.LGraphNode = LiteGraph.LGraphNode = LGraphNode;



global.LGraphCanvas = LiteGraph.LGraphCanvas = LGraphCanvas;


LGraphCanvas.gradients = {}; //cache of gradients


/* Interaction */

LGraphCanvas.search_limit = -1;

LGraphCanvas.node_colors = {
    red: { color: "#322", bgcolor: "#533", groupcolor: "#A88" },
    brown: { color: "#332922", bgcolor: "#593930", groupcolor: "#b06634" },
    green: { color: "#232", bgcolor: "#353", groupcolor: "#8A8" },
    blue: { color: "#223", bgcolor: "#335", groupcolor: "#88A" },
    pale_blue: {
        color: "#2a363b",
        bgcolor: "#3f5159",
        groupcolor: "#3f789e"
    },
    cyan: { color: "#233", bgcolor: "#355", groupcolor: "#8AA" },
    purple: { color: "#323", bgcolor: "#535", groupcolor: "#a1309b" },
    yellow: { color: "#432", bgcolor: "#653", groupcolor: "#b58b2a" },
    black: { color: "#222", bgcolor: "#000", groupcolor: "#444" }
};


//API *************************************************
//like rect but rounded corners
if (typeof(window) != "undefined" && window.CanvasRenderingContext2D && !window.CanvasRenderingContext2D.prototype.roundRect) {
    window.CanvasRenderingContext2D.prototype.roundRect = function(
    x,
    y,
    w,
    h,
    radius,
    radius_low
) {
    var top_left_radius = 0;
    var top_right_radius = 0;
    var bottom_left_radius = 0;
    var bottom_right_radius = 0;

    if ( radius === 0 )
    {
        this.rect(x,y,w,h);
        return;
    }

    if(radius_low === undefined)
        radius_low = radius;

    //make it compatible with official one
    if(radius != null && radius.constructor === Array)
    {
        if(radius.length == 1)
            top_left_radius = top_right_radius = bottom_left_radius = bottom_right_radius = radius[0];
        else if(radius.length == 2)
        {
            top_left_radius = bottom_right_radius = radius[0];
            top_right_radius = bottom_left_radius = radius[1];
        }
        else if(radius.length == 4)
        {
            top_left_radius = radius[0];
            top_right_radius = radius[1];
            bottom_left_radius = radius[2];
            bottom_right_radius = radius[3];
        }
        else
            return;
    }
    else //old using numbers
    {
        top_left_radius = radius || 0;
        top_right_radius = radius || 0;
        bottom_left_radius = radius_low || 0;
        bottom_right_radius = radius_low || 0;
    }

    //top right
    this.moveTo(x + top_left_radius, y);
    this.lineTo(x + w - top_right_radius, y);
    this.quadraticCurveTo(x + w, y, x + w, y + top_right_radius);

    //bottom right
    this.lineTo(x + w, y + h - bottom_right_radius);
    this.quadraticCurveTo(
        x + w,
        y + h,
        x + w - bottom_right_radius,
        y + h
    );

    //bottom left
    this.lineTo(x + bottom_right_radius, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bottom_left_radius);

    //top left
    this.lineTo(x, y + bottom_left_radius);
    this.quadraticCurveTo(x, y, x + top_left_radius, y);
};
}//if

function compareObjects(a, b) {
    for (var i in a) {
        if (a[i] != b[i]) {
            return false;
        }
    }
    return true;
}
LiteGraph.compareObjects = compareObjects;



function colorToString(c) {
    return (
        "rgba(" +
        Math.round(c[0] * 255).toFixed() +
        "," +
        Math.round(c[1] * 255).toFixed() +
        "," +
        Math.round(c[2] * 255).toFixed() +
        "," +
        (c.length == 4 ? c[3].toFixed(2) : "1.0") +
        ")"
    );
}
LiteGraph.colorToString = colorToString;


//[minx,miny,maxx,maxy]
function growBounding(bounding, x, y) {
    if (x < bounding[0]) {
        bounding[0] = x;
    } else if (x > bounding[2]) {
        bounding[2] = x;
    }

    if (y < bounding[1]) {
        bounding[1] = y;
    } else if (y > bounding[3]) {
        bounding[3] = y;
    }
}
LiteGraph.growBounding = growBounding;

//point inside bounding box
function isInsideBounding(p, bb) {
    if (
        p[0] < bb[0][0] ||
        p[1] < bb[0][1] ||
        p[0] > bb[1][0] ||
        p[1] > bb[1][1]
    ) {
        return false;
    }
    return true;
}
LiteGraph.isInsideBounding = isInsideBounding;


//Convert a hex value to its decimal value - the inputted hex must be in the
//	format of a hex triplet - the kind we use for HTML colours. The function
//	will return an array with three values.
function hex2num(hex) {
    if (hex.charAt(0) == "#") {
        hex = hex.slice(1);
    } //Remove the '#' char - if there is one.
    hex = hex.toUpperCase();
    var hex_alphabets = "0123456789ABCDEF";
    var value = new Array(3);
    var k = 0;
    var int1, int2;
    for (var i = 0; i < 6; i += 2) {
        int1 = hex_alphabets.indexOf(hex.charAt(i));
        int2 = hex_alphabets.indexOf(hex.charAt(i + 1));
        value[k] = int1 * 16 + int2;
        k++;
    }
    return value;
}

LiteGraph.hex2num = hex2num;

//Give a array with three values as the argument and the function will return
//	the corresponding hex triplet.
function num2hex(triplet) {
    var hex_alphabets = "0123456789ABCDEF";
    var hex = "#";
    var int1, int2;
    for (var i = 0; i < 3; i++) {
        int1 = triplet[i] / 16;
        int2 = triplet[i] % 16;

        hex += hex_alphabets.charAt(int1) + hex_alphabets.charAt(int2);
    }
    return hex;
}

LiteGraph.num2hex = num2hex;

LiteGraph.extendClass = function(target, origin) {
    for (var i in origin) {
        //copy class properties
        if (target.hasOwnProperty(i)) {
            continue;
        }
        target[i] = origin[i];
    }

    if (origin.prototype) {
        //copy prototype properties
        for (var i in origin.prototype) {
            //only enumerable
            if (!origin.prototype.hasOwnProperty(i)) {
                continue;
            }

            if (target.prototype.hasOwnProperty(i)) {
                //avoid overwriting existing ones
                continue;
            }

            //copy getters
            if (origin.prototype.__lookupGetter__(i)) {
                target.prototype.__defineGetter__(
                    i,
                    origin.prototype.__lookupGetter__(i)
                );
            } else {
                target.prototype[i] = origin.prototype[i];
            }

            //and setters
            if (origin.prototype.__lookupSetter__(i)) {
                target.prototype.__defineSetter__(
                    i,
                    origin.prototype.__lookupSetter__(i)
                );
            }
        }
    }
};


//used to create nodes from wrapping functions
LiteGraph.getParameterNames = function(func) {
    return (func + "")
        .replace(/[/][/].*$/gm, "") // strip single-line comments
        .replace(/\s+/g, "") // strip white space
        .replace(/[/][*][^/*]*[*][/]/g, "") // strip multi-line comments  /**/
        .split("){", 1)[0]
        .replace(/^[^(]*[(]/, "") // extract the parameters
        .replace(/=[^,]+/g, "") // strip any ES6 defaults
        .split(",")
        .filter(Boolean); // split & filter [""]
};

/* helper for interaction: pointer, touch, mouse Listeners
used by LGraphCanvas DragAndScale ContextMenu*/
LiteGraph.pointerListenerAdd = function(oDOM, sEvIn, fCall, capture=false) {
    if (!oDOM || !oDOM.addEventListener || !sEvIn || typeof fCall!=="function"){
        //console.log("cant pointerListenerAdd "+oDOM+", "+sEvent+", "+fCall);
        return; // -- break --
    }
    
    var sMethod = LiteGraph.pointerevents_method;
    var sEvent = sEvIn;
    
    // UNDER CONSTRUCTION
    // convert pointerevents to touch event when not available
    if (sMethod=="pointer" && !window.PointerEvent){ 
        console.warn("sMethod=='pointer' && !window.PointerEvent");
        console.log("Converting pointer["+sEvent+"] : down move up cancel enter TO touchstart touchmove touchend, etc ..");
        switch(sEvent){
            case "down":{
                sMethod = "touch";
                sEvent = "start";
                break;
            }
            case "move":{
                sMethod = "touch";
                //sEvent = "move";
                break;
            }
            case "up":{
                sMethod = "touch";
                sEvent = "end";
                break;
            }
            case "cancel":{
                sMethod = "touch";
                //sEvent = "cancel";
                break;
            }
            case "enter":{
                console.log("debug: Should I send a move event?"); // ???
                break;
            }
            // case "over": case "out": not used at now
            default:{
                console.warn("PointerEvent not available in this browser ? The event "+sEvent+" would not be called");
            }
        }
    }

    switch(sEvent){
        //both pointer and move events
        case "down": case "up": case "move": case "over": case "out": case "enter":
        {
            oDOM.addEventListener(sMethod+sEvent, fCall, capture);
        }
        // only pointerevents
        case "leave": case "cancel": case "gotpointercapture": case "lostpointercapture":
        {
            if (sMethod!="mouse"){
                return oDOM.addEventListener(sMethod+sEvent, fCall, capture);
            }
        }
        // not "pointer" || "mouse"
        default:
            return oDOM.addEventListener(sEvent, fCall, capture);
    }
}
LiteGraph.pointerListenerRemove = function(oDOM, sEvent, fCall, capture=false) {
    if (!oDOM || !oDOM.removeEventListener || !sEvent || typeof fCall!=="function"){
        //console.log("cant pointerListenerRemove "+oDOM+", "+sEvent+", "+fCall);
        return; // -- break --
    }
    switch(sEvent){
        //both pointer and move events
        case "down": case "up": case "move": case "over": case "out": case "enter":
        {
            if (LiteGraph.pointerevents_method=="pointer" || LiteGraph.pointerevents_method=="mouse"){
                oDOM.removeEventListener(LiteGraph.pointerevents_method+sEvent, fCall, capture);
            }
        }
        // only pointerevents
        case "leave": case "cancel": case "gotpointercapture": case "lostpointercapture":
        {
            if (LiteGraph.pointerevents_method=="pointer"){
                return oDOM.removeEventListener(LiteGraph.pointerevents_method+sEvent, fCall, capture);
            }
        }
        // not "pointer" || "mouse"
        default:
            return oDOM.removeEventListener(sEvent, fCall, capture);
    }
}

Math.clamp = function(v, a, b) {
    return a > v ? a : b < v ? b : v;
};

if (typeof window != "undefined" && !window["requestAnimationFrame"]) {
    window.requestAnimationFrame =
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
}


if (typeof exports != "undefined") {
exports.LiteGraph = this.LiteGraph;
}

export { LGraph };