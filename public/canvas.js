import { NodiEnums } from "./enums.mjs";
import View from "./view.js";
import NodeWork from "./nodework.mjs";
import Node from "./node.mjs";

var margin_area = new Float32Array(4);
var tmp_area = new Float32Array(4);
var link_bounding = new Float32Array(4);

export default class LGraphCanvas {
  constructor(canvas, graph, options) {
    this.options = options = options || {};
    if (canvas && canvas.constructor === String) {
      canvas = document.querySelector(canvas);
    }
    this.nodework = new NodeWork();
    this.ds = new View();
    this.cursorMode = 0;
    this.zoom_modify_alpha = true; //otherwise it generates ugly patterns when scaling down too much

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

    this.render_only_selected = true;
    this.show_info = false;
    this.allow_dragcanvas = true;
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
    this.grid_mouse = [0, 0]; //mouse in grid coordinates

    //callbacks
    this.onMouse = null;
    this.onDrawForeground = null; //to render foreground objects (above nodes and connections) in the canvas affected by transform
    this.onDrawLinkTooltip = null; //called when rendering a tooltip
    this.onSelectionChange = null; //called if the selection changes
    this.onConnectingChange = null; //called before any link changes

    this.connections_width = 3;
    this.round_radius = 8;

    this.current_node = null;
    this.Node = Node;
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
    canvas.addEventListener("touchstart", this.processMouseDown.bind(this), false);
    canvas.addEventListener("touchmove", this.processMouseMove.bind(this), false);
    canvas.addEventListener("touchend", this.processMouseUp.bind(this), false);
    canvas.addEventListener("mousewheel", this.processMouseWheel.bind(this), false);
    canvas.addEventListener("contextmenu", this._doNothing);
    canvas.addEventListener("DOMMouseScroll", this.processMouseWheel.bind(this), false);
    canvas.addEventListener("keydown", this.processKey.bind(this), true);
    document.addEventListener("keyup", this.processKey.bind(this), true); //in document, otherwise it doesn't fire keyup
    canvas.addEventListener("dragover", this._doNothing, false);
    canvas.addEventListener("dragend", this._doNothing, false);
    canvas.addEventListener("drop", this._ondrop_callback, false);
    canvas.addEventListener("dragenter", this._doReturnTrue, false);

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
    if (!this.graph) return;
    if (e.which > 1) return;
    this.adjustMouseEvent(e);

    //console.log("pointerevents: processMouseDown pointerId:"+e.pointerId+" which:"+e.which+" isPrimary:"+e.isPrimary+" :: x y "+x+" "+y);
    this.ds.viewport = this.viewport;
    var now = NodiEnums.getTime();
    var is_primary = e.isPrimary === undefined || !e.isPrimary;
    var is_double_click = now - this.last_mouseclick < 300 && is_primary;
    this.mouse[0] = e.clientX;
    this.mouse[1] = e.clientY;
    this.graph_mouse[0] = e.canvasX;
    this.graph_mouse[1] = e.canvasY;
    this.last_click_position = [this.mouse[0], this.mouse[1]];
    this.selectedLink = null;

    var node_mouse = this.graph.getNodeOnPos(e.canvasX, e.canvasY);

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

      this.deselectAllNodes();

      this.selectedLink = link.linkID;
      link.selected = true;
      this.highlighted_links = {};
      this.highlighted_links[link.linkID] = true;
      this.onSelectionChange([link.linkID]);
      this.over_link_center = null; //clear tooltip
      break;
    }

