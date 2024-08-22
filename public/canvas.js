import { NodiEnums, globalApp } from "./enums.mjs";
import View from "./view.js";
import NodeWork from "./nodework.mjs";
import Node from "./node.mjs";

var tmp_area = new Float32Array(4);
var presstimer = null;

export default class LGraphCanvas {
  constructor(canvas, graph, options) {
    this.options = options = options || {};
    if (canvas && canvas.constructor === String) {
      canvas = document.querySelector(canvas);
    }
    this.ds = new View();
    this.cursorMode = 0;
    this.zoom_modify_alpha = true; //otherwise it generates ugly patterns when scaling down too much

    this.inner_text_font = "normal " + NodiEnums.NODE_SUBTEXT_SIZE + "px Arial";
    this.node_title_color = NodiEnums.NODE_TITLE_COLOR;
    this.default_connection_color = {
      input_off: "#778",
      input_on: "#7F7",
      output_off: "#778",
      output_on: "#7F7",
    };

    this.use_gradients = false; //set to true to render titlebar with gradients
    this.editor_alpha = 1; //used for transition
    this.pause_rendering = false;

    this.render_only_selected = true;
    this.show_info = false;
    this.allow_dragcanvas = true;
    this.align_to_grid = true; //snap to grid

    this.drag_mode = false;
    this.dragging_rectangle = null;

    this.filter = null; //allows to filter to only accept some type of nodes in a graph

    this.render_shadows = true;

    this.mouse = [0, 0];
    this.graph_mouse = [0, 0];
    this.grid_mouse = [0, 0]; //mouse in grid coordinates

    //callbacks
    this.onMouse = null;

    this.connections_width = 3;
    this.round_radius = 8;

    this.Node = Node;
    this.current_node_cbs = [];
    this.node_widget = null; //used for widgets
    this.last_mouse_position = [0, 0];
    this.visible_area = this.ds.visible_area;

    this.viewport = options.viewport || null; //to constraint render area to a portion of the canvas

    this.setCanvas(canvas, options.skip_events);
    this.clear();
    this.startRendering();
    this.autoresize = options.autoresize;

    // Reference positions for the start of the transformation.
    this.referencePair = null;

    // Object of callbacks this function provides.
    this.callbacks = {
      rotate: null,
      scale: null,
    };

    // Define gesture states.
    this.Gestures = {
      NONE: 0,
      ROTATE: 1,
      SCALE: 2,
    };
    // Define thresholds for gestures.
    this.Thresholds = {
      SCALE: 0.02, // percentage difference.
      ROTATION: 5, // degrees.
    };
    // The current gesture of this transformation.
    this.currentGesture = this.Gestures.NONE;
  }

  static getFileExtension(url) {
    var question = url.indexOf("?");
    if (question != -1) {
      url = url.substr(0, question);
    }
    var point = url.lastIndexOf(".");
    if (point == -1) {
      return "";
    }
    return url.substr(point + 1).toLowerCase();
  }

  static decodeHTML(str) {
    var e = document.createElement("div");
    e.innerText = str;
    return e.innerHTML;
  }

  static getPropertyPrintableValue(value, values) {
    if (!values) return String(value);

    if (values.constructor === Array) {
      return String(value);
    }

    if (values.constructor === Object) {
      var desc_value = "";
      for (var k in values) {
        if (values[k] != value) continue;
        desc_value = k;
        break;
      }
      return String(value) + " (" + desc_value + ")";
    }
  }
  /**
   * clears all the data inside
   *
   * @method clear
   */
  clear() {
    this.frame = 0;
    this.last_draw_time = 0;
    this.render_time = 0;
    this.fps = 0;

    this.dragging_rectangle = null;
    this.selected_nodes = [];
    this.visible_nodes = [];
    this.node_over = null;
    this.node_dragging = null;
    this.node_capturing_input = null;
    this.connecting_node = null;

    this.dragging_canvas = false;

    this.dirty_bgcanvas = true;

    this.node_in_panel = null;
    this.node_widget = null;

    this.last_mouse_down = [0, 0];
    this.last_mouseclick = 0;
    this.visible_area.set([0, 0, 0, 0]);

    if (this.onClear) {
      this.onClear();
    }
  }

  /**
   * assigns a canvas
   *
   * @method setCanvas
   * @param {Canvas} assigns a canvas (also accepts the ID of the element (not a selector)
   */
  setCanvas(canvas, skip_events) {
    if (canvas) {
      if (canvas.constructor === String) {
        canvas = document.getElementById(canvas);
        if (!canvas) {
          throw "Error creating canvas: Canvas not found";
        }
      }
    }

    if (canvas === this.canvas) {
      return;
    }

    this.canvas = canvas;
    this.ds.element = canvas;

    if (!canvas) {
      return;
    }

    //this.canvas.tabindex = "1000";
    canvas.className += " lgraphcanvas";
    canvas.data = this;
    canvas.tabindex = "1"; //to allow key events

    if (canvas.getContext == null) {
      if (canvas.localName != "canvas") {
        throw "Element supplied for LGraphCanvas must be a <canvas> element, you passed a " + canvas.localName;
      }
      throw "This browser doesn't support Canvas";
    }

    this.ctx = canvas.getContext("2d");

    //input:  (move and up could be unbinded)
    if (!skip_events) {
      this.bindEvents();
    }
  }
  //used in some events to capture them
  _doNothing(e) {
    //console.log("pointerevents: _doNothing "+e.type);
    e.preventDefault();
    return false;
  }
  _doReturnTrue(e) {
    e.preventDefault();
    return true;
  }
  /**
   * binds mouse, keyboard, touch and drag events to the canvas
   * @method bindEvents
   */
  bindEvents() {
    if (this._events_binded) {
      console.warn("LGraphCanvas: events already binded");
      return;
    }

    //console.log("pointerevents: bindEvents");
    var canvas = this.canvas;

    var ref_window = this.getCanvasWindow();
    var document = ref_window.document; //hack used when moving canvas between windows

    canvas.addEventListener("mousedown", this.processMouseDown.bind(this), false);
    canvas.addEventListener("mouseup", this.processMouseUp.bind(this), false);
    canvas.addEventListener("mousemove", this.processMouseMove.bind(this), false);
    canvas.addEventListener("dblclick", this.processNodeDblClicked.bind(this), false);
    canvas.addEventListener("touchstart", this.processMouseDown.bind(this), false);
    canvas.addEventListener("touchmove", this.processMouseMove.bind(this), false);
    canvas.addEventListener("touchend", this.processMouseUp.bind(this), false);
    canvas.addEventListener("mousewheel", this.processMouseWheel.bind(this), false);
    canvas.addEventListener("DOMMouseScroll", this.processMouseWheel.bind(this), false);
    canvas.addEventListener("keydown", this.processKey.bind(this), true);
    document.addEventListener("keyup", this.processKey.bind(this), true); //in document, otherwise it doesn't fire keyup
    canvas.addEventListener("dragover", this._doNothing, false);
    canvas.addEventListener("dragend", this._doNothing, false);
    canvas.addEventListener("drop", this._ondrop_callback, false);
    canvas.addEventListener("dragenter", this._doReturnTrue, false);

    this._events_binded = true;
  }

