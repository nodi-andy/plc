import { NodiEnums } from "./enums.mjs";
import View from "./view.js";
import NodeWork from "./nodework.mjs";
import { Node } from "./node.mjs";

var margin_area = new Float32Array(4);
var temp_vec2 = new Float32Array(2);
var tmp_area = new Float32Array(4);
var link_bounding = new Float32Array(4);

export default class LGraphCanvas {
  constructor(canvas, graph, options) {
    this.options = options = options || {};
    LGraphCanvas.active_canvas = this;
    if (canvas && canvas.constructor === String) {
      canvas = document.querySelector(canvas);
    }
    this.nodework = new NodeWork();
    this.ds = new View();
    this.zoom_modify_alpha = true; //otherwise it generates ugly patterns when scaling down too much

    this.title_text_font = "" + NodiEnums.NODE_TEXT_SIZE + "px Arial";
    this.inner_text_font = "normal " + NodiEnums.NODE_SUBTEXT_SIZE + "px Arial";
    this.node_title_color = NodiEnums.NODE_TITLE_COLOR;
    this.default_link_color = NodiEnums.LINK_COLOR;
    this.default_connection_color = {
      input_off: "#778",
      input_on: "#7F7",
      output_off: "#778",
      output_on: "#7F7",
    };

    this.highquality_render = true;
    this.use_gradients = false; //set to true to render titlebar with gradients
    this.editor_alpha = 1; //used for transition
    this.pause_rendering = false;
    this.clear_background = true;

    this.render_only_selected = true;
    this.show_info = false;
    this.allow_dragcanvas = true;
    this.allow_dragnodes = true;
    this.allow_interaction = true; //allow to control widgets, buttons, collapse, etc
    this.allow_searchbox = true;
    this.allow_reconnect_links = true; //allows to change a connection with having to redo it again
    this.align_to_grid = true; //snap to grid

    this.drag_mode = false;
    this.dragging_rectangle = null;

    this.filter = null; //allows to filter to only accept some type of nodes in a graph

    this.set_canvas_dirty_on_mouse_event = true; //forces to redraw the canvas if the mouse does anything
    this.render_shadows = true;
    this.render_canvas_border = true;
    this.render_connections_border = true;
    this.render_curved_connections = false;
    this.render_connection_arrows = false;
    this.render_collapsed_slots = false;
    this.render_execution_order = false;
    this.render_title_colored = true;
    this.render_link_tooltip = true;

    this.mouse = [0, 0]; //mouse in canvas coordinates, where 0,0 is the top-left corner of the blue rectangle
    this.graph_mouse = [0, 0]; //mouse in graph coordinates, where 0,0 is the top-left corner of the blue rectangle
    this.canvas_mouse = this.graph_mouse; //LEGACY: REMOVE THIS, USE GRAPH_MOUSE INSTEAD

    //to personalize the search box
    this.onSearchBox = null;
    this.onSearchBoxSelection = null;

    //callbacks
    this.onMouse = null;
    this.onDrawBackground = null; //to render background objects (behind nodes and connections) in the canvas affected by transform
    this.onDrawForeground = null; //to render foreground objects (above nodes and connections) in the canvas affected by transform
    this.onDrawOverlay = null; //to render foreground objects not affected by transform (for GUIs)
    this.onDrawLinkTooltip = null; //called when rendering a tooltip
    this.onNodeMoved = null; //called after moving a node
    this.onSelectionChange = null; //called if the selection changes
    this.onConnectingChange = null; //called before any link changes

    this.connections_width = 3;
    this.round_radius = 8;

    this.current_node = null;
    this.current_node_cbs = [];
    this.node_widget = null; //used for widgets
    this.over_link_center = null;
    this.last_mouse_position = [0, 0];
    this.visible_area = this.ds.visible_area;

    this.viewport = options.viewport || null; //to constraint render area to a portion of the canvas

    graph.canvas = this;

    this.setCanvas(canvas, options.skip_events);
    this.clear();
    this.startRendering();
    this.setGraph(graph);
    this.autoresize = options.autoresize;
  }

  set current_node(node) {
    this._current_node = node;
    for (let cb in this.current_node_cbs) {
      this.current_node_cbs[cb]();
    }
  }

  get current_node() {
    return this._current_node;
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
  /* this is an implementation for touch not in production and not ready
   */
  touchHandler = function (event) {
    var touches = event.changedTouches,
      first = touches[0],
      type = "";
    if (event.touches.length > 1) return;
    switch (event.type) {
      case "touchstart":
        type = "mousedown";
        break;
      case "touchmove":
        type = "mousemove";
        break;
      case "touchend":
        type = "mouseup";
        break;
      default:
        return;
    }

    // initMouseEvent(type, canBubble, cancelable, view, clickCount,
    //                screenX, screenY, clientX, clientY, ctrlKey,
    //                altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(
      type,
      true,
      true,
      window,
      1,
      first.screenX,
      first.screenY,
      first.clientX,
      first.clientY,
      false,
      false,
      false,
      false,
      0 /*left*/,
      null
    );

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
  };

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

    //this.scale = 1;
    //this.offset = [0,0];
    this.dragging_rectangle = null;

    this.selected_nodes = [];

    this.visible_nodes = [];
    this.node_dragged = null;
    this.node_over = null;
    this.node_capturing_input = null;
    this.connecting_node = null;
    this.highlighted_links = {};

    this.dragging_canvas = false;

    this.dirty_canvas = true;
    this.dirty_bgcanvas = true;

    this.node_in_panel = null;
    this.node_widget = null;

    this.last_mouse = [0, 0];
    this.last_mouseclick = 0;
    this.pointer_is_down = false;
    this.visible_area.set([0, 0, 0, 0]);