    this.canvas.focus();
    //left button mouse / single finger
    if (e.ctrlKey) {
      //multiselect
      this.dragging_rectangle = new Float32Array(4);
      this.dragging_rectangle[0] = e.canvasX;
      this.dragging_rectangle[1] = e.canvasY;
      this.dragging_rectangle[2] = 1;
      this.dragging_rectangle[3] = 1;
    } else if (e.altKey && node_mouse) {
      // clone node ALT dragging
      let cloned = Node.clone(node_mouse);
      if (cloned) {
        cloned.pos[0] += 5;
        cloned.pos[1] += 5;
        this.graph.add(cloned, false, { doCalcSize: false });
        node_mouse = cloned;
        if (!block_drag_node) {
          this.node_dragged = node_mouse;
          if (!this.selected_nodes[node_mouse.nodeID]) {
            this.processNodeSelected(node_mouse, e);
          }
        }
      }
    } else if (node_mouse) {
      //select
      //when clicked on top of a node
      //not dragging mouse to connect two slots
      if (!this.connecting_node) {
        if (
          node_mouse.resizable !== false &&
          Math.isInsideRectangle(
            e.canvasX,
            e.canvasY,
            node_mouse.pos[0] + node_mouse.size[0] - 5,
            node_mouse.pos[1] + node_mouse.size[1] - 5,
            10,
            10
          )
        ) {
          this.resizing_node = node_mouse;
          this.canvas.style.cursor = "se-resize";
        } else {
          //search for outputs
          for (var i = 0, l = Node.getOutputs(node_mouse.properties).length; i < l; ++i) {
            var output = Node.getOutputs(node_mouse.properties)[i];
            var link_pos = Node.getConnectionPos(node_mouse, false, i);
            if (Math.isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 15, link_pos[1] - 10, 30, 20)) {
              this.connecting_node = node_mouse;
              this.connecting_output = output;
              this.connecting_output.slot_index = i;
              this.connecting_pos = Node.getConnectionPos(node_mouse, false, i);

              if (is_double_click) {
                if (node_mouse.onOutputDblClick) {
                  node_mouse.onOutputDblClick(i, e);
                }
              } else {
                if (node_mouse.onOutputClick) {
                  node_mouse.onOutputClick(i, e);
                }
              }

              break;
            }
          }

          //search for inputs
          for (i = 0, l = Node.getInputs(node_mouse.properties).length; i < l; ++i) {
            var input = Node.getInputs(node_mouse.properties)[i];
            link_pos = Node.getConnectionPos(node_mouse, true, i);
            if (Math.isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 15, link_pos[1] - 10, 30, 20)) {
              if (is_double_click) {
                if (node_mouse.onInputDblClick) {
                  node_mouse.onInputDblClick(i, e);
                }
              } else {
                if (node_mouse.onInputClick) {
                  node_mouse.onInputClick(i, e);
                }
              }

              // connect from in to out, from to to from
              this.connecting_node = node_mouse;
              this.connecting_input = input;
              this.connecting_input.slot_index = i;
              this.connecting_pos = Node.getConnectionPos(node_mouse, true, i);

              this.dirty_bgcanvas = true;
            }
          }
        } //not resizing
      }

      //it wasn't clicked on the links boxes
      var block_drag_node = false;
      var pos = [e.canvasX - node_mouse.pos[0], e.canvasY - node_mouse.pos[1]];

      //if do not capture mouse
      if (
        NodeWork.getNodeType(node_mouse.type).onMouseDown &&
        NodeWork.getNodeType(node_mouse.type).onMouseDown(node_mouse, e, pos, this)
      ) {
        block_drag_node = true;
      }

      if (!block_drag_node) {
        this.node_dragged = node_mouse;
        if (!this.selected_nodes[node_mouse.nodeID]) {
          this.processNodeSelected(node_mouse, e);
        }
      }
    } else if (this.current_node && !node_mouse) {
      // unselect
      this.current_node.selected = false;
      this.current_node = null;
      this.deselectAllNodes();
    } else if (!this.current_node && !node_mouse) {
      // add node
      this.gripped = "canvas";
    }

    this.last_mouse_down[0] = e.clientX;
    this.last_mouse_down[1] = e.clientY;
    this.last_mouseclick = NodiEnums.getTime();
    this.last_mouse_dragging = true;

    if (this.rendering_timer_id == null) this.draw();

    this.graph.change();

    e.stopPropagation();

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

    if (!this.graph) {
      return;
    }

    this.adjustMouseEvent(e);
    this.mouse = [e.clientX, e.clientY];
    var delta = [this.mouse[0] - this.last_mouse_down[0], this.mouse[1] - this.last_mouse_down[1]];
    this.graph_mouse = [e.canvasX, e.canvasY];
    this.gridPos = NodiEnums.toGrid([e.canvasX, e.canvasY]);
    this.grid_mouse = NodiEnums.toCanvas(this.gridPos);

    console.log("processMouseMove " + this.last_mouse_down);

    e.dragging = this.last_mouse_dragging;
    if (this.current_node && this.current_node.moving == false) {
      window.nodes.pick(this.current_node);
      this.current_node.moving = true;
    } else if (this.dragging_rectangle) {
      this.dragging_rectangle[2] = e.canvasX - this.dragging_rectangle[0];
      this.dragging_rectangle[3] = e.canvasY - this.dragging_rectangle[1];
    } else if (this.gripped == "canvas" && this.allow_dragcanvas) {
      ////console.log("pointerevents: processMouseMove is dragging_canvas");
      this.ds.offset[0] += delta[0] / this.ds.scale;
      this.ds.offset[1] += delta[1] / this.ds.scale;
    } else {
      //get node over
      var node = this.graph.getNodeOnPos(e.canvasX, e.canvasY);

      //remove mouseover flag
      this.graph.nodes.forEach((node) => {
        if (!node) return;
        if (node.mouseOver) {
          //mouse leave
          node.mouseOver = false;
          if (this.node_over && this.node_over.onMouseLeave) {
            this.node_over.onMouseLeave(e);
          }
          this.node_over = null;
        }
      });

      //mouse over a node
      if (node) {
        //this.canvas.style.cursor = "move";
        if (!node.mouseOver) {
          //mouse enter
          node.mouseOver = true;
          this.node_over = node;

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
        if (window.settings?.ownerShip == false || this.node_dragged.owner == window.socketIO.id) {
          //console.log("draggin!",this.selected_nodes);
          for (let n of this.selected_nodes) {
            if (n?.pos) {
              n.pos[0] += delta[0] / this.ds.scale;
              n.pos[1] += delta[1] / this.ds.scale;
            }
          }

          if (delta[0] != 0 && delta[1] != 0) {
            window.nodes.move(this.node_dragged.nodeID, {
              pos: this.node_dragged.pos,
            });
          }
        }
      }

      if (this.resizing_node) {
        //convert mouse to node space
        var desired_size = [e.canvasX - this.resizing_node.pos[0], e.canvasY - this.resizing_node.pos[1]];
        var min_size = Node.computeSize(this.resizing_node);
        desired_size[0] = Math.max(min_size[0], desired_size[0]);
        desired_size[1] = Math.max(min_size[1], desired_size[1]);
        Node.setSize(this.resizing_node, desired_size);

        this.canvas.style.cursor = "se-resize";
        this.dirty_bgcanvas = true;
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
    //console.log("pointerevents: processMouseUp "+e.pointerId+" "+e.isPrimary+" :: "+e.clientX+" "+e.clientY);
    if (!this.graph) return;

    var window = this.getCanvasWindow();

    this.adjustMouseEvent(e);
    var now = NodiEnums.getTime();
    e.click_time = now - this.last_mouseclick;
    this.last_mouse_dragging = false;

    //console.log("pointerevents: processMouseUp which: "+e.which);
    if (e.which > 1) return;
    if (this.node_widget) this.processNodeWidgets(this.node_widget[0], this.graph_mouse, e);

    //left button
    this.node_widget = null;

    var node = this.graph.getNodeOnPos(e.canvasX, e.canvasY);
    if (this.gripped == "canvas") {
      this.dragging_canvas = false;
    } else if (this.dragging_rectangle) {
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
    } else if (this.resizing_node) {
      this.resizing_node = null;
    } else if (this.node_dragged) {
      window.nodes.dropNode(this.node_dragged.nodeID, {
        pos: [e.canvasX, e.canvasY],
      });
      this.node_dragged = null;
    } else {
      //no node being dragged
      if (!node && this.selectedLink == null) {
        this.deselectAllNodes();
      }

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

    this.draw();

    this.graph.change();
    if (
      Math.abs(this.last_click_position[0] - e.clientX) < 5 &&
      Math.abs(this.last_click_position[1] - e.clientY) < 5
    ) {
      this.processMouseClick(e);
    }
    this.last_click_position = null;
    this.gripped = "";

    //console.log("pointerevents: processMouseUp stopPropagation");
    e.stopPropagation();
    e.preventDefault();
    return false;
  }

  processMouseClick(e) {
    if (this.gripped == "canvas") {
      window.setShowNodes(true);
    }
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
      var cloned = Node.clone(node);
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
      if (!node) return;
      node.is_selected = false;
    });
    this.graph.links.forEach((linkit) => {
      if (!linkit) return;
      if (linkit) linkit.selected = false;
    });
    this.selected_nodes = [];
    this.current_node = null;
    this.highlighted_links = {};
    if (this.onSelectionChange) this.onSelectionChange(this.selected_nodes);
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

    ctx.fillStyle = "rgb(0,0,0,0.05)";

    for (var x = l; x <= r; x += s) {
      for (var y = t; y <= d; y += s) {
        ctx.fillRect(x - 4 + s / 2, y - 4 + s / 2, 8, 8);
        //ctx.fillRect(x - 4, y + 28, 8, 8);
      }
    }
    ctx.restore();

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
        if (NodeWork.getNodeType(node.type).drawBase !== false) {
          this.drawNode(node, ctx);
        } else {
          let nodeDrawFunction = NodeWork.getNodeType(node.type).onDrawForeground;
          if (nodeDrawFunction) nodeDrawFunction(node, ctx);
        }

        //Restore
        ctx.restore();
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
      ctx.setLineDash([5, 15]);
      ctx.strokeStyle = "black";
      ctx.strokeRect(this.grid_mouse[0], this.grid_mouse[1], NodiEnums.CANVAS_GRID_SIZE, NodiEnums.CANVAS_GRID_SIZE);
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

    this.drawNodeShape(node, ctx, node.size, color, bgcolor, node.is_selected, node.mouseOver);
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
          ctx.fillText(text, pos[0], pos[1] - 10);
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
          ctx.fillText(text, pos[0], pos[1] - 8);
        }
      }
      i++;
    }

    ctx.textAlign = "left";
    ctx.globalAlpha = 1;
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

    if (node.properties?.label?.value) {
      let fontSize = 30;
      ctx.font = fontSize + "px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.fillText(node.properties.label.value, node.size[0] / 2, (node.size[1] + fontSize) / 2);
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
        .indexOf(link.fromSlot);
      var end_node_slot = Node.getInputs(end_node.properties)
        .map((obj) => obj.name)
        .indexOf(link.toSlot);

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

  adjustNodesSize() {
    var nodes = this.graph.nodes;
    for (var i = 0; i < nodes.length; ++i) {
      nodes[i].setSize(nodes[i].computeSize());
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