  /**
   * Used to attach the canvas in a popup
   *
   * @method getCanvasWindow
   * @return {window} returns the window where the canvas is attached (the DOM root node)
   */
  getCanvasWindow() {
    if (!this.canvas) {
      return window;
    }
    var doc = this.canvas.ownerDocument;
    return doc.defaultView || doc.parentWindow;
  }
  /**
   * starts rendering the content of the canvas when needed
   *
   * @method startRendering
   */
  startRendering() {
    if (this.is_rendering) {
      return;
    } //already rendering

    this.is_rendering = true;
    renderFrame.call(this);

    function renderFrame() {
      if (!this.pause_rendering) {
        this.draw();
      }

      var cwindow = this.getCanvasWindow();
      if (this.is_rendering) {
        cwindow.requestAnimationFrame(renderFrame.bind(this));
      }
    }
  }

  processLongPress(e) {
    if (!window.currentNodeWork) return;
    if (e.which > 1) return;
    if (e.touches?.length == 2) return;
    this.adjustMouseEvent(e);

    //console.log("pointerevents: processMouseDown pointerId:"+e.pointerId+" which:"+e.which+" isPrimary:"+e.isPrimary+" :: x y "+x+" "+y);
    this.ds.viewport = this.viewport;
    this.mouse = [e.clientX, e.clientY];
    this.graph_mouse = [e.canvasX, e.canvasY];
    this.last_click_position = [e.clientX, e.clientY];

    if (this.selected_nodes.length) {
      for (let i in this.selected_nodes) {
        let n = this.selected_nodes[i];
        var node_type = NodeWork.getNodeType(n.type);
        if (node_type.moveable) {
          window.sendToNodework("moveNodeOnGrid", {id: n.nodeID, from: this.grid_selected, to: e.gridPos});
        }
      }
      this.node_dragging = null;
    }
  }

  processMouseDown(e) {
    if (!window.currentNodeWork) return;
    if (e.which > 1) return;
    if (e.touches?.length == 2) {
      window.scale = window.canvas.ds.scale;
      // Save these two points as the reference.
      this.referencePair = new TouchPair(e.touches);
      return;
    }
    this.adjustMouseEvent(e);
    var self = this;
    presstimer = setTimeout(function() {
      self.processLongPress(e);
    }, 200);

    //console.log("pointerevents: processMouseDown pointerId:"+e.pointerId+" which:"+e.which+" isPrimary:"+e.isPrimary+" :: x y "+x+" "+y);
    this.ds.viewport = this.viewport;
    this.mouse = [e.clientX, e.clientY];
    this.graph_mouse = [e.canvasX, e.canvasY];
    this.last_click_position = [e.clientX, e.clientY];

    var node_mouse = globalApp.data.nodeContainer[NodeWork.getNodeOnPos(window.currentNodeWork, e.canvasX, e.canvasY)];
    var node_type = NodeWork.getNodeType(node_mouse?.type);

    this.canvas.focus();
    //multiselect
    if (e.ctrlKey) {
      this.dragging_rectangle = new Float32Array(4);
      this.dragging_rectangle[0] = e.canvasX;
      this.dragging_rectangle[1] = e.canvasY;
      this.dragging_rectangle[2] = 1;
      this.dragging_rectangle[3] = 1;
    } 
    // clone node ALT dragging
    else if (e.altKey && node_mouse != null) {
      let cloned = Node.clone(node_mouse);
      if (cloned) {
        cloned.pos[0] += 5;
        cloned.pos[1] += 5;
        window.currentNodeWork.add(cloned, false, { doCalcSize: false });
        node_mouse = cloned;
        this.node_dragging = node_mouse;
        if (!this.selected_nodes[node_mouse.nodeID]) {
          this.processNodeSelected(node_mouse, e);
        }
      }
    }
    // select node first time
    else if (node_mouse != null && window.canvas.copyNode == null && node_mouse != window.current_node) {
      this.grid_selected = e.gridPos;
      var gridCorner = NodiEnums.toCanvas(e.gridPos);
      this.nodeDragGripPos = [e.canvasX - gridCorner[0], e.canvasY - gridCorner[1]];

      // Capture mouse by node gui
      if (node_type.onMouseDown != null) {
        node_type.onMouseDown(node_mouse, e, this.nodeDragGripPos, this);
      }

      this.node_pressed = node_mouse;
      this.gripped = "node";
      if (!this.selected_nodes[node_mouse.nodeID]) {
        this.processNodeSelected(node_mouse, e);
      }
    } 
    // grip canvas
    else if (window.canvas.copyNode == null && node_mouse == null && (this.grid_selected == undefined || (this.grid_selected && (this.grid_selected[0] != e.gridPos[0] || this.grid_selected[1] != e.gridPos[1])))) {
      this.gripped = "canvas";
      this.deselectAllNodes();
    }
    // reselect the same one
    else if (node_mouse != null && node_mouse == window.current_node) {
      let nodeClass = NodeWork.getNodeType(window.current_node?.type);
      if (nodeClass.reselect) {
        nodeClass.reselect(window.current_node);
      }
      // Capture mouse by node gui
      if (nodeClass.onMouseDown != null) {
        nodeClass.onMouseDown(node_mouse, e, this.nodeDragGripPos, this);
      }
    }
    // select another
    else if (window.canvas.copyNode == null && this.grid_selected && (this.grid_selected[0] == e.gridPos[0] && this.grid_selected[1] == e.gridPos[1])) {
      this.grid_selected = e.gridPos;
      if(window.current_node) window.current_node.selected = false;
      window.current_node = null;
      this.deselectAllNodes();
      this.gripped = "cell";
    } 
    // add existing node
    else if (node_mouse == null && window.canvas.copyNode != null) {
      this.gripped = "copyNode";
      NodeWork.setNodeOnGrid(window.currentNodeWork, { nodeID: this.copyNode, pos: e.gridPos });
    }

    this.last_mouse_down = [e.clientX, e.clientY];
    this.last_mouse_dragging = true;

    this.draw();

    e.stopPropagation();

    return false;
  }

