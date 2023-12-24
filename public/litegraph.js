import LGraphCanvas from "./canvas.js"
import LLink from "./link.mjs"
import LGraphNode from "./node.js"
import NodeCore from "./node_core.mjs";


export var LiteGraph = {
    CANVAS_GRID_SIZE: 64,
    NODE_TITLE_HEIGHT: 0,
    NODE_TITLE_TEXT_Y: 10,
    NODE_SLOT_HEIGHT: 64,
    NODE_WIDGET_HEIGHT: 20,
    NODE_WIDTH: 64,
    NODE_TITLE_COLOR: "#999",
    NODE_SELECTED_TITLE_COLOR: "#FFF",
    NODE_TEXT_SIZE: 14,
    NODE_TEXT_COLOR: "#AAA",
    NODE_SUBTEXT_SIZE: 12,
    NODE_DEFAULT_COLOR: "#333",
    NODE_DEFAULT_BGCOLOR: "#353535",
    NODE_DEFAULT_BOXCOLOR: "#666",
    NODE_BOX_OUTLINE_COLOR: "#FFF",
    DEFAULT_SHADOW_COLOR: "rgba(0,0,0,0.5)",

    WIDGET_TEXT_COLOR: "#DDD",

    LINK_COLOR: "#6B6",
    CONNECTING_LINK_COLOR: "#AFA",

    DEFAULT_POSITION: [32, 32], //default node position

    //enums
    INPUT: 1,
    OUTPUT: 2,

    EVENT: -1, //for outputs

    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4,
    CENTER: 5,
    NORMAL_TITLE: 0,
    NO_TITLE: 1,

    debug: false,
    catch_exceptions: true,
    throw_errors: true,
    allow_scripts: false, //if set to true some nodes like Formula would be allowed to evaluate code that comes from unsafe sources (like node configuration), which could lead to exploits
    registered_node_types: {}, //nodetypes by string
    node_types_by_file_extension: {}, //used for dropping files in the canvas
    Nodes: {}, //node types by classname
    Globals: {}, //used to store vars between graphs

    auto_load_slot_types: false, // [if want false, use true, run, get vars values to be statically set, than disable] nodes types and nodeclass association with node types need to be calculated, if dont want this, calculate once and set registered_slot_[in/out]_types and slot_types_[in/out]
    
    alt_drag_do_clone_nodes: true, // [true!] very handy, ALT click to clone and drag the new node
    
    pointerevents_method: "mouse", // "mouse"|"pointer" use mouse for retrocompatibility issues? (none found @ now)

    alphabet : [],

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
                for (i in base_class.supported_extensions) {
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
    }
};
window.LiteGraph = LiteGraph;

for (let i = 97; i <= 123; i++) {
    LiteGraph.alphabet.push(String.fromCharCode(i));
}

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

    /**
         * Removes all nodes from this graph
         * @method clear
         */
    clear() {
        this.status = LGraph.STATUS_STOPPED;

        this._version = -1; //used to detect changes


        //safe clear
        if (this.nodes) {
            for (var i = 0; i < this.nodes.length; ++i) {
                var node = this.nodes[i];
                if (node.onRemoved) {
                    node.onRemoved();
                }
            }
        }

        //nodes
        this.nodes = [];

        //links
        this.links = []; //container with all the links

        //custom data
        this.config = {};
        this.vars = {};

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
            if (this.nodes[i] == null && this.links[i] == null) {
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
        if (node.id == null || (node.id != -1 && this.nodes[node.id] != null)) {
            console.warn(
                "LiteGraph: there is already a node with this ID, changing it"
            );
            node.id = this.getNextID();
        }

        node.graph = this;
        this.nodes[node.id] = node;

        if (this.config.align_to_grid) {
            node.alignToGrid();
        }


        this.canvas.setDirty(true);
        this.change();

        return node; //to chain actions
    }

    removeNodeByID(nodeID) {
        let node = this.nodes[nodeID];
        if (node == null) {
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
                    window.sendToServer("remLink", {"nodeID": link.id});
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
                    window.sendToServer("remLink", {"nodeID": link.id});
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
        this.nodes = this.nodes.filter(obj => obj.id !== node.id);

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
        return this.nodes[id];
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
        for (var i = 0, l = this.nodes.length; i < l; ++i) {
            if (this.nodes[i].constructor === classObject) {
                result.push(this.nodes[i]);
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
        for (var i = 0, l = this.nodes.length; i < l; ++i) {
            if (this.nodes[i].title == title) {
                result.push(this.nodes[i]);
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
        nodes_list = nodes_list || this.nodes;
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
        for (var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i];
            var ctor = LiteGraph.registered_node_types[node.type];
            if (node.constructor == ctor) {
                continue;
            }
            console.log("node being replaced by newer version: " + node.type);
            var newnode = LiteGraph.createNode(node.type);
            this.nodes[i] = newnode;
            newnode.configure(node.serialize());
            newnode.graph = this;
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
        for (var i = 0, l = this.nodes.length; i < l; ++i) {
            nodes_info.push(this.nodes[i].serialize());
        }

        //pack link info into a non-verbose format
        var links = [];
        for (i in this.links) {
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


        var data = {
            nodes: nodes_info,
            links: links,
            config: this.config,
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
        var i, l;
        this.nodes = data.nodes;

        //create nodes
        this.nodes = [];
        if (data.nodes) {
            for (i = 0, l = data.nodes.length; i < l; ++i) {
                var n_info = data.nodes[i]; //stored info
                if (!n_info) continue;
                var node = LiteGraph.createNode(n_info.type, n_info.title, n_info.properties);
                node.id = n_info.nodeID; //id it or it will create a new id
                node.widget.id = n_info.nodeID;
                if (n_info.posX != null) {
                    node.widget.pos = [n_info.posX, n_info.posY];
                } else {
                    node.widget.pos = n_info.widget.pos;
                }
                node.configure(n_info.properties);
                //node.widget.size = n_info.widget.size;
                this.add(node, true); //add before configure, otherwise configure cannot create links
            }
        }

        //decode links info (they are very verbose)
        if (data.links) {
            for (i = 0; i < data.links.length; ++i) {
                if (data.links[i] == null) continue;
                var link = new LLink();
                link.configure(data.links[i]);
                this.links[link.id] = link;
            }
        }


        if (this.onConfigure)
            this.onConfigure(data);

        this._version++;
        this.canvas.setDirty(true, true);
        return false;
    }
}


window.LGraph = LiteGraph.LGraph = LGraph;
LiteGraph.LLink = LLink;
window.LGraphNode = LiteGraph.LGraphNode = LGraphNode;
window.LGraphCanvas = LiteGraph.LGraphCanvas = LGraphCanvas;


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
}


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
            oDOM.addEventListener(sMethod+sEvent, fCall, capture);
        break;
        // only pointerevents
        case "leave": case "cancel": case "gotpointercapture": case "lostpointercapture":
            if (sMethod!="mouse"){
                return oDOM.addEventListener(sMethod+sEvent, fCall, capture);
            }
        break;
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
        break;
        // only pointerevents
        case "leave": case "cancel": case "gotpointercapture": case "lostpointercapture":
        {
            if (LiteGraph.pointerevents_method=="pointer"){
                return oDOM.removeEventListener(LiteGraph.pointerevents_method+sEvent, fCall, capture);
            }
        }
        break;
        // not "pointer" || "mouse"
        default:
            return oDOM.removeEventListener(sEvent, fCall, capture);
    }
}

if (typeof window != "undefined" && !window["requestAnimationFrame"]) {
    window.requestAnimationFrame =
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
}

export { LGraph };