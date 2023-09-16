import { NodiEnums } from "../../enums.js";
import LGraphCanvas from "./canvas.js"
import LLink from "./link.js"
import LGraphNode from "./node.js"
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
    EVENT_LINK_COLOR: "#A86",
    CONNECTING_LINK_COLOR: "#AFA",

    MAX_NUMBER_OF_NODES: 1000, //avoid infinite loops
    DEFAULT_POSITION: [32, 32], //default node position
    VALID_SHAPES: ["default", "box", "round", "card"], //,"circle"

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

    NODE_MODES: ["Always", "On Event", "Never", "On Trigger"], // helper, will add "On Request" and more in the future
    NODE_MODES_COLORS:["#666","#422","#333","#224","#626"], // use with node_box_coloured_by_mode
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

    do_add_triggers_slots: false, // [true!] will create and connect event slots when using action/events connections, !WILL CHANGE node mode when using onTrigger (enable mode colors), onExecuted does not need this
    
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
            for (var i=0; i < base_class.supported_extensions.length; i++) {
                var ext = base_class.supported_extensions[i];
                if(ext && ext.constructor === String)
                    this.node_types_by_file_extension[ ext.toLowerCase() ] = base_class;
            }
        }
        
        // TODO one would want to know input and ouput :: this would allow trought registerNodeAndSlotType to get all the slots types
        //console.debug("Registering "+type);
        if (this.auto_load_slot_types) nodeTmp = new base_class(base_class.title || "tmpnode");
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
    * Save a slot type and his node
    * @method registerSlotType
    * @param {String|Object} type name of the node or the node constructor itself
    * @param {String} slot_type name of the slot type (variable type), eg. string, number, array, boolean, ..
    */
    registerNodeAndSlotType: function(type,slot_type,out){
        out = out || false;
        var base_class = type.constructor === String && this.registered_node_types[type] !== "anonymous" ? this.registered_node_types[type] : type;
        
        var sCN = base_class.constructor.type;
        
        if (typeof slot_type == "string"){
            var aTypes = slot_type.split(",");
        }else if (slot_type == this.EVENT || slot_type == this.ACTION){
            var aTypes = ["_event_"];
        }else{
            var aTypes = ["*"];
        }

        for (var i = 0; i < aTypes.length; ++i) {
            var sT = aTypes[i]; //.toLowerCase();
            if (sT === ""){
                sT = "*";
            }
            var registerTo = out ? "registered_slot_out_types" : "registered_slot_in_types";
            if (typeof this[registerTo][sT] == "undefined") this[registerTo][sT] = {nodes: []};
            this[registerTo][sT].nodes.push(sCN);
            
            // check if is a new type
            if (!out){
                if (!this.slot_types_in.includes(sT.toLowerCase())){
                    this.slot_types_in.push(sT.toLowerCase());
                    this.slot_types_in.sort();
                }
            }else{
                if (!this.slot_types_out.includes(sT.toLowerCase())){
                    this.slot_types_out.push(sT.toLowerCase());
                    this.slot_types_out.sort();
                }
            }
        }
    },
    
    /**
     * Create a new nodetype by passing a function, it wraps it with a proper class and generates inputs according to the parameters of the function.
     * Useful to wrap simple methods that do not require properties, and that only process some input to generate an output.
     * @method wrapFunctionAsNode
     * @param {String} name node name with namespace (p.e.: 'math/sum')
     * @param {Function} func
     * @param {Array} param_types [optional] an array containing the type of every parameter, otherwise parameters will accept any type
     * @param {String} return_type [optional] string with the return type, otherwise it will be generic
     * @param {Object} properties [optional] properties to be configurable
     */
    wrapFunctionAsNode: function(
        name,
        func,
        param_types,
        return_type,
        properties
    ) {
        var params = Array(func.length);
        var code = "";
        var names = LiteGraph.getParameterNames(func);
        for (var i = 0; i < names.length; ++i) {
            code +=
                "this.addInput('" +
                names[i] +
                "'," +
                (param_types && param_types[i]
                    ? "'" + param_types[i] + "'"
                    : "0") +
                ");\n";
        }
        code +=
            "this.addOutput('out'," +
            (return_type ? "'" + return_type + "'" : 0) +
            ");\n";
        if (properties) {
            code +=
                "this.properties = " + JSON.stringify(properties) + ";\n";
        }
        var classobj = Function(code);
        classobj.title = name.split("/").pop();
        classobj.desc = "Generated from " + func.name;
        classobj.prototype.onExecute = function onExecute() {
            for (var i = 0; i < params.length; ++i) {
                params[i] = this.getInputData(i);
            }
            var r = func.apply(this, params);
            this.setOutputData(0, r);
        };
        this.registerNodeType(name, classobj);
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

        var prototype = base_class.prototype || base_class;

        title = title || base_class.title || type;

        var node = null;

        if (LiteGraph.catch_exceptions) {
            try {
                node = new base_class(title);
            } catch (err) {
                console.error(err);
                return null;
            }
        } else {
            node = new base_class(title);
        }

        if (!node.title && title) {
            node.title = title;
        }
        if (!node.properties) {
            node.properties = {};
        }


        if (!node.size) {
            node.size = node.computeSize();
            //call onresize?
        }
        if (!node.pos) {
            node.pos = LiteGraph.DEFAULT_POSITION.concat();
        }


        //extra options
        if (options) {
            for (var i in options) {
                node[i] = options[i];
            }
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
     * Returns if the types of two slots are compatible (taking into account wildcards, etc)
     * @method isValidConnection
     * @param {String} type_a
     * @param {String} type_b
     * @return {Boolean} true if they can be connected
     */
    isValidConnection: function(type_a, type_b) {
        if (type_a=="" || type_a==="*") type_a = 0;
        if (type_b=="" || type_b==="*") type_b = 0;
        if (
            !type_a //generic output
            || !type_b // generic input
            || type_a == type_b //same type (is valid for triggers)
            || (type_a == LiteGraph.EVENT && type_b == LiteGraph.ACTION)
        ) {
            return true;
        }

        // Enforce string type to handle toLowerCase call (-1 number not ok)
        type_a = String(type_a);
        type_b = String(type_b);
        type_a = type_a.toLowerCase();
        type_b = type_b.toLowerCase();

        // For nodes supporting multiple connection types
        if (type_a.indexOf(",") == -1 && type_b.indexOf(",") == -1) {
            return type_a == type_b;
        }

        // Check all permutations to see if one is valid
        var supported_types_a = type_a.split(",");
        var supported_types_b = type_b.split(",");
        for (var i = 0; i < supported_types_a.length; ++i) {
            for (var j = 0; j < supported_types_b.length; ++j) {
                if(this.isValidConnection(supported_types_a[i],supported_types_b[j])){
                //if (supported_types_a[i] == supported_types_b[j]) {
                    return true;
                }
            }
        }

        return false;
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
    + onNodeConnectionChange: some connection has changed in the graph (connected or disconnected)
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
        this.list_of_graphcanvas = null;
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

        this.nodes_executing = [];
        this.nodes_actioning = [];
        this.nodes_executedAction = [];

        //subgraph_data
        this.inputs = {};
        this.outputs = {};

        //notify canvas to redraw
        this.change();

        this.sendActionToCanvas("clear");
    }
    /**
         * Attach Canvas to this graph
         * @method attachCanvas
         * @param {GraphCanvas} graph_canvas
         */
    attachCanvas(graphcanvas) {
        if (graphcanvas.constructor != LGraphCanvas) {
            throw "attachCanvas expects a LGraphCanvas instance";
        }
        if (graphcanvas.graph && graphcanvas.graph != this) {
            graphcanvas.graph.detachCanvas(graphcanvas);
        }

        graphcanvas.graph = this;

        if (!this.list_of_graphcanvas) {
            this.list_of_graphcanvas = [];
        }
        this.list_of_graphcanvas.push(graphcanvas);
    }
    /**
         * Detach Canvas from this graph
         * @method detachCanvas
         * @param {GraphCanvas} graph_canvas
         */
    detachCanvas(graphcanvas) {
        if (!this.list_of_graphcanvas) {
            return;
        }

        var pos = this.list_of_graphcanvas.indexOf(graphcanvas);
        if (pos == -1) {
            return;
        }
        graphcanvas.graph = null;
        this.list_of_graphcanvas.splice(pos, 1);
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

        this.sendEventToAllNodes("onStart");

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

        this.sendEventToAllNodes("onStop");
    }
    /**
         * Run N steps (cycles) of the graph
         * @method runStep
         * @param {number} num number of steps to run, default is 1
         * @param {Boolean} do_not_catch_errors [optional] if you want to try/catch errors
         * @param {number} limit max number of nodes to execute (used to execute from start to a node)
         */
    runStep(num, do_not_catch_errors, limit) {
        num = num || 1;

        var start = NodiEnums.getTime();
        this.globaltime = 0.001 * (start - this.starttime);

        var nodes = this._nodes_executable
            ? this._nodes_executable
            : this._nodes;

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
                node.doExecute(node.update);
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
        this.nodes_executing = [];
        this.nodes_actioning = [];
        this.nodes_executedAction = [];
    }

    /**
         * Returns all the nodes that could affect this one (ancestors) by crawling all the inputs recursively.
         * It doesn't include the node itself
         * @method getAncestors
         * @return {Array} an array with all the LGraphNodes that affect this node, in order of execution
         */
    getAncestors(node) {
        var ancestors = [];
        var pending = [node];
        var visited = {};

        while (pending.length) {
            var current = pending.shift();
            if (!current.inputs) {
                continue;
            }
            if (!visited[current.id] && current != node) {
                visited[current.id] = true;
                ancestors.push(current);
            }

            for (var i = 0; i < current.inputs.length; ++i) {
                var input = current.getInputNode(i);
                if (input && ancestors.indexOf(input) == -1) {
                    pending.push(input);
                }
            }
        }

        ancestors.sort(function (a, b) {
            return a.order - b.order;
        });
        return ancestors;
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
    /**
         * Sends an event to all the nodes, useful to trigger stuff
         * @method sendEventToAllNodes
         * @param {String} eventname the name of the event (function to be called)
         * @param {Array} params parameters in array format
         */
    sendEventToAllNodes(eventname, params, mode) {
        mode = mode || LiteGraph.ALWAYS;

        var nodes = this._nodes_in_order ? this._nodes_in_order : this._nodes;
        if (!nodes) {
            return;
        }

        for (var j = 0, l = nodes.length; j < l; ++j) {
            var node = nodes[j];

            if (node.constructor === LiteGraph.Subgraph &&
                eventname != "onExecute") {
                    node.sendEventToAllNodes(eventname, params, mode);
                continue;
            }

            if (!node[eventname] ) {
                continue;
            }
            if (params === undefined) {
                node[eventname]();
            } else if (params && params.constructor === Array) {
                node[eventname].apply(node, params);
            } else {
                node[eventname](params);
            }
        }
    }
    sendActionToCanvas(action, params) {
        if (!this.list_of_graphcanvas) {
            return;
        }

        for (var i = 0; i < this.list_of_graphcanvas.length; ++i) {
            var c = this.list_of_graphcanvas[i];
            if (c[action]) {
                c[action].apply(c, params);
            }
        }
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
    add(node, skip_compute_order) {
        if (!node) {
            return;
        }

        //groups
        if (node.constructor === LGraphGroup) {
            this._groups.push(node);
            this.setDirtyCanvas(true);
            this.change();
            node.graph = this;
            this._version++;
            return;
        }

        //nodes
        if (node.id != -1 && this._nodes_by_id[node.id] != null) {
            console.warn(
                "LiteGraph: there is already a node with this ID, changing it"
            );
            node.id = this.getNextID();
        }

        if (this._nodes.length >= LiteGraph.MAX_NUMBER_OF_NODES) {
            throw "LiteGraph: max number of nodes in a graph reached";
        }

        //give him an id
        if (node.id == null || node.id == -1) {
            node.id = this.getNextID();
        }

        node.graph = this;
        this._version++;

        this._nodes.push(node);
        this._nodes_by_id[node.id] = node;

        if (node.onAdded) {
            node.onAdded(this);
        }

        if (this.config.align_to_grid) {
            node.alignToGrid();
        }

        if (this.onNodeAdded) {
            this.onNodeAdded(node);
        }

        this.setDirtyCanvas(true);
        this.change();

        return node; //to chain actions
    }

    /**
         * Removes a node from the graph
         * @method remove
         * @param {LGraphNode} node the instance of the node
         */
    remove(node) {
        if (node.constructor === LiteGraph.LGraphGroup) {
            var index = this._groups.indexOf(node);
            if (index != -1) {
                this._groups.splice(index, 1);
            }
            node.graph = null;
            this._version++;
            this.setDirtyCanvas(true, true);
            this.change();
            return;
        }

        if (this._nodes_by_id[node.id] == null) {
            return;
        } //not found

        if (node.ignore_remove) {
            return;
        } //cannot be removed

        this.beforeChange(); //sure? - almost sure is wrong

        var i, links, link;
        //disconnect inputs
        if (node.inputs) {
            for (var i = 0; i < node.inputs.length; i++) {
                links = node.inputs[i].links;
                if (links) {
                        for (link of links) {
                        node.disconnectInput(link);
                        this.removeLink(link)
                    }
                }
            }
        }

        //disconnect outputs
        if (node.outputs) {
            for (i = 0; i < node.outputs.length; i++) {
                links = node.outputs[i].links;
                if (links) {
                    for (link of links) {
                        node.disconnectOutput(link);
                        this.removeLink(link)
                    }
                }
            }
        }

        //node.id = -1; //why?
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
        var pos = this._nodes.indexOf(node);
        if (pos != -1) {
            this._nodes.splice(pos, 1);
        }
        delete this._nodes_by_id[node.id];

        if (this.onNodeRemoved) {
            this.onNodeRemoved(node);
        }

        //close panels
        this.sendActionToCanvas("checkPanels");

        this.setDirtyCanvas(true, true);
        this.afterChange(); //sure? - almost sure is wrong
        this.change();

    }
    /**
         * Returns a node by its id.
         * @method getNodeById
         * @param {Number} id
         */
    getNodeById(id) {
        if (id == null) {
            return null;
        }
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
         * Returns a list of nodes that matches a type
         * @method findNodesByType
         * @param {String} type the name of the node type
         * @return {Array} a list with all the nodes of this type
         */
    findNodesByType(type, result) {
        var type = type.toLowerCase();
        result = result || [];
        result.length = 0;
        for (var i = 0, l = this._nodes.length; i < l; ++i) {
            if (this._nodes[i].type.toLowerCase() == type) {
                result.push(this._nodes[i]);
            }
        }
        return result;
    }
    /**
         * Returns the first node that matches a name in its title
         * @method findNodeByTitle
         * @param {String} name the name of the node to search
         * @return {Node} the node or null
         */
    findNodeByTitle(title) {
        for (var i = 0, l = this._nodes.length; i < l; ++i) {
            if (this._nodes[i].title == title) {
                return this._nodes[i];
            }
        }
        return null;
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
            if (n.isPointInside(x, y, margin)) {
                // check for lesser interest nodes (TODO check for overlapping, use the top)
                /*if (typeof n == "LGraphGroup"){
                    nRet = n;
                }else{*/
                return n;
                /*}*/
            }
        }
        return nRet;
    }
    /**
         * Returns the top-most group in that position
         * @method getGroupOnPos
         * @param {number} x the x coordinate in canvas space
         * @param {number} y the y coordinate in canvas space
         * @return {LGraphGroup} the group or null
         */
    getGroupOnPos(x, y) {
        for (var i = this._groups.length - 1; i >= 0; i--) {
            var g = this._groups[i];
            if (g.isPointInside(x, y, 2, true)) {
                return g;
            }
        }
        return null;
    }
    /**
         * Checks that the node type matches the node type registered, used when replacing a nodetype by a newer version during execution
         * this replaces the ones using the old version with the new version
         * @method checkNodeTypes
         */
    checkNodeTypes() {
        var changes = false;
        for (var i = 0; i < this._nodes.length; i++) {
            var node = this._nodes[i];
            var ctor = LiteGraph.registered_node_types[node.type];
            if (node.constructor == ctor) {
                continue;
            }
            console.log("node being replaced by newer version: " + node.type);
            var newnode = LiteGraph.createNode(node.type);
            changes = true;
            this._nodes[i] = newnode;
            newnode.configure(node.serialize());
            newnode.graph = this;
            this._nodes_by_id[newnode.id] = newnode;
            if (node.inputs) {
                newnode.inputs = node.inputs.concat();
            }
            if (node.outputs) {
                newnode.outputs = node.outputs.concat();
            }
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
    /**
         * Tell this graph it has a global graph input of this type
         * @method addGlobalInput
         * @param {String} name
         * @param {String} type
         * @param {*} value [optional]
         */
    addInput(name, type, value) {
        var input = this.inputs[name];
        if (input) {
            //already exist
            return;
        }

        this.beforeChange();
        this.inputs[name] = { name: name, type: type, value: value };
        this._version++;
        this.afterChange();

        if (this.onInputAdded) {
            this.onInputAdded(name, type);
        }

        if (this.onInputsOutputsChange) {
            this.onInputsOutputsChange();
        }
    }
    /**
         * Assign a data to the global graph input
         * @method setGlobalInputData
         * @param {String} name
         * @param {*} data
         */
    setInputData(name, data) {
        var input = this.inputs[name];
        if (!input) {
            return;
        }
        input.value = data;
    }
    /**
         * Returns the current value of a global graph input
         * @method getInputData
         * @param {String} name
         * @return {*} the data
         */
    getInputData(name) {
        var input = this.inputs[name];
        if (!input) {
            return null;
        }
        return input.value;
    }
    /**
         * Changes the name of a global graph input
         * @method renameInput
         * @param {String} old_name
         * @param {String} new_name
         */
    renameInput(old_name, name) {
        if (name == old_name) {
            return;
        }

        if (!this.inputs[old_name]) {
            return false;
        }

        if (this.inputs[name]) {
            console.error("there is already one input with that name");
            return false;
        }

        this.inputs[name] = this.inputs[old_name];
        delete this.inputs[old_name];
        this._version++;

        if (this.onInputRenamed) {
            this.onInputRenamed(old_name, name);
        }

        if (this.onInputsOutputsChange) {
            this.onInputsOutputsChange();
        }
    }
    /**
         * Changes the type of a global graph input
         * @method changeInputType
         * @param {String} name
         * @param {String} type
         */
    changeInputType(name, type) {
        if (!this.inputs[name]) {
            return false;
        }

        if (this.inputs[name].type &&
            String(this.inputs[name].type).toLowerCase() ==
            String(type).toLowerCase()) {
            return;
        }

        this.inputs[name].type = type;
        this._version++;
        if (this.onInputTypeChanged) {
            this.onInputTypeChanged(name, type);
        }
    }
    /**
         * Removes a global graph input
         * @method removeInput
         * @param {String} name
         * @param {String} type
         */
    removeInput(name) {
        if (!this.inputs[name]) {
            return false;
        }

        delete this.inputs[name];
        this._version++;

        if (this.onInputRemoved) {
            this.onInputRemoved(name);
        }

        if (this.onInputsOutputsChange) {
            this.onInputsOutputsChange();
        }
        return true;
    }
    /**
         * Creates a global graph output
         * @method addOutput
         * @param {String} name
         * @param {String} type
         * @param {*} value
         */
    addOutput(name, type, value) {
        this.outputs[name] = { name: name, type: type, value: value };
        this._version++;

        if (this.onOutputAdded) {
            this.onOutputAdded(name, type);
        }

        if (this.onInputsOutputsChange) {
            this.onInputsOutputsChange();
        }
    }
    /**
         * Assign a data to the global output
         * @method setOutputData
         * @param {String} name
         * @param {String} value
         */
    setOutputData(name, value) {
        var output = this.outputs[name];
        if (!output) {
            return;
        }
        output.value = value;
    }
    /**
         * Returns the current value of a global graph output
         * @method getOutputData
         * @param {String} name
         * @return {*} the data
         */
    getOutputData(name) {
        var output = this.outputs[name];
        if (!output) {
            return null;
        }
        return output.value;
    }
    /**
         * Renames a global graph output
         * @method renameOutput
         * @param {String} old_name
         * @param {String} new_name
         */
    renameOutput(old_name, name) {
        if (!this.outputs[old_name]) {
            return false;
        }

        if (this.outputs[name]) {
            console.error("there is already one output with that name");
            return false;
        }

        this.outputs[name] = this.outputs[old_name];
        delete this.outputs[old_name];
        this._version++;

        if (this.onOutputRenamed) {
            this.onOutputRenamed(old_name, name);
        }

        if (this.onInputsOutputsChange) {
            this.onInputsOutputsChange();
        }
    }
    /**
         * Changes the type of a global graph output
         * @method changeOutputType
         * @param {String} name
         * @param {String} type
         */
    changeOutputType(name, type) {
        if (!this.outputs[name]) {
            return false;
        }

        if (this.outputs[name].type &&
            String(this.outputs[name].type).toLowerCase() ==
            String(type).toLowerCase()) {
            return;
        }

        this.outputs[name].type = type;
        this._version++;
        if (this.onOutputTypeChanged) {
            this.onOutputTypeChanged(name, type);
        }
    }
    /**
         * Removes a global graph output
         * @method removeOutput
         * @param {String} name
         */
    removeOutput(name) {
        if (!this.outputs[name]) {
            return false;
        }
        delete this.outputs[name];
        this._version++;

        if (this.onOutputRemoved) {
            this.onOutputRemoved(name);
        }

        if (this.onInputsOutputsChange) {
            this.onInputsOutputsChange();
        }
        return true;
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
    //used for undo, called before any change is made to the graph
    beforeChange(info) {
        if (this.onBeforeChange) {
            this.onBeforeChange(this, info);
        }
        this.sendActionToCanvas("onBeforeChange", this);
    }
    //used to resend actions, called after any change is made to the graph
    afterChange(info) {
        if (this.onAfterChange) {
            this.onAfterChange(this, info);
        }
        this.sendActionToCanvas("onAfterChange", this);
    }
    connectionChange(node, link_info) {
        if (this.onConnectionChange) {
            this.onConnectionChange(node);
        }
        this._version++;
        this.sendActionToCanvas("onConnectionChange");
    }
    /**
         * returns if the graph is in live mode
         * @method isLive
         */
    isLive() {
        if (!this.list_of_graphcanvas) {
            return false;
        }

        for (var i = 0; i < this.list_of_graphcanvas.length; ++i) {
            var c = this.list_of_graphcanvas[i];
            if (c.live_mode) {
                return true;
            }
        }
        return false;
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
        this.sendActionToCanvas("setDirty", [true, true]);
        if (this.on_change) {
            this.on_change(this);
        }
    }
    setDirtyCanvas(fg, bg) {
        this.sendActionToCanvas("setDirty", [fg, bg]);
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
        if (this.links[link_id]) this.links.splice(link_id);
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
    configure(data, keep_old) {
        if (!data) {
            return;
        }

        if (!keep_old) {
            this.clear();
        }

        var nodes = data.nodes;

        //decode links info (they are very verbose)
        if (data.links && data.links.constructor === Array) {
            var links = [];
            for (var i = 0; i < data.links.length; ++i) {
                var link_data = data.links[i];
                if (!link_data) //weird bug
                {
                    console.warn("serialized graph link data contains errors, skipping.");
                    continue;
                }
                var link = new LLink();
                link.configure(link_data);
                links[link.id] = link;
            }
            data.links = links;
        }

        //copy all stored fields
        for (var i in data) {
            if (i == "nodes" || i == "groups") //links must be accepted
                continue;
            this[i] = data[i];
        }

        var error = false;

        //create nodes
        this._nodes = [];
        if (nodes) {
            for (var i = 0, l = nodes.length; i < l; ++i) {
                var n_info = nodes[i]; //stored info
                var node = LiteGraph.createNode(n_info.type, n_info.title);
                if (!node) {
                    if (LiteGraph.debug) {
                        console.log(
                            "Node not found or has errors: " + n_info.type
                        );
                    }

                    //in case of error we create a replacement node to avoid losing info
                    node = new LGraphNode();
                    node.last_serialization = n_info;
                    node.has_errors = true;
                    error = true;
                    //continue;
                }

                node.id = n_info.id; //id it or it will create a new id
                this.add(node, true); //add before configure, otherwise configure cannot create links
            }

            //configure nodes afterwards so they can reach each other
            for (var i = 0, l = nodes.length; i < l; ++i) {
                var n_info = nodes[i];
                var node = this.getNodeById(n_info.id);
                if (node) {
                    node.configure(n_info);
                }
            }
        }

        //groups
        this._groups.length = 0;
        if (data.groups) {
            for (var i = 0; i < data.groups.length; ++i) {
                var group = new LiteGraph.LGraphGroup();
                group.configure(data.groups[i]);
                this.add(group);
            }
        }

        this.extra = data.extra || {};

        if (this.onConfigure)
            this.onConfigure(data);

        this._version++;
        this.setDirtyCanvas(true, true);
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


class LGraphGroup {
    constructor(title) {
        this._ctor(title);
    }
    _ctor(title) {
        this.title = title || "Group";
        this.font_size = 24;
        this.color = LGraphCanvas.node_colors.pale_blue
            ? LGraphCanvas.node_colors.pale_blue.groupcolor
            : "#AAA";
        this._bounding = new Float32Array([10, 10, 140, 80]);
        this.pos = this._bounding.subarray(0, 2);
        this._size = this._bounding.subarray(2, 4);
        this._nodes = [];
        this.graph = null;


        Object.defineProperty(this, "size", {
            set: function (v) {
                if (!v || v.length < 2) {
                    return;
                }
                this._size[0] = Math.max(140, v[0]);
                this._size[1] = Math.max(80, v[1]);
            },
            get: function () {
                return this._size;
            },
            enumerable: true
        });
    }
    configure(o) {
        this.title = o.title;
        this._bounding.set(o.bounding);
        this.color = o.color;
        this.font = o.font;
    }
    serialize() {
        var b = this._bounding;
        return {
            title: this.title,
            bounding: [
                Math.round(b[0]),
                Math.round(b[1]),
                Math.round(b[2]),
                Math.round(b[3])
            ],
            color: this.color,
            font: this.font
        };
    }
    move(deltax, deltay, ignore_nodes) {
        this.pos[0] += deltax;
        this.pos[1] += deltay;
        if (ignore_nodes) {
            return;
        }
        for (var i = 0; i < this._nodes.length; ++i) {
            var node = this._nodes[i];
            node.pos[0] += deltax;
            node.pos[1] += deltay;
        }
    }
    recomputeInsideNodes() {
        this._nodes.length = 0;
        var nodes = this.graph._nodes;
        var node_bounding = new Float32Array(4);

        for (var i = 0; i < nodes.length; ++i) {
            var node = nodes[i];
            node.getBounding(node_bounding);
            if (!Math.overlapBounding(this._bounding, node_bounding)) {
                continue;
            } //out of the visible area
            this._nodes.push(node);
        }
    }
}

global.LGraphGroup = LiteGraph.LGraphGroup = LGraphGroup;


LGraphGroup.prototype.isPointInside = LGraphNode.prototype.isPointInside;
LGraphGroup.prototype.setDirtyCanvas = LGraphNode.prototype.setDirtyCanvas;

//****************************************



global.LGraphCanvas = LiteGraph.LGraphCanvas = LGraphCanvas;

LGraphCanvas.link_type_colors = {
    "-1": LiteGraph.EVENT_LINK_COLOR,
    number: "#AAA",
    node: "#DCA"
};
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

/* LiteGraph GUI elements used for canvas editing *************************************/

/**
 * ContextMenu from LiteGUI
 *
 * @class ContextMenu
 * @constructor
 * @param {Array} values (allows object { title: "Nice text", callback: function ... })
 * @param {Object} options [optional] Some options:\
 * - title: title to show on top of the menu
 * - callback: function to call when an option is clicked, it receives the item information
 * - ignore_item_callbacks: ignores the callback inside the item, it just calls the options.callback
 * - event: you can pass a MouseEvent, this way the ContextMenu appears in that position
 */
class ContextMenu {
    constructor(values, options) {
        options = options || {};
        this.options = options;
        var that = this;

        //to link a menu with its parent
        if (options.parentMenu) {
            if (options.parentMenu.constructor !== this.constructor) {
                console.error(
                    "parentMenu must be of class ContextMenu, ignoring it"
                );
                options.parentMenu = null;
            } else {
                this.parentMenu = options.parentMenu;
                this.parentMenu.lock = true;
                this.parentMenu.current_submenu = this;
            }
        }

        var eventClass = null;
        if (options.event) //use strings because comparing classes between windows doesnt work
            eventClass = options.event.constructor.name;
        if (eventClass !== "MouseEvent" &&
            eventClass !== "CustomEvent" &&
            eventClass !== "PointerEvent") {
            console.error(
                "Event passed to ContextMenu is not of type MouseEvent or CustomEvent. Ignoring it. (" + eventClass + ")"
            );
            options.event = null;
        }

        var root = document.createElement("div");
        root.className = "litegraph litecontextmenu litemenubar-panel";
        if (options.className) {
            root.className += " " + options.className;
        }
        root.style.minWidth = 100;
        root.style.minHeight = 100;
        root.style.pointerEvents = "none";
        setTimeout(function () {
            root.style.pointerEvents = "auto";
        }, 100); //delay so the mouse up event is not caught by this element


        //this prevents the default context browser menu to open in case this menu was created when pressing right button
        LiteGraph.pointerListenerAdd(root, "up",
            function (e) {
                //console.log("pointerevents: ContextMenu up root prevent");
                e.preventDefault();
                return true;
            },
            true
        );
        root.addEventListener(
            "contextmenu",
            function (e) {
                if (e.button != 2) {
                    //right button
                    return false;
                }
                e.preventDefault();
                return false;
            },
            true
        );

        LiteGraph.pointerListenerAdd(root, "down",
            function (e) {
                //console.log("pointerevents: ContextMenu down");
                if (e.button == 2) {
                    that.close();
                    e.preventDefault();
                    return true;
                }
            },
            true
        );

        function on_mouse_wheel(e) {
            var pos = parseInt(root.style.top);
            root.style.top =
                (pos + e.deltaY * options.scroll_speed).toFixed() + "px";
            e.preventDefault();
            return true;
        }

        if (!options.scroll_speed) {
            options.scroll_speed = 0.1;
        }

        root.addEventListener("wheel", on_mouse_wheel, true);
        root.addEventListener("mousewheel", on_mouse_wheel, true);

        this.root = root;

        //title
        if (options.title) {
            var element = document.createElement("div");
            element.className = "litemenu-title";
            element.innerHTML = options.title;
            root.appendChild(element);
        }

        //entries
        var num = 0;
        for (var i = 0; i < values.length; i++) {
            var name = values.constructor == Array ? values[i] : i;
            if (name != null && name.constructor !== String) {
                name = name.content === undefined ? String(name) : name.content;
            }
            var value = values[i];
            this.addItem(name, value, options);
            num++;
        }

        //close on leave? touch enabled devices won't work TODO use a global device detector and condition on that
        /*LiteGraph.pointerListenerAdd(root,"leave", function(e) {
            console.log("pointerevents: ContextMenu leave");
            if (that.lock) {
                return;
            }
            if (root.closing_timer) {
                clearTimeout(root.closing_timer);
            }
            root.closing_timer = setTimeout(that.close.bind(that, e), 500);
            //that.close(e);
        });*/
        LiteGraph.pointerListenerAdd(root, "enter", function (e) {
            //console.log("pointerevents: ContextMenu enter");
            if (root.closing_timer) {
                clearTimeout(root.closing_timer);
            }
        });

        //insert before checking position
        var root_document = document;
        if (options.event) {
            root_document = options.event.target.ownerDocument;
        }

        if (!root_document) {
            root_document = document;
        }

        if (root_document.fullscreenElement)
            root_document.fullscreenElement.appendChild(root);

        else
            root_document.body.appendChild(root);

        //compute best position
        var left = options.left || 0;
        var top = options.top || 0;
        if (options.event) {
            left = options.event.clientX - 10;
            top = options.event.clientY - 10;
            if (options.title) {
                top -= 20;
            }

            if (options.parentMenu) {
                var rect = options.parentMenu.root.getBoundingClientRect();
                left = rect.left + rect.width;
            }

            var body_rect = document.body.getBoundingClientRect();
            var root_rect = root.getBoundingClientRect();
            if (body_rect.height == 0)
                console.error("document.body height is 0. That is dangerous, set html,body { height: 100%; }");

            if (body_rect.width && left > body_rect.width - root_rect.width - 10) {
                left = body_rect.width - root_rect.width - 10;
            }
            if (body_rect.height && top > body_rect.height - root_rect.height - 10) {
                top = body_rect.height - root_rect.height - 10;
            }
        }

        if (options.event?.clientX) {
            root.style.left = left + "px";
            root.style.top = top + "px";
        }

        if (options.scale) {
            root.style.transform = "scale(" + options.scale + ")";
        }
    }
    //this code is used to trigger events easily (used in the context menu mouseleave
    static trigger(element, event_name, params, origin) {
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(event_name, true, true, params); //canBubble, cancelable, detail
        evt.srcElement = origin;
        if (element.dispatchEvent) {
            element.dispatchEvent(evt);
        } else if (element.__events) {
            element.__events.dispatchEvent(evt);
        }
        //else nothing seems binded here so nothing to do
        return evt;
    }
    static isCursorOverElement(event, element) {
        var left = event.clientX;
        var top = event.clientY;
        var rect = element.getBoundingClientRect();
        if (!rect) {
            return false;
        }
        if (top > rect.top &&
            top < rect.top + rect.height &&
            left > rect.left &&
            left < rect.left + rect.width) {
            return true;
        }
        return false;
    }
    addItem(name, value, options) {
        var that = this;
        options = options || {};

        var element = document.createElement("div");
        element.className = "litemenu-entry submenu";

        var disabled = false;

        if (value === null) {
            element.classList.add("separator");
            //element.innerHTML = "<hr/>"
            //continue;
        } else {
            element.innerHTML = value && value.title ? value.title : name;
            element.value = value;
            if (element.childNodes[1]) {
                element.childNodes[1].node = options.extra;
                element.childNodes[1].node_prop = value.value;
                element.childNodes[1].addEventListener('blur', function(event) {
                    if (event.target.value == "") event.target.value = "null"

                    this.node.properties[this.node_prop] = JSON.parse(event.target.value);
                    console.log('Input edited and focus lost:', event.target.value);
                });
            }
            if (value) {
                if (value.disabled) {
                    disabled = true;
                    element.classList.add("disabled");
                }
                if (value.submenu || value.has_submenu) {
                    element.classList.add("has_submenu");
                }
            }

            if (typeof value == "function") {
                element.dataset["value"] = name;
                element.onclick_callback = value;
            } else {
                element.dataset["value"] = value;
            }

            if (value.className) {
                element.className += " " + value.className;
            }
        }

        this.root.appendChild(element);
        if (!disabled && (value?.clickable == null || value?.clickable === true)) {
            element.addEventListener("click", inner_onclick);
        }
        if (options.autoopen) {
            LiteGraph.pointerListenerAdd(element, "enter", inner_over);
        }

        function inner_over(e) {
            var value = this.value;
            if (!value || !value.has_submenu) {
                return;
            }
            //if it is a submenu, autoopen like the item was clicked
            inner_onclick.call(this, e);
        }

        //menu option clicked
        function inner_onclick(e) {
            var value = this.value;
            var close_parent = true;

            if (that.current_submenu) {
                that.current_submenu.close(e);
            }

            //global callback
            if (options.callback) {
                var r = options.callback.call(
                    this,
                    value,
                    options,
                    e,
                    that,
                    options.node
                );
                if (r === true) {
                    close_parent = false;
                }
            }

            //special cases
            if (value) {
                if (value.callback &&
                    !options.ignore_item_callbacks &&
                    value.disabled !== true) {
                    //item callback
                    var r = value.callback.call(
                        this,
                        value,
                        options,
                        e,
                        that,
                        options.extra
                    );
                    if (r === true) {
                        close_parent = false;
                    }
                }
                if (value.submenu) {
                    if (!value.submenu.options) {
                        throw "ContextMenu submenu needs options";
                    }
                    var submenu = new that.constructor(value.submenu.options, {
                        callback: value.submenu.callback,
                        event: e,
                        parentMenu: that,
                        ignore_item_callbacks: value.submenu.ignore_item_callbacks,
                        title: value.submenu.title,
                        extra: value.submenu.extra,
                        autoopen: options.autoopen
                    });
                    close_parent = false;
                }
            }

            if (close_parent && !that.lock) {
                that.close();
            }
        }

        return element;
    }
    close(e, ignore_parent_menu) {
        if (this.root.parentNode) {
            this.root.parentNode.removeChild(this.root);
        }
        if (this.parentMenu && !ignore_parent_menu) {
            this.parentMenu.lock = false;
            this.parentMenu.current_submenu = null;
            if (e === undefined) {
                this.parentMenu.close();
            } else if (e &&
                !ContextMenu.isCursorOverElement(e, this.parentMenu.root)) {
                ContextMenu.trigger(this.parentMenu.root, LiteGraph.pointerevents_method + "leave", e);
            }
        }
        if (this.current_submenu) {
            this.current_submenu.close(e, true);
        }

        if (this.root.closing_timer) {
            clearTimeout(this.root.closing_timer);
        }

        // TODO implement : LiteGraph.contextMenuClosed(); :: keep track of opened / closed / current ContextMenu
        // on key press, allow filtering/selecting the context menu elements
    }
    //returns the top most menu
    getTopMenu() {
        if (this.options.parentMenu) {
            return this.options.parentMenu.getTopMenu();
        }
        return this;
    }
    getFirstEvent() {
        if (this.options.parentMenu) {
            return this.options.parentMenu.getFirstEvent();
        }
        return this.options.event;
    }
}

LiteGraph.ContextMenu = ContextMenu;

LiteGraph.closeAllContextMenus = function(ref_window) {
    ref_window = ref_window || window;

    var elements = ref_window.document.querySelectorAll(".litecontextmenu");
    if (!elements.length) {
        return;
    }

    var result = [];
    for (var i = 0; i < elements.length; i++) {
        result.push(elements[i]);
    }

    for (var i=0; i < result.length; i++) {
        if (result[i].close) {
            result[i].close();
        } else if (result[i].parentNode) {
            result[i].parentNode.removeChild(result[i]);
        }
    }
};

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



//Subgraph: a node that contains a graph
class Subgraph {
    constructor() {
        var that = this;
        this.size = [140, 80];
        this.properties = { enabled: true };
        this.enabled = true;

        //create inner graph
        this.subgraph = new LiteGraph.LGraph();
        this.subgraph._subgraph_node = this;
        this.subgraph._is_subgraph = true;

        this.subgraph.onTrigger = this.onSubgraphTrigger.bind(this);

        //nodes input node added inside
        this.subgraph.onInputAdded = this.onSubgraphNewInput.bind(this);
        this.subgraph.onInputRenamed = this.onSubgraphRenamedInput.bind(this);
        this.subgraph.onInputTypeChanged = this.onSubgraphTypeChangeInput.bind(this);
        this.subgraph.onInputRemoved = this.onSubgraphRemovedInput.bind(this);

        this.subgraph.onOutputAdded = this.onSubgraphNewOutput.bind(this);
        this.subgraph.onOutputRenamed = this.onSubgraphRenamedOutput.bind(this);
        this.subgraph.onOutputTypeChanged = this.onSubgraphTypeChangeOutput.bind(this);
        this.subgraph.onOutputRemoved = this.onSubgraphRemovedOutput.bind(this);
    }
    getProps() {
        return [["enabled", "boolean"]];
    }
    
    onDblClick(e, pos, graphcanvas) {
        var that = this;
        setTimeout(function () {
            graphcanvas.openSubgraph(that.subgraph);
        }, 10);
    }
    
    onAction(action, param) {
        this.subgraph.onAction(action, param);
    }
    onExecute() {
        this.enabled = this.getInputOrProperty("enabled");
        if (!this.enabled) {
            return;
        }

        //send inputs to subgraph global inputs
        if (this.inputs) {
            for (var i = 0; i < this.inputs.length; i++) {
                var input = this.inputs[i];
                var value = this.getInputData(i);
                this.subgraph.setInputData(input.name, value);
            }
        }

        //execute
        this.subgraph.runStep();

        //send subgraph global outputs to outputs
        if (this.outputs) {
            for (var i = 0; i < this.outputs.length; i++) {
                var output = this.outputs[i];
                var value = this.subgraph.getOutputData(output.name);
                this.setOutputData(i, value);
            }
        }
    }
    sendEventToAllNodes(eventname, param, mode) {
        if (this.enabled) {
            this.subgraph.sendEventToAllNodes(eventname, param, mode);
        }
    }
    onDrawBackground(ctx, graphcanvas, canvas, pos) {

        var y = this.size[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5;
        // button
        var over = Math.isInsideRectangle(pos[0], pos[1], this.pos[0], this.pos[1] + y, this.size[0], LiteGraph.NODE_TITLE_HEIGHT);
        let overleft = Math.isInsideRectangle(pos[0], pos[1], this.pos[0], this.pos[1] + y, this.size[0] / 2, LiteGraph.NODE_TITLE_HEIGHT);
        ctx.fillStyle = over ? "#555" : "#222";
        ctx.beginPath();
        if (this._shape == LiteGraph.BOX_SHAPE) {
            if (overleft) {
                ctx.rect(0, y, this.size[0] / 2 + 1, LiteGraph.NODE_TITLE_HEIGHT);
            } else {
                ctx.rect(this.size[0] / 2, y, this.size[0] / 2 + 1, LiteGraph.NODE_TITLE_HEIGHT);
            }
        }
        else {
            if (overleft) {
                ctx.roundRect(0, y, this.size[0] / 2 + 1, LiteGraph.NODE_TITLE_HEIGHT, [0, 0, 8, 8]);
            } else {
                ctx.roundRect(this.size[0] / 2, y, this.size[0] / 2 + 1, LiteGraph.NODE_TITLE_HEIGHT, [0, 0, 8, 8]);
            }
        }
        if (over) {
            ctx.fill();
        } else {
            ctx.fillRect(0, y, this.size[0] + 1, LiteGraph.NODE_TITLE_HEIGHT);
        }
        // button
        ctx.textAlign = "center";
        ctx.font = "24px Arial";
        ctx.fillStyle = over ? "#DDD" : "#999";
        ctx.fillText("+", this.size[0] * 0.25, y + 24);
        ctx.fillText("+", this.size[0] * 0.75, y + 24);
    }
    // Subgraph.prototype.onMouseDown = function(e, localpos, graphcanvas)
    // {
    // 	var y = this.size[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5;
    // 	if(localpos[1] > y)
    // 	{
    // 		graphcanvas.showSubgraphPropertiesDialog(this);
    // 	}
    // }
    onMouseDown(e, localpos, graphcanvas) {
        var y = this.size[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5;
        console.log(0);
        if (localpos[1] > y) {
            if (localpos[0] < this.size[0] / 2) {
                console.log(1);
                graphcanvas.showSubgraphPropertiesDialog(this);
            } else {
                console.log(2);
                graphcanvas.showSubgraphPropertiesDialogRight(this);
            }
        }
    }
    computeSize() {
        var num_inputs = this.inputs ? this.inputs.length : 0;
        var num_outputs = this.outputs ? this.outputs.length : 0;
        return [200, Math.max(num_inputs, num_outputs) * LiteGraph.NODE_SLOT_HEIGHT + LiteGraph.NODE_TITLE_HEIGHT];
    }
    //**** INPUTS ***********************************
    onSubgraphTrigger(event, param) {
        var slot = this.findOutputSlot(event);
        if (slot != -1) {
            this.triggerSlot(slot);
        }
    }
    onSubgraphNewInput(name, type) {
        var slot = this.findInputSlot(name);
        if (slot == -1) {
            //add input to the node
            this.addInput(name, type);
        }
    }
    onSubgraphRenamedInput(oldname, name) {
        var slot = this.findInputSlot(oldname);
        if (slot == -1) {
            return;
        }
        var info = this.getInputInfo(slot);
        info.name = name;
    }
    onSubgraphTypeChangeInput(name, type) {
        var slot = this.findInputSlot(name);
        if (slot == -1) {
            return;
        }
        var info = this.getInputInfo(slot);
        info.type = type;
    }
    onSubgraphRemovedInput(name) {
        var slot = this.findInputSlot(name);
        if (slot == -1) {
            return;
        }
        this.removeInput(slot);
    }
    //**** OUTPUTS ***********************************
    onSubgraphNewOutput(name, type) {
        var slot = this.findOutputSlot(name);
        if (slot == -1) {
            this.addOutput(name, type);
        }
    }
    onSubgraphRenamedOutput(oldname, name) {
        var slot = this.findOutputSlot(oldname);
        if (slot == -1) {
            return;
        }
        var info = this.getOutputInfo(slot);
        info.name = name;
    }
    onSubgraphTypeChangeOutput(name, type) {
        var slot = this.findOutputSlot(name);
        if (slot == -1) {
            return;
        }
        var info = this.getOutputInfo(slot);
        info.type = type;
    }
    onSubgraphRemovedOutput(name) {
        var slot = this.findInputSlot(name);
        if (slot == -1) {
            return;
        }
        this.removeOutput(slot);
    }
    // *****************************************************
    getExtraMenuOptions(graphcanvas) {
        var that = this;
        return [
            {
                content: "Open",
                callback: function () {
                    graphcanvas.openSubgraph(that.subgraph);
                }
            }
        ];
    }
    onResize(size) {
        size[1] += 20;
    }
    serialize() {
        var data = LiteGraph.LGraphNode.prototype.serialize.call(this);
        data.subgraph = this.subgraph.serialize();
        return data;
    }
    //no need to define node.configure, the default method detects node.subgraph and passes the object to node.subgraph.configure()
    clone() {
        var node = LiteGraph.createNode(this.type);
        var data = this.serialize();
        delete data["id"];
        delete data["inputs"];
        delete data["outputs"];
        node.configure(data);
        return node;
    }
    buildFromNodes(nodes) {
        //clear all?
        //TODO
        //nodes that connect data between parent graph and subgraph
        var subgraph_inputs = [];
        var subgraph_outputs = [];

        //mark inner nodes
        var ids = {};
        var min_x = 0;
        var max_x = 0;
        for (var i = 0; i < nodes.length; ++i) {
            var node = nodes[i];
            ids[node.id] = node;
            min_x = Math.min(node.pos[0], min_x);
            max_x = Math.max(node.pos[0], min_x);
        }

        var last_input_y = 0;
        var last_output_y = 0;

        for (var i = 0; i < nodes.length; ++i) {
            var node = nodes[i];
            //check inputs
            if (node.inputs)
                for (var j = 0; j < node.inputs.length; ++j) {
                    var input = node.inputs[j];
                    if (!input || !input.link)
                        continue;
                    var link = node.graph.links[input.link];
                    if (!link)
                        continue;
                    if (ids[link.origin_id])
                        continue;
                    //this.addInput(input.name,link.type);
                    this.subgraph.addInput(input.name, link.type);
                    /*
                    var input_node = LiteGraph.createNode("graph/input");
                    this.subgraph.add( input_node );
                    input_node.pos = [min_x - 200, last_input_y ];
                    last_input_y += 100;
                    */
                }

            //check outputs
            if (node.outputs)
                for (var j = 0; j < node.outputs.length; ++j) {
                    var output = node.outputs[j];
                    if (!output || !output.links || !output.links.length)
                        continue;
                    var is_external = false;
                    for (var k = 0; k < output.links.length; ++k) {
                        var link = node.graph.links[output.links[k]];
                        if (!link)
                            continue;
                        if (ids[link.target_id])
                            continue;
                        is_external = true;
                        break;
                    }
                    if (!is_external)
                        continue;
                    //this.addOutput(output.name,output.type);
                    /*
                    var output_node = LiteGraph.createNode("graph/output");
                    this.subgraph.add( output_node );
                    output_node.pos = [max_x + 50, last_output_y ];
                    last_output_y += 100;
                    */
                }
        }

        //detect inputs and outputs
        //split every connection in two data_connection nodes
        //keep track of internal connections
        //connect external connections
        //clone nodes inside subgraph and try to reconnect them
        //connect edge subgraph nodes to extarnal connections nodes
    }
}

Subgraph.title = "Subgraph";
Subgraph.desc = "Graph inside a node";
Subgraph.title_color = "#334";


LiteGraph.Subgraph = Subgraph;
//LiteGraph.registerNodeType("graph/subgraph", Subgraph);

//Input for a subgraph
class GraphInput {
    constructor() {
        this.addOutput("", "number");

        this.name_in_graph = "";
        this.properties = {
            name: "",
            type: "number",
            value: 0
        };

        var that = this;

        this.name_widget = this.addWidget(
            "text",
            "Name",
            this.properties.name,
            function (v) {
                if (!v) {
                    return;
                }
                that.setProperty("name", v);
            }
        );
        this.type_widget = this.addWidget(
            "text",
            "Type",
            this.properties.type,
            function (v) {
                that.setProperty("type", v);
            }
        );

        this.value_widget = this.addWidget(
            "number",
            "Value",
            this.properties.value,
            function (v) {
                that.setProperty("value", v);
            }
        );

        this.widgets_up = true;
        this.size = [180, 90];
    }
    onConfigure() {
        this.updateType();
    }
    //ensures the type in the node output and the type in the associated graph input are the same
    updateType() {
        var type = this.properties.type;
        this.type_widget.value = type;

        //update output
        if (this.outputs[0].type != type) {
            if (!LiteGraph.isValidConnection(this.outputs[0].type, type))
                this.disconnectOutput(0);
            this.outputs[0].type = type;
        }

        //update widget
        if (type == "number") {
            this.value_widget.type = "number";
            this.value_widget.value = 0;
        }
        else if (type == "boolean") {
            this.value_widget.type = "toggle";
            this.value_widget.value = true;
        }
        else if (type == "string") {
            this.value_widget.type = "text";
            this.value_widget.value = "";
        }

        else {
            this.value_widget.type = null;
            this.value_widget.value = null;
        }
        this.properties.value = this.value_widget.value;

        //update graph
        if (this.graph && this.name_in_graph) {
            this.graph.changeInputType(this.name_in_graph, type);
        }
    }
    //this is executed AFTER the property has changed
    onPropertyChanged(name, v) {
        if (name == "name") {
            if (v == "" || v == this.name_in_graph || v == "enabled") {
                return false;
            }
            if (this.graph) {
                if (this.name_in_graph) {
                    //already added
                    this.graph.renameInput(this.name_in_graph, v);
                } else {
                    this.graph.addInput(v, this.properties.type);
                }
            } //what if not?!
            this.name_widget.value = v;
            this.name_in_graph = v;
        }
        else if (name == "type") {
            this.updateType();
        }
    }
    getTitle() {
        return this.title;
    }
    onAction(action, param) {
        if (this.properties.type == LiteGraph.EVENT) {
            this.triggerSlot(0, param);
        }
    }
    onExecute() {
        var name = this.properties.name;
        //read from global input
        var data = this.graph.inputs[name];
        if (!data) {
            this.setOutputData(0, this.properties.value);
            return;
        }

        this.setOutputData(0, data.value !== undefined ? data.value : this.properties.value);
    }
    onRemoved() {
        if (this.name_in_graph) {
            this.graph.removeInput(this.name_in_graph);
        }
    }
}

GraphInput.title = "Input";
GraphInput.desc = "Input of the graph";



LiteGraph.GraphInput = GraphInput;
//LiteGraph.registerNodeType("graph/input", GraphInput);

//Output for a subgraph
class GraphOutput {
    constructor() {
        this.addInput("", "");

        this.name_in_graph = "";
        this.properties = { name: "", type: "" };
        var that = this;

        // Object.defineProperty(this.properties, "name", {
        //     get: function() {
        //         return that.name_in_graph;
        //     },
        //     set: function(v) {
        //         if (v == "" || v == that.name_in_graph) {
        //             return;
        //         }
        //         if (that.name_in_graph) {
        //             //already added
        //             that.graph.renameOutput(that.name_in_graph, v);
        //         } else {
        //             that.graph.addOutput(v, that.properties.type);
        //         }
        //         that.name_widget.value = v;
        //         that.name_in_graph = v;
        //     },
        //     enumerable: true
        // });
        // Object.defineProperty(this.properties, "type", {
        //     get: function() {
        //         return that.inputs[0].type;
        //     },
        //     set: function(v) {
        //         if (v == "action" || v == "event") {
        //             v = LiteGraph.ACTION;
        //         }
        //         if (!LiteGraph.isValidConnection(that.inputs[0].type,v))
        // 			that.disconnectInput(0);
        //         that.inputs[0].type = v;
        //         if (that.name_in_graph) {
        //             //already added
        //             that.graph.changeOutputType(
        //                 that.name_in_graph,
        //                 that.inputs[0].type
        //             );
        //         }
        //         that.type_widget.value = v || "";
        //     },
        //     enumerable: true
        // });
        this.name_widget = this.addWidget("text", "Name", this.properties.name, "name");
        this.type_widget = this.addWidget("text", "Type", this.properties.type, "type");
        this.widgets_up = true;
        this.size = [180, 60];
    }
    onPropertyChanged(name, v) {
        if (name == "name") {
            if (v == "" || v == this.name_in_graph || v == "enabled") {
                return false;
            }
            if (this.graph) {
                if (this.name_in_graph) {
                    //already added
                    this.graph.renameOutput(this.name_in_graph, v);
                } else {
                    this.graph.addOutput(v, this.properties.type);
                }
            } //what if not?!
            this.name_widget.value = v;
            this.name_in_graph = v;
        }
        else if (name == "type") {
            this.updateType();
        }
        else if (name == "value") {
        }
    }
    updateType() {
        var type = this.properties.type;
        if (this.type_widget)
            this.type_widget.value = type;

        //update output
        if (this.inputs[0].type != type) {

            if (type == "action" || type == "event")
                type = LiteGraph.EVENT;
            if (!LiteGraph.isValidConnection(this.inputs[0].type, type))
                this.disconnectInput(0);
            this.inputs[0].type = type;
        }

        //update graph
        if (this.graph && this.name_in_graph) {
            this.graph.changeOutputType(this.name_in_graph, type);
        }
    }
    onExecute() {
        this._value = this.getInputData(0);
        this.graph.setOutputData(this.properties.name, this._value);
    }
    onAction(action, param) {
        if (this.properties.type == LiteGraph.ACTION) {
            this.graph.trigger(this.properties.name, param);
        }
    }
    onRemoved() {
        if (this.name_in_graph) {
            this.graph.removeOutput(this.name_in_graph);
        }
    }
    getTitle() {
        return this.title;
    }
}

GraphOutput.title = "Output";
GraphOutput.desc = "Output of the graph";

    

LiteGraph.GraphOutput = GraphOutput;
//LiteGraph.registerNodeType("graph/output", GraphOutput);




export { LGraph };