  /**
   * Called when a mouse move event has to be processed
   * @method processMouseMove
   */
  processMouseMove(e) {
    if (e.touches?.length == 2) {
      e.preventDefault();

      var touches = e.touches;

      // Get the current touches as a TouchPair.
      var currentPair = new TouchPair(touches);
      // Compute angle and scale differences WRT reference position.
      var scale = window.scale * currentPair.scaleSince(this.referencePair);

      // Check if we're already in a gesture locked state.
      if (this.currentGesture == this.Gestures.NONE) {
        if (scale > 1 + this.Thresholds.SCALE || scale < 1 - this.Thresholds.SCALE) {
          // Otherwise if scaled enough, start a scaling gesture.
          this.currentGesture = this.Gestures.SCALE;
          
        }
      }
      var center = currentPair.center();
      if (this.currentGesture == this.Gestures.SCALE) {
        // If already scaling, callback with scale amount.
        this.setZoom(scale, center);
      }
      return;
    }

    clearTimeout(presstimer);


    if (this.autoresize) {
      this.resize();
    }

    if (!window.currentNodeWork) {
      return;
    }

    this.adjustMouseEvent(e);
    this.mouse = [e.clientX, e.clientY];
    var delta = [this.mouse[0] - this.last_mouse_down[0], this.mouse[1] - this.last_mouse_down[1]];
    this.graph_mouse = [e.canvasX, e.canvasY];
    this.gridPos = NodiEnums.toGrid([e.canvasX, e.canvasY]);
    this.grid_mouse = NodiEnums.toCanvas(this.gridPos);
    //get node over
    this.node_over = NodeWork.getNodeOnPos(window.currentNodeWork, e.canvasX, e.canvasY);

    //console.log("processMouseMove " + this.last_mouse_down);

    e.dragging = this.last_mouse_dragging;
    if (this.gripped == "node" && this.node_pressed) {
      NodeWork.setNodeIDOnGrid(window.currentNodeWork, this.grid_selected.x, this.grid_selected.y, null);
      this.canvas.style.cursor = "move";
      this.node_dragging = this.node_pressed;
      this.node_pressed = null;
    } else if (this.dragging_rectangle) {
      this.dragging_rectangle[2] = e.canvasX - this.dragging_rectangle[0];
      this.dragging_rectangle[3] = e.canvasY - this.dragging_rectangle[1];
    } else if (this.gripped == "canvas" && this.allow_dragcanvas) {
      ////console.log("pointerevents: processMouseMove is dragging_canvas");
      this.ds.offset[0] += delta[0] / this.ds.scale;
      this.ds.offset[1] += delta[1] / this.ds.scale;
    } else if (this.gripped == "copyNode" && this.node_over == null) {
      NodeWork.setNodeOnGrid(window.currentNodeWork, { nodeID: this.copyNode, pos: e.gridPos });
    } else if (this.gripped == "node" && this.node_dragging) {
      //node being dragged
      if (window.settings?.ownerShip == false || this.node_dragging.owner == window.socketIO.id) {
        if (delta[0] != 0 && delta[1] != 0 && window.move) {
          window.move(this.node_dragging.nodeID, {
            pos: this.node_dragging.pos,
          });
        }
      }
    } else {
      //mouse over a node
      //not over a node

      if (this.canvas) {
        this.canvas.style.cursor = "";
      }

      //send event to node if capturing input (used with widgets that allow drag outside of the area of the node)
      if (this.node_capturing_input && this.node_capturing_input.onMouseMove) {
        this.node_capturing_input.onMouseMove(
          e,
          [e.canvasX - this.node_capturing_input.pos[0], e.canvasY - this.node_capturing_input.pos[1]],
          this
        );
      }
    }
    this.last_mouse_down[0] = e.clientX;
    this.last_mouse_down[1] = e.clientY;
    e.preventDefault();
    return false;
  }