    if (this.onClear) {
      this.onClear();
    }
  }

  /**
   * assigns a graph, you can reassign graphs to the same canvas
   *
   * @method setGraph
   * @param {LGraph} graph
   */
  setGraph(graph, skip_clear) {
    if (this.graph == graph) {
      return;
    }

    this.graph = graph;

    if (!skip_clear) {
      this.clear();
    }

    graph.canvas = this;

    //remove the graph stack in case a subgraph was open
    if (this._graph_stack) this._graph_stack = null;

    this.setDirty(true, true);
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

    if (!canvas && this.canvas) {
      //maybe detach events from old_canvas
      if (!skip_events) {
        this.unbindEvents();
      }
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

    //bg canvas: used for non changing stuff
    this.bgcanvas = null;
    if (!this.bgcanvas) {
      this.bgcanvas = document.createElement("canvas");
      this.bgcanvas.width = this.canvas.width;
      this.bgcanvas.height = this.canvas.height;
    }

    if (canvas.getContext == null) {
      if (canvas.localName != "canvas") {
        throw "Element supplied for LGraphCanvas must be a <canvas> element, you passed a " + canvas.localName;
      }
      throw "This browser doesn't support Canvas";
    }

    var ctx = (this.ctx = canvas.getContext("2d"));
    if (ctx == null) {
      if (!canvas.webgl_enabled) {
        console.warn("This canvas seems to be WebGL, enabling WebGL renderer");
      }
      this.enableWebGL();
    }

    //input:  (move and up could be unbinded)
    // why here? this._mousemove_callback = this.processMouseMove.bind(this);
    // why here? this._mouseup_callback = this.processMouseUp.bind(this);
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

    this._mousedown_callback = this.processMouseDown.bind(this);
    this._mousewheel_callback = this.processMouseWheel.bind(this);
    // why mousemove and mouseup were not binded here?
    this._mousemove_callback = this.processMouseMove.bind(this);
    this._mouseup_callback = this.processMouseUp.bind(this);

    //touch events -- TODO IMPLEMENT
    //this._touch_callback = this.touchHandler.bind(this);
    View.pointerListenerAdd(canvas, "down", this._mousedown_callback, true); //down do not need to store the binded
    canvas.addEventListener("mousewheel", this._mousewheel_callback, false);

    View.pointerListenerAdd(canvas, "up", this._mouseup_callback, true); // CHECK: ??? binded or not
    View.pointerListenerAdd(canvas, "move", this._mousemove_callback);

    canvas.addEventListener("contextmenu", this._doNothing);
    canvas.addEventListener("DOMMouseScroll", this._mousewheel_callback, false);

    //touch events -- THIS WAY DOES NOT WORK, finish implementing pointerevents, than clean the touchevents
    canvas.addEventListener("touchstart", this.touchHandler, true);
    canvas.addEventListener("touchmove", this.touchHandler, true);
    canvas.addEventListener("touchend", this.touchHandler, true);
    canvas.addEventListener("touchcancel", this.touchHandler, true);

    var touchManager = new TransformRecognizer(canvas);
    touchManager.ds = this.ds;
    touchManager.graph = this.graph;
    touchManager.onScale(function (data) {
      console.log("Scale gesture:", data);
      let scale = window.scale * data.scale;
      window.canvas.ds.changeScale(scale);

      window.canvas.graph.change();
    });
    touchManager.onRotate(function () {});
    //Keyboard ******************
    this._key_callback = this.processKey.bind(this);

    canvas.addEventListener("keydown", this._key_callback, true);
    document.addEventListener("keyup", this._key_callback, true); //in document, otherwise it doesn't fire keyup

    //Dropping Stuff over nodes ************************************
    this._ondrop_callback = this.processDrop.bind(this);

    canvas.addEventListener("dragover", this._doNothing, false);
    canvas.addEventListener("dragend", this._doNothing, false);
    canvas.addEventListener("drop", this._ondrop_callback, false);
    canvas.addEventListener("dragenter", this._doReturnTrue, false);

    this._events_binded = true;
  }
  /**
   * unbinds mouse events from the canvas
   * @method unbindEvents
   */
  unbindEvents() {
    if (!this._events_binded) {
      console.warn("LGraphCanvas: no events binded");
      return;
    }

    //console.log("pointerevents: unbindEvents");
    var ref_window = this.getCanvasWindow();
    var document = ref_window.document;

    View.pointerListenerRemove(this.canvas, "move", this._mousedown_callback);
    View.pointerListenerRemove(this.canvas, "up", this._mousedown_callback);
    View.pointerListenerRemove(this.canvas, "down", this._mousedown_callback);
    this.canvas.removeEventListener("mousewheel", this._mousewheel_callback);
    this.canvas.removeEventListener("DOMMouseScroll", this._mousewheel_callback);
    this.canvas.removeEventListener("keydown", this._key_callback);
    document.removeEventListener("keyup", this._key_callback);
    this.canvas.removeEventListener("contextmenu", this._doNothing);
    this.canvas.removeEventListener("drop", this._ondrop_callback);
    this.canvas.removeEventListener("dragenter", this._doReturnTrue);

    //touch events -- THIS WAY DOES NOT WORK, finish implementing pointerevents, than clean the touchevents
    this.canvas.removeEventListener("touchstart", this.touchHandler);
    this.canvas.removeEventListener("touchmove", this.touchHandler);
    this.canvas.removeEventListener("touchend", this.touchHandler);
    this.canvas.removeEventListener("touchcancel", this.touchHandler);
    this._mousedown_callback = null;
    this._mousewheel_callback = null;
    this._key_callback = null;
    this._ondrop_callback = null;

    this._events_binded = false;
  }

  /**
   * marks as dirty the canvas, this way it will be rendered again
   *
   * @class LGraphCanvas
   * @method setDirty
   * @param {bool} fgcanvas if the foreground canvas is dirty (the one containing the nodes)
   * @param {bool} bgcanvas if the background canvas is dirty (the one containing the wires)
   */
  setDirty(fgcanvas, bgcanvas) {
    if (fgcanvas) {
      this.dirty_canvas = true;
    }
    if (bgcanvas) {
      this.dirty_bgcanvas = true;
    }
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

      var window = this.getCanvasWindow();
      if (this.is_rendering) {
        window.requestAnimationFrame(renderFrame.bind(this));
      }
    }
  }
  /**
   * stops rendering the content of the canvas (to save resources)
   *
   * @method stopRendering
   */
  stopRendering() {
    this.is_rendering = false;
  }

  processMouseDown(e) {
    if (this.set_canvas_dirty_on_mouse_event) this.dirty_canvas = true;

    if (!this.graph) {
      return;
    }

    this.adjustMouseEvent(e);

    var ref_window = this.getCanvasWindow();
    LGraphCanvas.active_canvas = this;

    var x = e.clientX;
    var y = e.clientY;
    //console.log(y,this.viewport);
    //console.log("pointerevents: processMouseDown pointerId:"+e.pointerId+" which:"+e.which+" isPrimary:"+e.isPrimary+" :: x y "+x+" "+y);
    this.ds.viewport = this.viewport;
    var is_inside =
      !this.viewport ||
      (this.viewport &&
        x >= this.viewport[0] &&
        x < this.viewport[0] + this.viewport[2] &&
        y >= this.viewport[1] &&
        y < this.viewport[1] + this.viewport[3]);

    //move mouse move event to the window in case it drags outside of the canvas
    if (!this.options.skip_events) {
      View.pointerListenerRemove(this.canvas, "move", this._mousemove_callback);
      View.pointerListenerAdd(ref_window.document, "move", this._mousemove_callback, true); //catch for the entire window
      View.pointerListenerAdd(ref_window.document, "up", this._mouseup_callback, true);
    }

    if (!is_inside) {
      return;
    }

    var node = this.graph.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes, 5);

    var skip_action = false;
    var now = NodiEnums.getTime();
    var is_primary = e.isPrimary === undefined || !e.isPrimary;
    var is_double_click = now - this.last_mouseclick < 300 && is_primary;
    this.mouse[0] = e.clientX;
    this.mouse[1] = e.clientY;
    this.graph_mouse[0] = e.canvasX;
    this.graph_mouse[1] = e.canvasY;
    this.last_click_position = [this.mouse[0], this.mouse[1]];
    this.selectedLink = null;

    this.pointer_is_down = true;

    this.canvas.focus();

    if (this.onMouse) {
      if (this.onMouse(e) == true) return;
    }

    //left button mouse / single finger
    if (e.which == 1) {
      if (e.ctrlKey) {
        this.dragging_rectangle = new Float32Array(4);
        this.dragging_rectangle[0] = e.canvasX;
        this.dragging_rectangle[1] = e.canvasY;
        this.dragging_rectangle[2] = 1;
        this.dragging_rectangle[3] = 1;
        skip_action = true;
      }

      // clone node ALT dragging
      if (e.altKey && node && this.allow_interaction && !skip_action) {
        let cloned = node.clone();
        if (cloned) {
          cloned.pos[0] += 5;
          cloned.pos[1] += 5;
          this.graph.add(cloned, false, { doCalcSize: false });
          node = cloned;
          skip_action = true;
          if (!block_drag_node) {
            if (this.allow_dragnodes) {
              this.node_dragged = node;
            }
            if (!this.selected_nodes[node.nodeID]) {
              this.processNodeSelected(node, e);
            }
          }
        }
      }

      var clicking_canvas_bg = false;

      //when clicked on top of a node
      //and it is not interactive
      if (node && this.allow_interaction && !skip_action) {
        //not dragging mouse to connect two slots
        if (!this.connecting_node) {
          if (
            !skip_action &&
            node.resizable !== false &&
            Math.isInsideRectangle(
              e.canvasX,
              e.canvasY,
              node.pos[0] + node.size[0] - 5,
              node.pos[1] + node.size[1] - 5,
              10,
              10
            )
          ) {
            this.resizing_node = node;
            this.canvas.style.cursor = "se-resize";
            skip_action = true;
          } else {
            //search for outputs
            for (var i = 0, l = Node.getOutputs(node.properties).length; i < l; ++i) {
              var output = Node.getOutputs(node.properties)[i];
              var link_pos = Node.getConnectionPos(node, false, i);
              if (Math.isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 15, link_pos[1] - 10, 30, 20)) {
                this.connecting_node = node;
                this.connecting_output = output;
                this.connecting_output.slot_index = i;
                this.connecting_pos = Node.getConnectionPos(node, false, i);

                if (is_double_click) {
                  if (node.onOutputDblClick) {
                    node.onOutputDblClick(i, e);
                  }
                } else {
                  if (node.onOutputClick) {
                    node.onOutputClick(i, e);
                  }
                }

                skip_action = true;
                break;
              }
            }

            //search for inputs
            for (i = 0, l = Node.getInputs(node.properties).length; i < l; ++i) {
              var input = Node.getInputs(node.properties)[i];
              link_pos = Node.getConnectionPos(node, true, i);
              if (Math.isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 15, link_pos[1] - 10, 30, 20)) {
                if (is_double_click) {
                  if (node.onInputDblClick) {
                    node.onInputDblClick(i, e);
                  }
                } else {
                  if (node.onInputClick) {
                    node.onInputClick(i, e);
                  }
                }

                if (!skip_action) {
                  // connect from in to out, from to to from
                  this.connecting_node = node;
                  this.connecting_input = input;
                  this.connecting_input.slot_index = i;
                  this.connecting_pos = Node.getConnectionPos(node, true, i);

                  this.dirty_bgcanvas = true;
                  skip_action = true;
                }
              }
            }
          } //not resizing
        }

        //it wasn't clicked on the links boxes
        if (!skip_action) {
          var block_drag_node = false;
          var pos = [e.canvasX - node.pos[0], e.canvasY - node.pos[1]];

          //if do not capture mouse
          if (NodeWork.getNodeType(node.type).onMouseDown(node, e, pos, this)) {
            block_drag_node = true;
          }

          if (!block_drag_node) {
            if (this.allow_dragnodes) {
              this.node_dragged = node;
            }
            if (!this.selected_nodes[node.nodeID]) {
              this.processNodeSelected(node, e);
            }
          }

          this.dirty_canvas = true;
        }
      } //clicked outside of nodes
      else {
        if (!skip_action) {
          //search for link connector
          for (let link of this.graph.links) {
            if (!link) continue;
            var center = link.pos;
            if (
              !center ||
              e.canvasX < center[0] - 4 ||
              e.canvasX > center[0] + 4 ||
              e.canvasY < center[1] - 4 ||
              e.canvasY > center[1] + 4
            ) {
              continue;
            }
            //link clicked
            //this.showLinkMenu(link, e);
            this.selectedLink = link.linkID;
            link.selected = true;
            this.highlighted_links = {};
            this.highlighted_links[link.linkID] = true;
            this.onSelectionChange([link.linkID]);
            this.over_link_center = null; //clear tooltip
            break;
          }

          clicking_canvas_bg = true;
        }
      }

      if (!skip_action && clicking_canvas_bg && this.allow_dragcanvas) {
        //console.log("pointerevents: dragging_canvas start");
        this.dragging_canvas = true;
      }
    } else if (e.which == 3) {
      //right button
      if (this.allow_interaction && !skip_action) {
        // is it hover a node ?
        if (node) {
          if (
            this.selected_nodes.length &&
            (this.selected_nodes[node.nodeID] || e.shiftKey || e.ctrlKey || e.metaKey)
          ) {
            // is multiselected or using shift to include the now node
            if (!this.selected_nodes[node.nodeID]) this.selectNodes([node], true); // add this if not present
          } else {
            // update selection
            this.selectNodes([node]);
          }
        }
      }
    }

    //TODO
    this.last_mouse[0] = e.clientX;
    this.last_mouse[1] = e.clientY;
    this.last_mouseclick = NodiEnums.getTime();
    this.last_mouse_dragging = true;

    if ((this.dirty_canvas || this.dirty_bgcanvas) && this.rendering_timer_id == null) this.draw();

    this.graph.change();

    //this is to ensure to defocus(blur) if a text input element is on focus
    if (
      !ref_window.document.activeElement ||
      (ref_window.document.activeElement.nodeName.toLowerCase() != "input" &&
        ref_window.document.activeElement.nodeName.toLowerCase() != "textarea")
    ) {
      e.preventDefault();
    }
    e.stopPropagation();

    if (this.onMouseDown) {
      this.onMouseDown(e);
    }

    return false;
  }

  /**
   * Called when a mouse move event has to be processed
   * @method processMouseMove
   */
  processMouseMove(e) {
    if (this.autoresize) {
      this.resize();
    }

    if (this.set_canvas_dirty_on_mouse_event) this.dirty_canvas = true;

    if (!this.graph) {
      return;
    }

    LGraphCanvas.active_canvas = this;
    this.adjustMouseEvent(e);
    var mouse = [e.clientX, e.clientY];
    this.mouse[0] = mouse[0];
    this.mouse[1] = mouse[1];
    var delta = [mouse[0] - this.last_mouse[0], mouse[1] - this.last_mouse[1]];
    this.last_mouse = mouse;
    this.graph_mouse[0] = e.canvasX;
    this.graph_mouse[1] = e.canvasY;

    //console.log("pointerevents: processMouseMove "+e.pointerId+" "+e.isPrimary);
    if (this.block_click) {
      //console.log("pointerevents: processMouseMove block_click");
      e.preventDefault();
      return false;
    }

    e.dragging = this.last_mouse_dragging;

    if (this.dragging_rectangle) {
      this.dragging_rectangle[2] = e.canvasX - this.dragging_rectangle[0];
      this.dragging_rectangle[3] = e.canvasY - this.dragging_rectangle[1];
      this.dirty_canvas = true;
    } else if (this.dragging_canvas) {
      ////console.log("pointerevents: processMouseMove is dragging_canvas");
      this.ds.offset[0] += delta[0] / this.ds.scale;
      this.ds.offset[1] += delta[1] / this.ds.scale;
      this.dirty_canvas = true;
      this.dirty_bgcanvas = true;
    } else if (this.allow_interaction) {
      if (this.connecting_node) {
        this.dirty_canvas = true;
      }

      //get node over
      var node = this.graph.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes);

      //remove mouseover flag
      for (const nodeID in this.graph.nodes) {
        let node = this.graph.nodes[nodeID];
        if (node.mouseOver) {
          //mouse leave
          node.mouseOver = false;
          if (this.node_over && this.node_over.onMouseLeave) {
            this.node_over.onMouseLeave(e);
          }
          this.node_over = null;
          this.dirty_canvas = true;
        }
      }

      //mouse over a node
      if (node) {
        if (node.redraw_on_mouse) this.dirty_canvas = true;

        //this.canvas.style.cursor = "move";
        if (!node.mouseOver) {
          //mouse enter
          node.mouseOver = true;
          this.node_over = node;
          this.dirty_canvas = true;

          if (node.onMouseEnter) {
            node.onMouseEnter(e);
          }
        }

        //in case the node wants to do something
        if (node.onMouseMove) {
          node.onMouseMove(e, [e.canvasX - node.pos[0], e.canvasY - node.pos[1]], this);
        }

        //if dragging a link
        if (this.connecting_node) {
          if (this.connecting_output) {
            var pos = this._highlight_input || [0, 0]; //to store the output of isOverNodeInput

            //on top of input
            if (this.isOverNodeBox(node, e.canvasX, e.canvasY)) {
              //mouse on top of the corner box, don't know what to do
            } else {
              //check if I have a slot below de mouse
              var slot = this.isOverNodeInput(node, e.canvasX, e.canvasY, pos);
              if (slot != -1 && Node.getInputs(node.properties)[slot]) {
                this._highlight_input = pos;
                this._highlight_input_slot = Node.getInputs(node.properties)[slot]; // XXX CHECK THIS
              } else {
                this._highlight_input = null;
                this._highlight_input_slot = null; // XXX CHECK THIS
              }
            }
          } else if (this.connecting_input) {
            let pos = this._highlight_output || [0, 0]; //to store the output of isOverNodeOutput

            //on top of output
            if (this.isOverNodeBox(node, e.canvasX, e.canvasY)) {
              //mouse on top of the corner box, don't know what to do
            } else {
              //check if I have a slot below de mouse
              let slot = this.isOverNodeOutput(node, e.canvasX, e.canvasY, pos);
              if (slot != -1 && Node.getOutputs(node.properties)[slot]) {
                this._highlight_output = pos;
              } else {
                this._highlight_output = null;
              }
            }
          }
        }

        //Search for corner
        if (this.canvas) {
          if (
            Math.isInsideRectangle(
              e.canvasX,
              e.canvasY,
              node.pos[0] + node.size[0] - 5,
              node.pos[1] + node.size[1] - 5,
              5,
              5
            )
          ) {
            this.canvas.style.cursor = "se-resize";
          } else {
            this.canvas.style.cursor = "crosshair";
          }
        }
      } else {
        //not over a node
        //search for link connector
        var over_link = null;
        for (let link of this.graph.links) {
          if (!link) continue;
          var center = link.pos;
          if (
            !center ||
            e.canvasX < center[0] - 4 ||
            e.canvasX > center[0] + 4 ||
            e.canvasY < center[1] - 4 ||
            e.canvasY > center[1] + 4
          ) {
            continue;
          }
          over_link = link;
          break;
        }
        if (over_link != this.over_link_center) {
          this.over_link_center = over_link;
          this.dirty_canvas = true;
        }

        if (this.canvas) {
          this.canvas.style.cursor = "";
        }
      } //end

      //send event to node if capturing input (used with widgets that allow drag outside of the area of the node)
      if (this.node_capturing_input && this.node_capturing_input != node && this.node_capturing_input.onMouseMove) {
        this.node_capturing_input.onMouseMove(
          e,
          [e.canvasX - this.node_capturing_input.pos[0], e.canvasY - this.node_capturing_input.pos[1]],
          this
        );
      }

      //node being dragged
      if (this.node_dragged) {
        //console.log("draggin!",this.selected_nodes);
        for (let n of this.selected_nodes) {
          if (n?.pos) {
            n.pos[0] += delta[0] / this.ds.scale;
            n.pos[1] += delta[1] / this.ds.scale;
          }
        }

        this.dirty_canvas = true;
        this.dirty_bgcanvas = true;
        if (delta[0] != 0 && delta[1] != 0) {
          window.nodes.move(this.node_dragged.nodeID, {
            pos: this.node_dragged.pos,
          });
        }
      }

      if (this.resizing_node) {
        //convert mouse to node space
        var desired_size = [e.canvasX - this.resizing_node.pos[0], e.canvasY - this.resizing_node.pos[1]];
        var min_size = this.resizing_node.computeSize();
        desired_size[0] = Math.max(min_size[0], desired_size[0]);
        desired_size[1] = Math.max(min_size[1], desired_size[1]);
        this.resizing_node.setSize(desired_size);

        this.canvas.style.cursor = "se-resize";
        this.dirty_canvas = true;
        this.dirty_bgcanvas = true;
      }
    }

    e.preventDefault();
    return false;
  }

  /**
   * Called when a mouse up event has to be processed
   * @method processMouseUp
   */
  processMouseUp(e) {
    var is_primary = e.isPrimary === undefined || e.isPrimary;

    //early exit for extra pointer
    if (!is_primary) {
      /*e.stopPropagation();
            e.preventDefault();*/
      //console.log("pointerevents: processMouseUp pointerN_stop "+e.pointerId+" "+e.isPrimary);
      return false;
    }

    //console.log("pointerevents: processMouseUp "+e.pointerId+" "+e.isPrimary+" :: "+e.clientX+" "+e.clientY);
    if (this.set_canvas_dirty_on_mouse_event) this.dirty_canvas = true;

    if (!this.graph) return;

    var window = this.getCanvasWindow();
    var document = window.document;
    LGraphCanvas.active_canvas = this;

    //restore the mousemove event back to the canvas
    if (!this.options.skip_events) {
      //console.log("pointerevents: processMouseUp adjustEventListener");
      View.pointerListenerRemove(document, "move", this._mousemove_callback, true);
      View.pointerListenerAdd(this.canvas, "move", this._mousemove_callback, true);
      View.pointerListenerRemove(document, "up", this._mouseup_callback, true);
    }

    this.adjustMouseEvent(e);
    var now = NodiEnums.getTime();
    e.click_time = now - this.last_mouseclick;
    this.last_mouse_dragging = false;
    this.last_click_position = null;

    if (this.block_click) {
      //console.log("pointerevents: processMouseUp block_clicks");
      this.block_click = false; //used to avoid sending twice a click in a immediate button
    }

    //console.log("pointerevents: processMouseUp which: "+e.which);
    if (e.which == 1) {
      if (this.node_widget) this.processNodeWidgets(this.node_widget[0], this.graph_mouse, e);

      //left button
      this.node_widget = null;

      var node = this.graph.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes);

      if (this.dragging_rectangle) {
        if (this.graph) {
          var nodes = this.graph.nodes;

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
      } else if (this.connecting_node) {
        //dragging a connection
        this.dirty_canvas = true;
        this.dirty_bgcanvas = true;
        var slot;
        //node below mouse
        if (node) {
          //slot below mouse? connect
          if (this.connecting_output) {
            slot = this.isOverNodeInput(node, e.canvasX, e.canvasY);
            if (slot != null && slot >= 0) {
              let input = Node.getInputByIndex(node, slot);
              window.sendToServer("addLink", {
                from: this.connecting_node.nodeID,
                fromSlot: this.connecting_output.name,
                to: node.nodeID,
                toSlot: input.name,
              });
            }
          } else if (this.connecting_input) {
            slot = this.isOverNodeOutput(node, e.canvasX, e.canvasY);
            if (slot != null && slot >= 0) {
              let output = Node.getOutputByIndex(node, slot);
              window.sendToServer("addLink", {
                to: this.connecting_node.nodeID,
                toSlot: this.connecting_input.name,
                from: node.nodeID,
                fromSlot: output.name,
              });
            }
          }
        }
        this.connecting_output = null;
        this.connecting_input = null;
        this.connecting_pos = null;
        this.connecting_node = null;
      } //not dragging connection
      else if (this.resizing_node) {
        this.dirty_canvas = true;
        this.dirty_bgcanvas = true;
        this.resizing_node = null;
      } else if (this.node_dragged) {
        this.dirty_canvas = true;
        this.dirty_bgcanvas = true;
        this.node_dragged.pos[0] = Math.round(this.node_dragged.pos[0]);
        this.node_dragged.pos[1] = Math.round(this.node_dragged.pos[1]);
        if (this.align_to_grid) {
          Node.alignToGrid(this.node_dragged);
        }
        if (this.onNodeMoved) this.onNodeMoved(this.node_dragged);
        window.nodes.moved(this.node_dragged.nodeID, {
          pos: this.node_dragged.pos,
        });

        this.node_dragged = null;
      } //no node being dragged
      else {

        if (!node && this.selectedLink == null) {
          this.deselectAllNodes();
        }

        this.dirty_canvas = true;
        this.dragging_canvas = false;

        if (node && NodeWork.getNodeType(node.type).onMouseUp) {
          NodeWork.getNodeType(node.type).onMouseUp(
            this.node_over,
            e,
            [e.canvasX - this.node_over.pos[0], e.canvasY - this.node_over.pos[1]],
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
    } else if (e.which == 3) {
      //right button
      //trace("right");
      this.dirty_canvas = true;
      this.dragging_canvas = false;
    }

    //if((this.dirty_canvas || this.dirty_bgcanvas) && this.rendering_timer_id == null) {
    this.draw();
    //}

    if (is_primary) {
      this.pointer_is_down = false;
    }

    this.graph.change();

    //console.log("pointerevents: processMouseUp stopPropagation");
    e.stopPropagation();
    e.preventDefault();
    return false;
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
    this.ds.changeScale(Math.clamp(scale, 0.2, 4), [e.clientX, e.clientY]);

    this.graph.change();

    e.preventDefault();
  }
  /**
   * Called when a mouse wheel event has to be processed
   * @method processMouseWheel
   */
  processMouseWheel(e) {
    if (!this.graph || !this.allow_dragcanvas) {
      return;
    }

    this.zoom(e);
    return false; // prevent default
  }

  /**
   * returns true if a position (in graph space) is on top of a node little corner box
   * @method isOverNodeBox
   */
  isOverNodeBox(node, canvasx, canvasy) {
    if (Math.isInsideRectangle(canvasx, canvasy, node.pos[0] + 2, node.pos[1] + 2, -4, -4)) {
      return true;
    }
    return false;
  }

  /**
   * returns the INDEX if a position (in graph space) is on top of a node input slot
   * @method isOverNodeInput
   */
  isOverNodeInput(node, canvasx, canvasy, slot_pos) {
    for (var i = 0, l = Node.getInputs(node.properties).length; i < l; ++i) {
      var link_pos = Node.getConnectionPos(node, true, i);
      var is_inside = Math.isInsideRectangle(canvasx, canvasy, link_pos[0] - 10, link_pos[1] - 5, 40, 10);
      if (is_inside) {
        if (slot_pos) {
          slot_pos[0] = link_pos[0];
          slot_pos[1] = link_pos[1];
        }
        return i;
      }
    }
    return null;
  }

  /**
   * returns the INDEX if a position (in graph space) is on top of a node output slot
   * @method isOverNodeOuput
   */
  isOverNodeOutput(node, canvasx, canvasy, slot_pos) {
    for (var i = 0, l = Node.getOutputs(node.properties).length; i < l; ++i) {
      var link_pos = Node.getConnectionPos(node, false, i);
      var is_inside = false;
      is_inside = Math.isInsideRectangle(canvasx, canvasy, link_pos[0] - 10, link_pos[1] - 5, 40, 10);
      if (is_inside) {
        if (slot_pos) {
          slot_pos[0] = link_pos[0];
          slot_pos[1] = link_pos[1];
        }
        return i;
      }
    }
    return -1;
  }

  /**
   * process a key event
   * @method processKey
   */
  processKey(e) {
    if (!this.graph) {
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
        this.dragging_canvas = true;
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

      //collapse
      //...
      //TODO
      if (this.selected_nodes) {
        for (let node of this.selected_nodes) {
          if (node?.onKeyDown) node.onKeyDown(e);
        }
      }
    } else if (e.type == "keyup") {
      if (e.keyCode == 32) {
        // space
        this.dragging_canvas = false;
      }

      if (this.selected_nodes) {
        for (let n of this.selected_nodes) {
          if (n?.onKeyUp) n.onKeyUp(e);
        }
      }
    }

    this.graph.change();

    if (block_default) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
  }

  copyToClipboard() {
    var clipboard_info = {
      nodes: [],
      links: [],
    };
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
      var cloned = node.clone();
      if (!cloned) {
        console.warn("node type not found: " + node.type);
        continue;
      }
      clipboard_info.nodes.push(cloned.serialize());

      for (var j = 0; j < Node.getInputs(node.properties).length; ++j) {
        var input = Node.getInputs(node.properties)[j];
        if (!input || input.link == null) {
          continue;
        }
        var link_info = this.graph.links[input.link];
        if (!link_info) {
          continue;
        }
        var target_node = this.graph.getNodeById(link_info.origin_id);
        if (!target_node || !this.selected_nodes[target_node.nodeID]) {
          //improve this by allowing connections to non-selected nodes
          continue;
        } //not selected
        clipboard_info.links.push([
          target_node._relative_id,
          link_info.getInputByName(link_info.toSlot).nodeID,
          node._relative_id,
          link_info.fromSlot,
        ]);
      }
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
      var node = NodeWork.createNode(node_data.type);
      if (node) {
        node.configure(node_data);

        //paste in last known mouse position
        node.pos[0] += this.graph_mouse[0] - posMin[0]; //+= 5;
        node.pos[1] += this.graph_mouse[1] - posMin[1]; //+= 5;

        this.graph.add(node, { doProcessChange: false });

        nodes.push(node);
      }
    }

    //create links
    for (let link_info of clipboard_info.links) {
      var origin_node = nodes[link_info[0]];
      var target_node = nodes[link_info[2]];
      if (origin_node && target_node) origin_node.connect(link_info[1], target_node, link_info[3]);
      else console.warn("Warning, nodes missing on pasting");
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

    var node = this.graph ? this.graph.getNodeOnPos(pos[0], pos[1]) : null;

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

  processNodeDblClicked(n) {
    if (this.onNodeDblClicked) {
      this.onNodeDblClicked(n);
    }

    this.setDirty(true);
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
    this.current_node = node;
  }
  /**
   * selects several nodes (or adds them to the current selection)
   * @method selectNodes
   */
  selectNodes(nodes, add_to_current_selection) {
    if (!add_to_current_selection) {
      this.deselectAllNodes();
    }

    nodes = nodes || this.graph.nodes;
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

    this.setDirty(true);
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
    if (!this.graph) {
      return;
    }
    var nodes = this.graph.nodes;
    for (let node of nodes) {
      if (node) {
        if (node.onDeselected) {
          node.onDeselected();
        }
        if (this.onNodeDeselected) {
          this.onNodeDeselected(node);
        }
      }
    }
    this.graph.nodes.forEach((node) => {
      node.is_selected = false;
    });
    this.graph.links.forEach((linkit) => {
      if (linkit) linkit.selected = false;
    });
    this.selected_nodes = [];
    this.current_node = null;
    this.highlighted_links = {};
    if (this.onSelectionChange) this.onSelectionChange(this.selected_nodes);
    this.setDirty(true);
  }
  /**
   * deletes all nodes in the current selection from the graph
   * @method deleteSelectedNodes
   */
  deleteSelectedNodes() {
    for (let node of this.selected_nodes) {
      if (node) {
        if (node.block_delete) continue;
        this.graph.remove(node);
        if (this.onNodeDeselected) {
          this.onNodeDeselected(node);
        }
      }
    }
    this.selected_nodes = [];
    this.current_node = null;
    this.highlighted_links = {};
    this.setDirty(true);
  }
  /**
   * centers the camera on a given node
   * @method centerOnNode
   */
  centerOnNode(node) {
    this.ds.offset[0] = -node.pos[0] - node.size[0] * 0.5 + (this.canvas.width * 0.5) / this.ds.scale;
    this.ds.offset[1] = -node.pos[1] - node.size[1] * 0.5 + (this.canvas.height * 0.5) / this.ds.scale;
    this.setDirty(true, true);
  }
  /**
   * adds some useful properties to a mouse event, like the position in graph coordinates
   * @method adjustMouseEvent
   */
  adjustMouseEvent(e) {
    var clientX_rel = 0;
    var clientY_rel = 0;

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

    //console.log("pointerevents: adjustMouseEvent "+e.clientX+":"+e.clientY+" "+clientX_rel+":"+clientY_rel+" "+e.canvasX+":"+e.canvasY);
  }
  /**
   * changes the zoom level of the graph (default is 1), you can pass also a place used to pivot the zoom
   * @method setZoom
   */
  setZoom(value, zooming_center) {
    this.ds.changeScale(value, zooming_center);
    this.dirty_canvas = true;
    this.dirty_bgcanvas = true;
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
   * sends a node to the back (below all other nodes)
   * @method sendToBack
   */
  sendToBack(node) {
    var i = this.graph.nodes.indexOf(node);
    if (i == -1) {
      return;
    }

    this.graph.nodes.splice(i, 1);
    this.graph.nodes.unshift(node);
  }
  /**
   * checks which nodes are visible (inside the camera area)
   * @method computeVisibleNodes
   */
  computeVisibleNodes(nodes) {
    var visible_nodes = [];
    for (let n of nodes) {
      if (n) {
        if (!Math.overlapBounding(this.visible_area, Math.getBounding(n))) {
          continue;
        } //out of the visible area

        visible_nodes.push(n.nodeID);
      }
    }
    return visible_nodes;
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

    if (this.graph) {
      this.ds.computeVisibleArea(this.viewport);
    }

    this.drawBackCanvas();
    this.drawFrontCanvas();

    this.fps = this.render_time ? 1.0 / this.render_time : 0;
    this.frame += 1;
  }
  /**
   * draws the front canvas (the one containing all the nodes)
   * @method drawFrontCanvas
   */
  drawFrontCanvas() {
    this.dirty_canvas = false;

    if (!this.ctx) {
      this.ctx = this.bgcanvas.getContext("2d");
    }
    var ctx = this.ctx;
    if (!ctx) {
      //maybe is using webgl...
      return;
    }

    var canvas = this.canvas;
    if (ctx.start2D && !this.viewport) {
      ctx.start2D();
      ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    //clip dirty area if there is one, otherwise work in full canvas
    var area = this.viewport;
    if (area) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(area[0], area[1], area[2], area[3]);
      ctx.clip();
    }

    //clear
    //canvas.width = canvas.width;
    if (this.clear_background) {
      if (area) ctx.clearRect(area[0], area[1], area[2], area[3]);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    //draw bg canvas
    if (this.bgcanvas == this.canvas) {
      this.drawBackCanvas();
    } else {
      ctx.drawImage(this.bgcanvas, 0, 0);
    }

    //rendering
    if (this.onRender) {
      this.onRender(canvas, ctx);
    }

    if (this.graph) {
      //apply transformations
      ctx.save();
      this.ds.toCanvasContext(ctx);

      //draw nodes
      this.visible_nodes = this.computeVisibleNodes(this.graph.nodes);

      for (var i = 0; i < this.visible_nodes.length; ++i) {
        var node = this.graph.nodes[this.visible_nodes[i]];

        //transform coords system
        ctx.save();
        ctx.translate(node.pos[0], node.pos[1]);

        //Draw
        this.drawNode(node, ctx);

        //Restore
        ctx.restore();
      }

      //on top (debug)
      if (this.render_execution_order) {
        this.drawExecutionOrder(ctx);
      }

      //connections ontop?
      this.drawConnections(ctx);

      //current connection (the one being dragged by the mouse)
      if (this.connecting_pos != null) {
        ctx.lineWidth = this.connections_width;

        var connInOrOut = this.connecting_output || this.connecting_input;

        var connDir = connInOrOut.dir;
        if (connDir == null) {
          if (this.connecting_output) connDir = NodiEnums.RIGHT;
          else connDir = NodiEnums.LEFT;
        }

        //the connection being dragged by the mouse
        this.renderLink(ctx, null, this.connecting_pos, [this.graph_mouse[0], this.graph_mouse[1]], null);

        ctx.beginPath();
        ctx.rect(this.connecting_pos[0] - 6 + 0.5, this.connecting_pos[1] - 5 + 0.5, 10, 10);
        ctx.fill();

        ctx.beginPath();
        ctx.rect(this.graph_mouse[0] - 6 + 0.5, this.graph_mouse[1] - 5 + 0.5, 10, 10);
        ctx.fill();

        ctx.fillStyle = "#ffcc00";
        if (this._highlight_input) {
          ctx.beginPath();
          ctx.arc(this._highlight_input[0], this._highlight_input[1], 6, 0, Math.PI * 2);
          ctx.fill();
        }
        if (this._highlight_output) {
          ctx.beginPath();
          ctx.arc(this._highlight_output[0], this._highlight_output[1], 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }

    if (this.onDrawOverlay) {
      this.onDrawOverlay(ctx);
    }

    if (area) {
      ctx.restore();
    }
  }

  /**
   * draws the back canvas (the one containing the background and the connections)
   * @method drawBackCanvas
   */
  drawBackCanvas() {
    var canvas = this.bgcanvas;
    if (canvas.width != this.canvas.width || canvas.height != this.canvas.height) {
      canvas.width = this.canvas.width;
      canvas.height = this.canvas.height;
    }

    if (!this.bgctx) {
      this.bgctx = this.bgcanvas.getContext("2d");
    }
    var ctx = this.bgctx;
    if (ctx.start) {
      ctx.start();
    }

    var viewport = this.viewport || [0, 0, ctx.canvas.width, ctx.canvas.height];

    //clear
    if (this.clear_background) {
      ctx.clearRect(viewport[0], viewport[1], viewport[2], viewport[3]);
    }

    if (this.onRenderBackground) {
      this.onRenderBackground(canvas, ctx);
    }

    //reset in case of error
    if (!this.viewport) {
      ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    if (this.graph) {
      //apply transformations
      ctx.save();
      this.ds.toCanvasContext(ctx);

      if (this.onDrawBackground) {
        this.onDrawBackground(ctx, this.visible_area);
      }

      //DEBUG: show clipping area
      //ctx.fillStyle = "red";
      //ctx.fillRect( this.visible_area[0] + 10, this.visible_area[1] + 10, this.visible_area[2] - 20, this.visible_area[3] - 20);
      ctx.fillStyle = "#ccc";
      ctx.fillRect(this.visible_area[0], this.visible_area[1], this.visible_area[2], this.visible_area[3]);

      ctx.strokeStyle = "#555";
      this.ds.computeVisibleArea(this.viewport);
      let s = NodiEnums.CANVAS_GRID_SIZE;

      let marginx = Math.max(this.visible_area[2] * 0.1, 2 * NodiEnums.CANVAS_GRID_SIZE);
      let marginy = Math.max(this.visible_area[3] * 0.1, 2 * NodiEnums.CANVAS_GRID_SIZE);
      let grid_area = [
        this.visible_area[0] - marginx,
        this.visible_area[1] - marginy,
        this.visible_area[0] + this.visible_area[2] + marginx,
        this.visible_area[1] + this.visible_area[3] + marginy,
      ];

      let l = Math.floor(grid_area[0] / s) * s;
      let t = Math.floor(grid_area[1] / s) * s;
      let r = grid_area[2];
      let d = grid_area[3];

      ctx.fillStyle = "rgb(0,0,0,0.05)";

      for (var x = l; x <= r; x += s) {
        for (var y = t; y <= d; y += s) {
          ctx.fillRect(x - 4 + s / 2, y - 4 + s / 2, 8, 8);
        }
      }

      //draw connections
      this.drawConnections(ctx);

      ctx.shadowColor = "rgba(0,0,0,0)";

      //restore state
      ctx.restore();
    }

    if (ctx.finish) {
      ctx.finish();
    }

    this.dirty_bgcanvas = false;
    this.dirty_canvas = true; //to force to repaint the front canvas with the bgcanvas
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

    //clip if required (mask)
    var size = temp_vec2;
    temp_vec2.set(node.size);
    var horizontal = node.horizontal;

    if (node.clip_area) {
      //Start clipping
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, size[0], size[1]);
      ctx.clip();
    }

    //draw shape
    if (node.has_errors) {
      bgcolor = "red";
    }
    this.drawNodeShape(node, ctx, size, color, bgcolor, node.is_selected, node.mouseOver);
    ctx.shadowColor = "transparent";

    let nodeDrawFunction = NodeWork.getNodeType(node.type).onDrawForeground;
    if (nodeDrawFunction) nodeDrawFunction(node, ctx, this.visible_rect);

    //connection slots
    ctx.textAlign = "center";
    ctx.font = this.inner_text_font;

    var render_text = !low_quality;

    ctx.lineWidth = 1;

    var max_y = 0;
    var slot_pos = new Float32Array(2); //to reuse

    //render inputs and outputs
    //input connection slots
    var i = 0;
    for (var [id, slot] of Object.entries(node.properties)) {
      if (slot.input == false) continue;
      ctx.globalAlpha = editor_alpha;
      ctx.fillStyle = slot.link != null ? NodiEnums.LINK_COLOR : NodiEnums.CONNECTING_LINK_COLOR;

      var pos = Node.getConnectionPos(node, true, i, slot_pos);
      pos[0] -= node.pos[0];
      pos[1] -= node.pos[1];
      if (max_y < pos[1] + NodiEnums.NODE_SLOT_HEIGHT * 0.5) {
        max_y = pos[1] + NodiEnums.NODE_SLOT_HEIGHT * 0.5;
      }

      ctx.beginPath();

      ctx.rect(pos[0] - 4, pos[1] - 4, 8, 8); //faster
      ctx.fill();

      //render name
      if (render_text) {
        var text = slot.label;
        if (text) {
          ctx.fillStyle = NodiEnums.NODE_TEXT_COLOR;
          if (horizontal || slot.dir == NodiEnums.UP) {
            ctx.fillText(text, pos[0], pos[1] - 10);
          } else {
            ctx.fillText(text, pos[0] + 10, pos[1] + 5);
          }
        }
      }
      i++;
    }

    //output connection slots
    ctx.textAlign = "center";
    ctx.strokeStyle = "black";

    i = 0;
    for ([id, slot] of Object.entries(node.properties)) {
      if (slot.output == false) continue;

      //change opacity of incompatible slots when dragging a connection
      if (this.connecting_input) {
        ctx.globalAlpha = 0.4 * editor_alpha;
      }

      pos = Node.getConnectionPos(node, false, i, slot_pos);
      pos[0] -= node.pos[0];
      pos[1] -= node.pos[1];
      if (max_y < pos[1] + NodiEnums.NODE_SLOT_HEIGHT * 0.5) {
        max_y = pos[1] + NodiEnums.NODE_SLOT_HEIGHT * 0.5;
      }

      ctx.fillStyle = slot.link != null ? NodiEnums.LINK_COLOR : NodiEnums.CONNECTING_LINK_COLOR;
      ctx.beginPath();
      ctx.rect(pos[0] - 4, pos[1] - 4, 8, 8);
      ctx.fill();

      //render output name
      if (render_text) {
        text = slot.label;
        if (text) {
          ctx.fillStyle = NodiEnums.NODE_TEXT_COLOR;
          if (horizontal || slot.dir == NodiEnums.DOWN) {
            ctx.fillText(text, pos[0], pos[1] - 8);
          } else {
            ctx.fillText(text, pos[0] - 10, pos[1] + 5);
          }
        }
      }
      i++;
    }

    ctx.textAlign = "left";
    ctx.globalAlpha = 1;

    if (node.clip_area) {
      ctx.restore();
    }

    ctx.globalAlpha = 1.0;
  }
  //used by this.over_link_center
  drawLinkTooltip(ctx, link) {
    var pos = link.pos;
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], 3, 0, Math.PI * 2);
    ctx.fill();

    if (link.data == null) return;

    if (this.onDrawLinkTooltip) if (this.onDrawLinkTooltip(ctx, link, this) == true) return;

    var data = link.data;
    var text = null;

    if (data.constructor === Number) text = data.toFixed(2);
    else if (data.constructor === String) text = '"' + data + '"';
    else if (data.constructor === Boolean) text = String(data);
    else if (data.toToolTip) text = data.toToolTip();
    else text = "[" + data.constructor.name + "]";

    if (text == null) return;
    text = text.substr(0, 30); //avoid weird

    ctx.font = "14px Courier New";
    var info = ctx.measureText(text);
    var w = info.width + 20;
    var h = 24;
    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 3;
    ctx.fillStyle = "#454";
    ctx.beginPath();
    ctx.roundRect(pos[0] - w * 0.5, pos[1] - 15 - h, w, h, [3]);
    ctx.moveTo(pos[0] - 10, pos[1] - 15);
    ctx.lineTo(pos[0] + 10, pos[1] - 15);
    ctx.lineTo(pos[0], pos[1] - 5);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.textAlign = "center";
    ctx.fillStyle = "#CEC";
    ctx.fillText(text, pos[0], pos[1] - 15 - h * 0.3);
  }

  /**
   * draws the shape of the given node in the canvas
   * @method drawNodeShape
   */

  drawNodeShape(node, ctx, size, fgcolor, bgcolor, selected) {
    //bg rect
    ctx.strokeStyle = fgcolor;
    ctx.fillStyle = bgcolor;

    var title = node.title;
    //render node area depending on shape
    var area = tmp_area;
    area[0] = 0; //x
    area[1] = 0; //y
    area[2] = size[0]; //w
    area[3] = size[1]; //h

    //full node shape
    ctx.beginPath();
    ctx.roundRect(area[0], area[1], area[2], area[3], [this.round_radius]);
    ctx.fill();

    ctx.shadowColor = "transparent";

    if (node.onDrawBackground) {
      node.onDrawBackground(ctx, this, this.canvas, this.graph_mouse);
    }

    if (title) {
      let fontSize = 30;
      ctx.font = fontSize + "px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.fillText(title, node.size[0] / 2, (node.size[1] + fontSize) / 2);
    }
    //render selection marker
    if (selected) {
      if (node.onBounding) {
        node.onBounding(area);
      }

      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.roundRect(-6 + area[0], -6 + area[1], 12 + area[2], 12 + area[3], [this.round_radius * 2]);
      ctx.strokeStyle = NodiEnums.NODE_BOX_OUTLINE_COLOR;
      ctx.stroke();
      ctx.strokeStyle = fgcolor;
      ctx.globalAlpha = 1;
    }
  }
  /**
   * draws every connection visible in the canvas
   * OPTIMIZE THIS: pre-catch connections position instead of recomputing them every time
   * @method drawConnections
   */
  drawConnections(ctx) {
    var visible_area = this.visible_area;
    margin_area[0] = visible_area[0] - 20;
    margin_area[1] = visible_area[1] - 20;
    margin_area[2] = visible_area[2] + 40;
    margin_area[3] = visible_area[3] + 40;

    //draw connections
    ctx.lineWidth = this.connections_width;

    ctx.fillStyle = "#AAA";
    ctx.strokeStyle = "#AAA";
    ctx.globalAlpha = this.editor_alpha;
    //for every node
    var links = this.graph.links;
    for (var linkKey in links) {
      var link = links[linkKey];
      if (!link) {
        continue;
      }

      //find link info
      var start_node = this.graph.getNodeById(link.from);
      var end_node = this.graph.getNodeById(link.to);
      if (start_node == null || end_node == null) {
        continue;
      }
      var start_node_slot = Node.getOutputs(start_node.properties)
        .map((obj) => obj.name)
        .indexOf(link.toSlot);
      var end_node_slot = Node.getInputIndexByName(end_node, link.fromSlot);
      var start_node_slotpos = null;
      if (start_node_slot == -1) {
        start_node_slotpos = [start_node.pos[0] + 10, start_node.pos[1] + 10];
      } else {
        start_node_slotpos = Node.getConnectionPos(start_node, false, start_node_slot);
      }
      var end_node_slotpos = Node.getConnectionPos(end_node, true, end_node_slot);

      //compute link bounding
      link_bounding[0] = start_node_slotpos[0];
      link_bounding[1] = start_node_slotpos[1];
      link_bounding[2] = end_node_slotpos[0] - start_node_slotpos[0];
      link_bounding[3] = end_node_slotpos[1] - start_node_slotpos[1];
      if (link_bounding[2] < 0) {
        link_bounding[0] += link_bounding[2];
        link_bounding[2] = Math.abs(link_bounding[2]);
      }
      if (link_bounding[3] < 0) {
        link_bounding[1] += link_bounding[3];
        link_bounding[3] = Math.abs(link_bounding[3]);
      }

      //skip links outside of the visible area of the canvas
      if (!Math.overlapBounding(link_bounding, margin_area)) {
        continue;
      }

      var start_dir = NodiEnums.RIGHT;
      var end_dir = NodiEnums.LEFT;

      this.renderLink(ctx, link, start_node_slotpos, end_node_slotpos, false, start_dir, end_dir);
    }
    ctx.globalAlpha = 1;
  }

  renderLink(ctx, link, a, b, skip_border) {
    var canvas = window.canvas;

    let color = canvas.default_link_color;
    //choose color
    if (link) {
      color = link.color || NodiEnums.LINK_COLOR;
    }

    if (link != null && canvas.highlighted_links[link.linkID]) {
      color = "#FFF";
    }

    let start_dir = NodiEnums.RIGHT;
    let end_dir = NodiEnums.LEFT;

    ctx.setLineDash([]);
    if (canvas.render_connections_border && canvas.ds.scale > 0.6) {
      ctx.lineWidth = canvas.connections_width + 4;
    }
    ctx.lineJoin = "round";

    //begin line shape
    ctx.beginPath();

    ctx.moveTo(a[0], a[1]);
    var start_x = a[0];
    var start_y = a[1];
    var end_x = b[0];
    var end_y = b[1];
    let originType = "";
    let targetType = "";
    if (link) {
      originType = canvas.graph.nodes[link.to].type;
      targetType = canvas.graph.nodes[link.from].type;
    }

    ctx.lineTo(start_x, start_y);
    if (targetType == "control/junction" || originType == "control/junction") {
      ctx.lineTo(end_x, start_y);
      ctx.lineTo(end_x, end_y);
    } else {
      ctx.lineTo((start_x + end_x) * 0.5, start_y);
      ctx.lineTo((start_x + end_x) * 0.5, end_y);
    }
    ctx.lineTo(end_x, end_y);
    ctx.lineTo(b[0], b[1]);

    //rendering the outline of the connection can be a little bit slow
    if (canvas.render_connections_border && canvas.ds.scale > 0.6 && !skip_border) {
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.stroke();
    }

    ctx.lineWidth = canvas.connections_width;
    ctx.fillStyle = ctx.strokeStyle = color;
    ctx.stroke();
    //end line shape
    var pos = canvas.computeConnectionPoint([start_x, start_y], [end_x, end_y], 0.5, start_dir, end_dir, link);
    if (link) {
      link.pos = [pos[0], pos[1]];
    }

    //circle
    if (link?.pos) {
      ctx.beginPath();
      ctx.arc(link.pos[0], link.pos[1], 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  //returns the link center point based on curvature
  computeConnectionPoint(a, b, t, start_dir, end_dir, link) {
    start_dir = start_dir || NodiEnums.RIGHT;
    end_dir = end_dir || NodiEnums.LEFT;
    var dist = Math.distance(a, b);
    var p0 = a;
    var p1 = [a[0], a[1]];
    var p2 = [b[0], b[1]];
    var p3 = b;

    switch (start_dir) {
      case NodiEnums.LEFT:
        p1[0] += dist * -0.25;
        break;
      case NodiEnums.RIGHT:
        p1[0] += dist * 0.25;
        break;
      case NodiEnums.UP:
        p1[1] += dist * -0.25;
        break;
      case NodiEnums.DOWN:
        p1[1] += dist * 0.25;
        break;
    }
    switch (end_dir) {
      case NodiEnums.LEFT:
        p2[0] += dist * -0.25;
        break;
      case NodiEnums.RIGHT:
        p2[0] += dist * 0.25;
        break;
      case NodiEnums.UP:
        p2[1] += dist * -0.25;
        break;
      case NodiEnums.DOWN:
        p2[1] += dist * 0.25;
        break;
    }
    let originType, targetType;
    if (link) {
      originType = window.canvas.graph.nodes[link.to]?.constructor.type;
      targetType = window.canvas.graph.nodes[link.from]?.constructor.type;
    }
    if (originType == "control/junction" || targetType == "control/junction") {
      if (Math.abs(a[0] - b[0]) > Math.abs(a[1] - b[1])) {
        x = (a[0] + b[0]) / 2;
        y = a[1];
      } else {
        x = b[0];
        y = (a[1] + b[1]) / 2;
      }
    } else {
      var c1 = (1 - t) * (1 - t) * (1 - t);
      var c2 = 3 * ((1 - t) * (1 - t)) * t;
      var c3 = 3 * (1 - t) * (t * t);
      var c4 = t * t * t;

      var x = c1 * p0[0] + c2 * p1[0] + c3 * p2[0] + c4 * p3[0];
      var y = c1 * p0[1] + c2 * p1[1] + c3 * p2[1] + c4 * p3[1];
    }
    return [x, y];
  }

  drawExecutionOrder(ctx) {
    ctx.shadowColor = "transparent";
    ctx.globalAlpha = 0.25;

    ctx.textAlign = "center";
    ctx.strokeStyle = "white";
    ctx.globalAlpha = 0.75;

    var visible_nodes = this.visible_nodes;
    for (var i = 0; i < visible_nodes.length; ++i) {
      var node = visible_nodes[i];
      ctx.fillStyle = "black";
      ctx.fillRect(
        node.pos[0] - NodiEnums.NODE_TITLE_HEIGHT,
        node.pos[1] - NodiEnums.NODE_TITLE_HEIGHT,
        NodiEnums.NODE_TITLE_HEIGHT,
        NodiEnums.NODE_TITLE_HEIGHT
      );
      if (node.order == 0) {
        ctx.strokeRect(
          node.pos[0] - NodiEnums.NODE_TITLE_HEIGHT + 0.5,
          node.pos[1] - NodiEnums.NODE_TITLE_HEIGHT + 0.5,
          NodiEnums.NODE_TITLE_HEIGHT,
          NodiEnums.NODE_TITLE_HEIGHT
        );
      }
      ctx.fillStyle = "#FFF";
      ctx.fillText(node.order, node.pos[0] + NodiEnums.NODE_TITLE_HEIGHT * -0.5, node.pos[1] - 6);
    }
    ctx.globalAlpha = 1;
  }

  /**
   * draws the widgets stored inside a node
   * @method drawNodeWidgets
   */
  drawNodeWidgets(node, posY, ctx) {
    var width = node.size[0];
    posY += 2;
    var H = NodiEnums.NODE_WIDGET_HEIGHT;

    ctx.save();
    ctx.globalAlpha = this.editor_alpha;
    var outline_color = NodiEnums.WIDGET_OUTLINE_COLOR;

    var w = this;
    var y = posY;
    if (w.y) {
      y = w.y;
    }
    w.last_y = y;
    ctx.strokeStyle = outline_color;
    ctx.fillStyle = "#222";
    ctx.textAlign = "left";
    //ctx.lineWidth = 2;
    if (w.disabled) ctx.globalAlpha *= 0.5;
    var widget_width = w.width || width;

    posY += (w.computeSize ? w.computeSize(widget_width)[1] : H) + 4;
    ctx.globalAlpha = this.editor_alpha;
    ctx.restore();
    ctx.textAlign = "left";
  }

  adjustNodesSize() {
    var nodes = this.graph.nodes;
    for (var i = 0; i < nodes.length; ++i) {
      nodes[i].setSize(nodes[i].computeSize());
    }
    this.setDirty(true, true);
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

    this.bgcanvas.width = this.canvas.width;
    this.bgcanvas.height = this.canvas.height;
    this.setDirty(true, true);
  }
}

/**
 * Gesture recognizer for compound multi-touch transformations.
 *
 * 1. pinch/zoom/scale gesture.
 * 2. rotate gesture.
 */

function TransformRecognizer(element) {
  // Reference positions for the start of the transformation.
  this.referencePair = null;

  // Bind touch event handlers to this element.
  element.addEventListener("touchstart", this.touchStartHandler.bind(this));
  element.addEventListener("touchmove", this.touchMoveHandler.bind(this));
  element.addEventListener("touchend", this.touchEndHandler.bind(this));
  this.element = element;

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

/**
 * Touch event handlers.
 */
TransformRecognizer.prototype.touchStartHandler = function (e) {
  var touches = e.touches;
  for (var i = 0; i < touches.length; i++) {
    this.log("identifier: " + touches[i].identifier);
  }
  window.scale = window.canvas.ds.scale;
  // If there are now exactly 2 touches, this is the initial position.
  if (touches.length == 2) {
    // Save these two points as the reference.
    this.referencePair = new TouchPair(touches);
  }
};

TransformRecognizer.prototype.touchMoveHandler = function (e) {
  // Prevent default behavior of scrolling.
  e.preventDefault();
  console.log("current gesture", this.currentGesture);
  var touches = e.touches;
  // Check if there are exactly 2 fingers touching this element.
  if (touches.length == 2) {
    // Get the current touches as a TouchPair.
    var currentPair = new TouchPair(touches);
    // Compute angle and scale differences WRT reference position.
    var angle = currentPair.angleSince(this.referencePair);
    var scale = currentPair.scaleSince(this.referencePair);

    // Check if we're already in a gesture locked state.
    if (this.currentGesture == this.Gestures.NONE) {
      if (angle > this.Thresholds.ROTATION || -angle > this.Thresholds.ROTATION) {
        // If rotated enough, start a rotation.
        this.currentGesture = this.Gestures.ROTATE;
      } else if (scale > 1 + this.Thresholds.SCALE || scale < 1 - this.Thresholds.SCALE) {
        // Otherwise if scaled enough, start a scaling gesture.
        this.currentGesture = this.Gestures.SCALE;
      }
    }
    var center = currentPair.center();
    // Handle known gestures.
    if (this.currentGesture == this.Gestures.ROTATE) {
      // If we're already rotating, callback with the rotation amount.
      this.callbacks.rotate({
        rotation: angle,
        x: center.x,
        y: center.y,
      });
    }
    if (this.currentGesture == this.Gestures.SCALE) {
      // If already scaling, callback with scale amount.
      this.callbacks.scale({
        scale: scale,
        x: center.x,
        y: center.y,
      });
    }
  }
};

TransformRecognizer.prototype.touchEndHandler = function (e) {
  var touches = e.touches;
  // If there are less than 2 fingers, reset current gesture.
  if (touches.length < 2) {
    this.currentGesture = this.Gestures.NONE;
  }
};

/**
 * Registers a callback to fire when a pinch occurs.
 */
TransformRecognizer.prototype.onScale = function (callback) {
  this.callbacks.scale = callback;
};

/**
 * Registers a callback to fire when a rotate occurs.
 */
TransformRecognizer.prototype.onRotate = function (callback) {
  this.callbacks.rotate = callback;
};

TransformRecognizer.prototype.log = function (msg) {
  this.element.innerHTML += msg + "<br/>";
};

/**
 * Represents a pair of fingers touching the screen.
 */
function TouchPair(touchList) {
  // Grab the first two touches from the list.
  this.t1 = new Touch(touchList[0].pageX, touchList[0].pageY);
  this.t2 = new Touch(touchList[1].pageX, touchList[1].pageY);
}

/**
 * Given a reference position, calculate how much rotation happened.
 */
TouchPair.prototype.angleSince = function (referencePair) {
  // TODO: handle the edge case of going between 0 and 360.
  // eg. the difference between 355 and 0 is 5.
  return this.angle() - referencePair.angle();
};

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