  /**
   * Called when a mouse up event has to be processed
   * @method processMouseUp
   */
  processMouseUp(e) {
    if (e.touches?.length < 2) {
      this.currentGesture = this.Gestures.NONE;
    }
    var node_mouse = NodeWork.getNodeOnPos(window.currentNodeWork, e.canvasX, e.canvasY);
    var node_type = NodeWork.getNodeType(node_mouse?.type);
    //console.log("pointerevents: processMouseUp "+e.pointerId+" "+e.isPrimary+" :: "+e.clientX+" "+e.clientY);
    if (!window.currentNodeWork) return;

    this.adjustMouseEvent(e);
    var now = NodiEnums.getTime();
    e.click_time = now - this.last_mouseclick;
    this.last_mouse_dragging = false;
    clearTimeout(presstimer);
    //console.log("pointerevents: processMouseUp which: "+e.which);
    if (e.which > 1) return;
    if (this.node_widget) this.processNodeWidgets(this.node_widget[0], this.graph_mouse, e);

    //left button
    this.node_widget = null;

    var node = NodeWork.getNodeOnPos(window.currentNodeWork, e.canvasX, e.canvasY);
    if (this.gripped == "canvas") {
      this.dragging_canvas = false;
    } else if (this.dragging_rectangle) {
      if (window.currentNodeWork) {
        var nodes = window.currentNodeWork.nodes;

        //compute bounding and flip if left to right
        var w = Math.abs(this.dragging_rectangle[2]);
        var h = Math.abs(this.dragging_rectangle[3]);
        var startx = this.dragging_rectangle[2] < 0 ? this.dragging_rectangle[0] - w : this.dragging_rectangle[0];
        var starty = this.dragging_rectangle[3] < 0 ? this.dragging_rectangle[1] - h : this.dragging_rectangle[1];
        this.dragging_rectangle[0] = startx;
        this.dragging_rectangle[1] = starty;
        this.dragging_rectangle[2] = w;
        this.dragging_rectangle[3] = h;

        // test dragging rect size, if minimun simulate a click
        if (!node || (w > 10 && h > 10)) {
          //test against all nodes (not visible because the rectangle maybe start outside
          var to_select = [];
          for (var i = 0; i < nodes.length; ++i) {
            var nodeX = nodes[i];
            let node_bounding = Math.getBounding(nodeX);
            if (!Math.overlapBounding(this.dragging_rectangle, node_bounding)) {
              continue;
            } //out of the visible area
            to_select.push(nodeX);
          }
          if (to_select.length) {
            this.selectNodes(to_select, e.shiftKey); // add to selection with shift
          }
        } else {
          // will select of update selection
          this.selectNodes([node], e.shiftKey || e.ctrlKey); // add to selection add to selection with ctrlKey or shiftKey
        }
      }
      this.dragging_rectangle = null;
    } else if (this.resizing_node) {
      this.resizing_node = null;
    } else if (this.node_dragging) {
      window.sendToNodework("moveNodeOnGrid", {id: this.node_dragging.nodeID, from: this.grid_selected, to: e.gridPos});
      this.node_dragging = null;
    }       // deselect all, grip canvas
    else if (window.canvas.copyNode == null && node_mouse == null && (this.grid_selected == undefined || (this.grid_selected && (this.grid_selected[0] != e.gridPos[0] || this.grid_selected[1] != e.gridPos[1])))) {
        this.grid_selected = e.gridPos;
        if(window.current_node) window.current_node.selected = false;
        window.current_node = null;
        this.deselectAllNodes();
        this.gripped = "canvas";
     } else {
      //no node being dragged
      if (!node && this.selectedLink == null && window.canvas.copyNode == null) {
        this.deselectAllNodes();
      }
      let nodeClass = NodeWork.getNodeType(node?.type);
      if (nodeClass.onMouseUp) {
        var gridCorner = NodiEnums.toCanvas(e.gridPos);

        nodeClass.onMouseUp(
          this.node_over,
          e,
          [e.canvasX - gridCorner[0], e.canvasY - gridCorner[1]],
          this
        );
      }

      if (this.node_capturing_input && this.node_capturing_input.onMouseUp) {
        this.node_capturing_input.onMouseUp(e, [
          e.canvasX - this.node_capturing_input.pos[0],
          e.canvasY - this.node_capturing_input.pos[1],
        ]);
      }
    }

    this.draw();

    if (this.last_click_position &&
      Math.abs(this.last_click_position[0] - e.clientX) < 5 &&
      Math.abs(this.last_click_position[1] - e.clientY) < 5
    ) {
      this.processMouseClick(e);
    }
    this.last_click_position = null;
    this.gripped = "";
    this.grid_selected = e.gridPos;

    //console.log("pointerevents: processMouseUp stopPropagation");
    e.stopPropagation();
    e.preventDefault();
    return false;
  }

  processMouseClick(e) {
    if (this.gripped == "canvas" || this.gripped == "node") this.grid_selected = e.gridPos;
    if (this.gripped == "cell") window.setShowNodes(true);
  }

  zoom(e) {
    var delta = e.wheelDeltaY != null ? e.wheelDeltaY : e.detail * -60;

    this.adjustMouseEvent(e);

    var x = e.clientX;
    var y = e.clientY;
    var is_inside =
      !this.viewport ||
      (this.viewport &&
        x >= this.viewport[0] &&
        x < this.viewport[0] + this.viewport[2] &&
        y >= this.viewport[1] &&
        y < this.viewport[1] + this.viewport[3]);
    if (!is_inside) return;

    var scale = this.ds.scale;

    if (delta > 0) {
      scale *= 1.1;
    } else if (delta < 0) {
      scale *= 1 / 1.1;
    }

    //this.setZoom( scale, [ e.clientX, e.clientY ] );
    this.ds.changeScale(Math.clamp(scale, 0.2, 4), {x: e.clientX, y: e.clientY});

    e.preventDefault();
  }
  /**
   * Called when a mouse wheel event has to be processed
   * @method processMouseWheel
   */
  processMouseWheel(e) {
    if (!window.currentNodeWork || !this.allow_dragcanvas) {
      return;
    }

    this.zoom(e);
    return false; // prevent default
  }

  /**
   * process a key event
   * @method processKey
   */
  processKey(e) {
    if (!window.currentNodeWork) {
      return;
    }

    var block_default = false;
    //console.log(e); //debug
    if (e.target.localName == "input") {
      return;
    }

    if (e.type == "keydown") {
      if (e.keyCode == 32) {
        //space
        block_default = true;
      }

      if (e.keyCode == 27) {
        //esc
        if (this.node_panel) this.node_panel.close();
        if (this.options_panel) this.options_panel.close();
        block_default = true;
      }

      //select all Control A
      if (e.keyCode == 65 && e.ctrlKey) {
        this.selectNodes();
        block_default = true;
      }

      if (e.code == "KeyC" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        //copy
        if (this.selected_nodes) {
          this.copyToClipboard();
          block_default = true;
        }
      }

      if (e.code == "KeyV" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        //paste
        this.pasteFromClipboard();
      }

      //delete or backspace
      if (e.keyCode == 46 || e.keyCode == 8) {
        if (e.target.localName != "input" && e.target.localName != "textarea") {
          this.deleteSelectedNodes();
          block_default = true;
        }
      }

      if (this.selected_nodes) {
        for (let node of this.selected_nodes) {
          if (node?.onKeyDown) node.onKeyDown(e);
        }
      }
    } else if (e.type == "keyup") {
      if (this.selected_nodes) {
        for (let n of this.selected_nodes) {
          if (n?.onKeyUp) n.onKeyUp(e);
        }
      }
    }

    if (block_default) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
  }

  copyToClipboard() {
    var clipboard_info = { nodes: [] };
    var index = 0;
    var selected_nodes_array = [];
    for (let node of this.selected_nodes) {
      if (node) {
        node._relative_id = index;
        selected_nodes_array.push(node);
        index += 1;
      }
    }

    for (let node of selected_nodes_array) {
      var cloned = Node.clone(node);
      if (!cloned) {
        console.warn("node type not found: " + node.type);
        continue;
      }
      clipboard_info.nodes.push(cloned.serialize());
    }
    localStorage.setItem("litegrapheditor_clipboard", JSON.stringify(clipboard_info));
  }

  pasteFromClipboard() {
    var data = localStorage.getItem("litegrapheditor_clipboard");
    if (!data) {
      return;
    }

    //create nodes
    var clipboard_info = JSON.parse(data);
    // calculate top-left node, could work without this processing but using diff with last node pos :: clipboard_info.nodes[clipboard_info.nodes.length-1].pos
    var posMin = false;
    var posMinIndexes = false;
    for (var i = 0; i < clipboard_info.nodes.length; ++i) {
      if (posMin) {
        if (posMin[0] > clipboard_info.nodes[i].pos[0]) {
          posMin[0] = clipboard_info.nodes[i].pos[0];
          posMinIndexes[0] = i;
        }
        if (posMin[1] > clipboard_info.nodes[i].pos[1]) {
          posMin[1] = clipboard_info.nodes[i].pos[1];
          posMinIndexes[1] = i;
        }
      } else {
        posMin = [clipboard_info.nodes[i].pos[0], clipboard_info.nodes[i].pos[1]];
        posMinIndexes = [i, i];
      }
    }
    var nodes = [];
    for (let node_data of clipboard_info.nodes) {
      var node = NodeWork.addNode(node_data.type);
      if (node) {
        node.setNodework(node_data);

        //paste in last known mouse position
        node.pos[0] += this.graph_mouse[0] - posMin[0]; //+= 5;
        node.pos[1] += this.graph_mouse[1] - posMin[1]; //+= 5;

        window.currentNodeWork.add(node, { doProcessChange: false });

        nodes.push(node);
      }
    }

    this.selectNodes(nodes);
  }

  /**
   * process a item drop event on top the canvas
   * @method processDrop
   */
  processDrop(e) {
    e.preventDefault();
    this.adjustMouseEvent(e);
    var x = e.clientX;
    var y = e.clientY;
    var is_inside =
      !this.viewport ||
      (this.viewport &&
        x >= this.viewport[0] &&
        x < this.viewport[0] + this.viewport[2] &&
        y >= this.viewport[1] &&
        y < this.viewport[1] + this.viewport[3]);
    if (!is_inside) {
      return;
      // --- BREAK ---
    }

    var pos = [e.canvasX, e.canvasY];

    var node = window.currentNodeWork ? NodeWork.getNodeOnPos(window.currentNodeWork, pos[0], pos[1]) : null;

    if (!node) {
      var r = null;
      if (this.onDropItem) {
        r = this.onDropItem(event);
      }
      if (!r) {
        this.checkDropItem(e);
      }
      return;
    }

    if (node.onDropFile || node.onDropData) {
      var files = e.dataTransfer.files;
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = e.dataTransfer.files[0];
          var filename = file.name;
          //console.log(file);
          if (node.onDropFile) {
            node.onDropFile(file);
          }

          if (node.onDropData) {
            //prepare reader
            var reader = new FileReader();
            reader.onload = function (event) {
              //console.log(event.target);
              var data = event.target.result;
              node.onDropData(data, filename, file);
            };

            //read data
            var type = file.type.split("/")[0];
            if (type == "text" || type == "") {
              reader.readAsText(file);
            } else if (type == "image") {
              reader.readAsDataURL(file);
            } else {
              reader.readAsArrayBuffer(file);
            }
          }
        }
      }
    }

    if (node.onDropItem) {
      if (node.onDropItem(event)) {
        return true;
      }
    }

    if (this.onDropItem) {
      return this.onDropItem(event);
    }

    return false;
  }

  processNodeDblClicked(e) {
    if (!window.currentNodeWork) return;
    if (e.which > 1) return;
    if (e.touches?.length == 2) return;

    this.adjustMouseEvent(e);
    var node_mouse = NodeWork.getNodeOnPos(window.currentNodeWork, e.canvasX, e.canvasY);
    let nodeClass = NodeWork.getNodeType(node_mouse?.type);

    if (node_mouse && nodeClass.primitive == false) {
      window.currentNodeWork = node_mouse;
      window.showParent(true);
    }
    if (this.onNodeDblClicked) this.onNodeDblClicked(n);
  }

  processNodeSelected(node, e) {
    this.selectNode(node, e && (e.shiftKey || e.ctrlKey));
    if (this.onNodeSelected) {
      this.onNodeSelected(node);
    }
  }

  /**
   * selects a given node (or adds it to the current selection)
   * @method selectNode
   */
  selectNode(node, add_to_current_selection) {
    if (node == null) {
      this.deselectAllNodes();
    } else {
      this.selectNodes([node], add_to_current_selection);
    }
    window.current_node = node;
  }
  /**
   * selects several nodes (or adds them to the current selection)
   * @method selectNodes
   */
  selectNodes(nodes, add_to_current_selection) {
    if (!add_to_current_selection) {
      this.deselectAllNodes();
    }

    nodes = nodes || window.currentNodeWork.nodes;
    if (typeof nodes == "string") nodes = [nodes];
    for (var i in nodes) {
      var node = nodes[i];
      if (node.is_selected) {
        continue;
      }

      if (!node.is_selected && node.onSelected) {
        node.onSelected();
      }
      node.is_selected = true;
      this.selected_nodes[node.nodeID] = node;
    }

    if (this.onSelectionChange) this.onSelectionChange(this.selected_nodes);
    window.updateEditDialog(window.current_node);

  }
  /**
   * removes a node from the current selection
   * @method deselectNode
   */
  deselectNode(node) {
    if (!node.is_selected) {
      return;
    }
    if (node.onDeselected) {
      node.onDeselected();
    }
    node.is_selected = false;

    if (this.onNodeDeselected) {
      this.onNodeDeselected(node);
    }
  }
  /**
   * removes all nodes from the current selection
   * @method deselectAllNodes
   */
  deselectAllNodes() {
    if (!this.selected_nodes) return;

    this.selected_nodes.forEach((node) => {
      if (!node) return;
      node.is_selected = false;
      if (node.onDeselected) {
        node.onDeselected();
      }
      if (this.onNodeDeselected) {
        this.onNodeDeselected(node);
      }
    });

    this.selected_nodes = [];
    window.current_node = null;
    if (this.onSelectionChange) this.onSelectionChange(this.selected_nodes);
    window.updateEditDialog(window.current_node);

  }

  onSelectionChange (nodes) {
    if (Object.keys(nodes).length == 1) {
      let node = nodes[Object.keys(nodes)[0]]; // selected nodes are not indexed correctly
      window.showRemove(true);
      window.showRotate(NodeWork.getNodeType(node.type).rotatable);
      window.showAdd(!(NodeWork.getNodeType(node.type).singleton));
      console.log("disable");
    } else {
      window.showAdd(false);
      window.showRotate(false);
      window.showRemove(false);
      console.log("enable");
    }
  };
  /**
   * deletes all nodes in the current selection from the graph
   * @method deleteSelectedNodes
   */
  deleteSelectedNodes() {
    for (let node of this.selected_nodes) {
      if (node) {
        if (node.block_delete) continue;
        window.currentNodeWork.remove(node);
        if (this.onNodeDeselected) {
          this.onNodeDeselected(node);
        }
      }
    }
    this.selected_nodes = [];
    window.current_node = null;
  }
  /**
   * centers the camera on a given node
   * @method centerOnNode
   */
  centerOnNode(node) {
    this.ds.offset[0] = -node.pos[0] - node.size[0] * 0.5 + (this.canvas.width * 0.5) / this.ds.scale;
    this.ds.offset[1] = -node.pos[1] - node.size[1] * 0.5 + (this.canvas.height * 0.5) / this.ds.scale;
  }
  /**
   * adds some useful properties to a mouse event, like the position in graph coordinates
   * @method adjustMouseEvent
   */
  adjustMouseEvent(e) {
    var clientX_rel = 0;
    var clientY_rel = 0;

    if (e.changedTouches?.length == 1) {
      e.clientX = e.changedTouches[0].clientX;
      e.clientY = e.changedTouches[0].clientY;
    }

    if (this.canvas) {
      var b = this.canvas.getBoundingClientRect();
      clientX_rel = e.clientX - b.left;
      clientY_rel = e.clientY - b.top;
    } else {
      clientX_rel = e.clientX;
      clientY_rel = e.clientY;
    }

    // e.deltaX = clientX_rel - this.last_mouse_position[0];
    // e.deltaY = clientY_rel- this.last_mouse_position[1];
    this.last_mouse_position[0] = clientX_rel;
    this.last_mouse_position[1] = clientY_rel;

    e.canvasX = clientX_rel / this.ds.scale - this.ds.offset[0];
    e.canvasY = clientY_rel / this.ds.scale - this.ds.offset[1];
    e.gridPos = NodiEnums.toGrid([e.canvasX, e.canvasY]);

    //console.log("pointerevents: adjustMouseEvent "+e.clientX+":"+e.clientY+" "+clientX_rel+":"+clientY_rel+" "+e.canvasX+":"+e.canvasY);
  }
  /**
   * changes the zoom level of the graph (default is 1), you can pass also a place used to pivot the zoom
   * @method setZoom
   */
  setZoom(value, zooming_center) {
    this.ds.changeScale(value, zooming_center);
  }
  /**
   * converts a coordinate from graph coordinates to canvas2D coordinates
   * @method convertOffsetToCanvas
   */
  convertOffsetToCanvas(pos, out) {
    return this.ds.convertOffsetToCanvas(pos, out);
  }
  /**
   * converts a coordinate from Canvas2D coordinates to graph space
   * @method convertCanvasToOffset
   */
  convertCanvasToOffset(pos, out) {
    return this.ds.convertCanvasToOffset(pos, out);
  }
  //converts event coordinates from canvas2D to graph coordinates
  convertEventToCanvasOffset(e) {
    var rect = this.canvas.getBoundingClientRect();
    return this.convertCanvasToOffset([e.clientX - rect.left, e.clientY - rect.top]);
  }

  /**
   * renders the whole canvas content, by rendering in two separated canvas, one containing the background grid and the connections, and one containing the nodes)
   * @method draw
   */
  draw() {
    if (!this.canvas || this.canvas.width == 0 || this.canvas.height == 0) {
      return;
    }

    //fps counting
    var now = NodiEnums.getTime();
    this.render_time = (now - this.last_draw_time) * 0.001;
    this.last_draw_time = now;

    if (window.currentNodeWork) {
      this.ds.computeVisibleArea(this.viewport);
    }

    var ctx = this.ctx;
    var viewport = [0, 0, ctx.canvas.width, ctx.canvas.height];

    //clear
    ctx.clearRect(viewport[0], viewport[1], viewport[2], viewport[3]);
    //apply transformations
    ctx.fillStyle = "#ccc";
    ctx.fillRect(viewport[0], viewport[1], viewport[2], viewport[3]);

    this.drawFrontCanvas();

    this.fps = this.render_time ? 1.0 / this.render_time : 0;
    this.frame += 1;
  }
  /**
   * draws the front canvas (the one containing all the nodes)
   * @method drawFrontCanvas
   */
  drawFrontCanvas() {
    var ctx = this.ctx;

    ctx.save();
    this.ds.toCanvasContext(ctx);
    let s = NodiEnums.CANVAS_GRID_SIZE;
    let grid_area = [
      this.visible_area[0] - s,
      this.visible_area[1] - s,
      this.visible_area[0] + this.visible_area[2] + s,
      this.visible_area[1] + this.visible_area[3] + s,
    ];

    let l = Math.floor(grid_area[0] / s) * s;
    let t = Math.floor(grid_area[1] / s) * s;
    let r = grid_area[2];
    let d = grid_area[3];

    ctx.strokeStyle = "rgb(0,0,0,0.25)";
    ctx.beginPath(); // Start a new path
    //ctx.setLineDash([5, 10]);
    for (var x = l; x <= r; x += s) {
      ctx.moveTo(x, t);
      ctx.lineTo(x, d);
    }
    for (var y = t; y <= d; y += s) {
      ctx.moveTo(l, y);
      ctx.lineTo(r, y);
    }
    ctx.stroke(); // Render the path
    ctx.restore();

    if (window.currentNodeWork?.nodesByPos) {
      if (this.grid_selected) {
        ctx.save();
        this.ds.toCanvasContext(ctx);
        ctx.fillStyle = "rgb(0.2,0,0,0.25)";
        ctx.strokeRect(
          this.grid_selected[0] * NodiEnums.CANVAS_GRID_SIZE - 4,
          this.grid_selected[1] * NodiEnums.CANVAS_GRID_SIZE - 4,
          NodiEnums.CANVAS_GRID_SIZE + 8,
          NodiEnums.CANVAS_GRID_SIZE + 8
        );
        ctx.restore();
      }
      ctx.save();
      this.ds.toCanvasContext(ctx);

      //draw nodes on grid
      for (var nodeKey of Object.keys(window.currentNodeWork.nodesByPos)) {
        var nodeID = window.currentNodeWork.nodesByPos[nodeKey];
        var node = globalApp.data.nodeContainer[nodeID];
        if (!node) continue;
        //transform coords system
        let [x, y] = nodeKey.split(NodiEnums.POS_SEP);
        ctx.save();
        ctx.translate(x * NodiEnums.CANVAS_GRID_SIZE, y * NodiEnums.CANVAS_GRID_SIZE);
        if (node.offset) ctx.translate(node.offset.x * NodiEnums.CANVAS_GRID_SIZE, node.offset.y * NodiEnums.CANVAS_GRID_SIZE);

        //Draw
        this.drawNode(node, ctx);


        //Restore
        ctx.restore();
      }
      //draw dragged on grid
      if (this.node_dragging != null) {
        ctx.save();
        ctx.translate(this.graph_mouse[0] - this.nodeDragGripPos[0], this.graph_mouse[1] - this.nodeDragGripPos[1]);
        //Draw
        if (NodeWork.getNodeType(this.node_dragging.type).drawBase !== false) {
          this.drawNode(this.node_dragging, ctx);
        } else {
          let nodeDrawFunction = NodeWork.getNodeType(this.node_dragging.type).onDrawForeground;
          if (nodeDrawFunction) nodeDrawFunction(this.node_dragging, ctx);
        }
        ctx.restore();
      }

      //draw cloning
      if (this.copyNode != null) {
        this.copyNodeObj = NodeWork.getNodeById(window.currentNodeWork,this.copyNode);
        ctx.save();
        ctx.translate(this.graph_mouse[0], this.graph_mouse[1]);
        //Draw
        if (NodeWork.getNodeType(this.copyNodeObj.type).drawBase !== false) {
          this.drawNode(this.copyNodeObj, ctx);
        } else {
          let nodeDrawFunction = NodeWork.getNodeType(this.copyNodeObj.type).onDrawForeground;
          if (nodeDrawFunction) nodeDrawFunction(this.copyNodeObj, ctx);
        }
        ctx.restore();
      }

      ctx.restore();
    }

    if (this.dragging_rectangle) {
      ctx.save();
      this.ds.toCanvasContext(ctx);
      ctx.setLineDash([5, 15]);
      ctx.strokeStyle = "black";
      ctx.strokeRect(
        this.dragging_rectangle[0],
        this.dragging_rectangle[1],
        this.dragging_rectangle[2],
        this.dragging_rectangle[3]
      );
      ctx.restore();
    }

    if (this.cursorMode == 0 && this.grid_mouse) {
      ctx.save();
      this.ds.toCanvasContext(ctx);
      ctx.fillStyle = "rgb(0,0,0,0.25)";
      ctx.strokeStyle = "black";
      ctx.fillRect(this.grid_mouse[0], this.grid_mouse[1], NodiEnums.CANVAS_GRID_SIZE, NodiEnums.CANVAS_GRID_SIZE);
      ctx.restore();
    }

  }

  /**
   * draws the given node inside the canvas
   * @method drawNode
   */
  drawNode(node, ctx) {
    var color = node.color || node.constructor.color || NodiEnums.NODE_DEFAULT_COLOR;
    var bgcolor = node.bgcolor || node.constructor.bgcolor || NodiEnums.NODE_DEFAULT_BGCOLOR;

    var low_quality = this.ds.scale < 0.6; //zoomed out

    var editor_alpha = this.editor_alpha;
    ctx.globalAlpha = editor_alpha;

    if (this.render_shadows && !low_quality) {
      ctx.shadowColor = NodiEnums.DEFAULT_SHADOW_COLOR;
      ctx.shadowOffsetX = 2 * this.ds.scale;
      ctx.shadowOffsetY = 2 * this.ds.scale;
      ctx.shadowBlur = 3 * this.ds.scale;
    } else {
      ctx.shadowColor = "transparent";
    }

    if (NodeWork.getNodeType(node.type).drawBase !== false) {
      this.drawNodeShape(node, ctx, node.size, color, bgcolor, node.is_selected, node.mouseOver);
      ctx.shadowColor = "transparent";
    }

    let nodeDrawFunction = node.onDrawForeground;
    if (!nodeDrawFunction) nodeDrawFunction = NodeWork.getNodeType(node.type).onDrawForeground;
    if (nodeDrawFunction) nodeDrawFunction = nodeDrawFunction.bind(node);
    if (nodeDrawFunction) nodeDrawFunction(node, ctx, this.visible_rect);

    // Draw the title on the node
    ctx.textAlign = "center";
    ctx.font = this.inner_text_font;
    ctx.fillStyle = NodiEnums.NODE_TEXT_COLOR;
    let nodeTitle = NodeWork.getNodeType(node.type).title;
    if (nodeTitle) ctx.fillText(NodeWork.getNodeType(node.type).title, node.size[0] / 2, node.size[1] / 2);
  }

  /**
   * draws the shape of the given node in the canvas
   * @method drawNodeShape
   */

  drawNodeShape(node, ctx, size, fgcolor, bgcolor) {
    //bg rect
    ctx.strokeStyle = fgcolor;
    ctx.fillStyle = bgcolor;

    //render node area depending on shape
    var area = tmp_area;
    area[0] = 0; //x
    area[1] = 0; //y
    if (size) {
      area[2] = size[0]; //w
      area[3] = size[1]; //h
    } else {
      area[2] = 1;
      area[3] = 1;
    }

    //full node shape
    ctx.beginPath();
    ctx.roundRect(area[0], area[1], area[2], area[3], [this.round_radius]);
    ctx.fill();

    ctx.shadowColor = "transparent";

    if (node.onDrawBackground) {
      node.onDrawBackground(ctx, this, this.canvas, this.graph_mouse);
    }

    if (node.properties?.label?.value) {
      let fontSize = 30;
      ctx.font = fontSize + "px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.fillText(node.properties.label.value, node.size[0] / 2, (node.size[1] + fontSize) / 2);
    }
  }

  /**
   * resizes the canvas to a given size, if no size is passed, then it tries to fill the parentNode
   * @method resize
   */
  resize(width, height) {
    if (!width && !height) {
      var parent = this.canvas.parentNode;
      width = parent.offsetWidth;
      height = parent.offsetHeight;
    }

    if (this.canvas.width == width && this.canvas.height == height) {
      return;
    }
  }
}

/**
 * Represents a pair of fingers touching the screen.
 */
function TouchPair(touchList) {
  // Grab the first two touches from the list.
  this.t1 = new Touch(touchList[0].pageX, touchList[0].pageY);
  this.t2 = new Touch(touchList[1].pageX, touchList[1].pageY);
}

/**
 * Given a reference position, calculate the scale multiplier.
 */
TouchPair.prototype.scaleSince = function (referencePair) {
  return this.span() / referencePair.span();
};

/**
 * Calculate the center of this transformation.
 */
TouchPair.prototype.center = function () {
  var x = (this.t1.x + this.t2.x) / 2;
  var y = (this.t1.y + this.t2.y) / 2;
  return new Touch(x, y);
};

/**
 * Calculate the distance between the two touch points.
 */
TouchPair.prototype.span = function () {
  var dx = this.t1.x - this.t2.x;
  var dy = this.t1.y - this.t2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate the angle (in degrees, 0 < a < 360) between the touch points.
 */
TouchPair.prototype.angle = function () {
  var dx = this.t1.x - this.t2.x;
  var dy = this.t1.y - this.t2.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

function Touch(x, y) {
  this.x = x;
  this.y = y;
}
