import NodeWork from "./nodework.mjs";

//Scale and Offset
export default class View {
  static pointerevents_method = "mouse"; // "mouse"|"pointer" use mouse for retrocompatibility issues? (none found @ now)

  constructor(element, skip_events) {
    this.offset = [0, 0];
    this.scale = 3;
    this.max_scale = 10;
    this.min_scale = 0.1;
    this.onredraw = null;
    this.enabled = true;
    this.last_mouse = [0, 0];
    this.element = null;
    this.visible_area = new Float32Array(4);

    if (element) {
      this.element = element;
      if (!skip_events) {
        this.bindEvents(element);
      }
    }
  }

  /* helper for interaction: pointer, touch, mouse Listeners
  used by LGraphCanvas View ContextMenu*/
  static pointerListenerAdd(oDOM, sEvIn, fCall, capture = false) {
    if (!oDOM || !oDOM.addEventListener || !sEvIn || typeof fCall !== "function") {
      //console.log("cant pointerListenerAdd "+oDOM+", "+sEvent+", "+fCall);
      return; // -- break --
    }

    var sMethod = View.pointerevents_method;
    var sEvent = sEvIn;

    // UNDER CONSTRUCTION
    // convert pointerevents to touch event when not available
    if (sMethod == "pointer" && !window.PointerEvent) {
      console.warn("sMethod=='pointer' && !window.PointerEvent");
      console.dlog(
        "Converting pointer[" + sEvent + "] : down move up cancel enter TO touchstart touchmove touchend, etc .."
      );
      switch (sEvent) {
        case "down": {
          sMethod = "touch";
          sEvent = "start";
          break;
        }
        case "move": {
          sMethod = "touch";
          //sEvent = "move";
          break;
        }
        case "up": {
          sMethod = "touch";
          sEvent = "end";
          break;
        }
        case "cancel": {
          sMethod = "touch";
          //sEvent = "cancel";
          break;
        }
        case "enter": {
          console.dlog("debug: Should I send a move event?"); // ???
          break;
        }
        // case "over": case "out": not used at now
        default: {
          console.warn("PointerEvent not available in this browser ? The event " + sEvent + " would not be called");
        }
      }
    }

    switch (sEvent) {
      //both pointer and move events
      case "down":
      case "up":
      case "move":
      case "over":
      case "out":
      case "enter":
        oDOM.addEventListener(sMethod + sEvent, fCall, capture);
        break;
      // only pointerevents
      case "leave":
      case "cancel":
      case "gotpointercapture":
      case "lostpointercapture":
        if (sMethod != "mouse") {
          return oDOM.addEventListener(sMethod + sEvent, fCall, capture);
        }
        break;
      // not "pointer" || "mouse"
      default:
        return oDOM.addEventListener(sEvent, fCall, capture);
    }
  }

  static pointerListenerRemove(oDOM, sEvent, fCall, capture = false) {
    if (!oDOM || !oDOM.removeEventListener || !sEvent || typeof fCall !== "function") {
      //console.log("cant pointerListenerRemove "+oDOM+", "+sEvent+", "+fCall);
      return; // -- break --
    }
    switch (sEvent) {
      //both pointer and move events
      case "down":
      case "up":
      case "move":
      case "over":
      case "out":
      case "enter":
        {
          if (View.pointerevents_method == "pointer" || View.pointerevents_method == "mouse") {
            oDOM.removeEventListener(View.pointerevents_method + sEvent, fCall, capture);
          }
        }
        break;
      // only pointerevents
      case "leave":
      case "cancel":
      case "gotpointercapture":
      case "lostpointercapture":
        {
          if (View.pointerevents_method == "pointer") {
            return oDOM.removeEventListener(View.pointerevents_method + sEvent, fCall, capture);
          }
        }
        break;
      // not "pointer" || "mouse"
      default:
        return oDOM.removeEventListener(sEvent, fCall, capture);
    }
  }

  bindEvents(element) {
    this.last_mouse = new Float32Array(2);

    this._binded_mouse_callback = this.onMouse.bind(this);

    View.pointerListenerAdd(element, "down", this._binded_mouse_callback);
    View.pointerListenerAdd(element, "move", this._binded_mouse_callback);
    View.pointerListenerAdd(element, "up", this._binded_mouse_callback);

    element.addEventListener("mousewheel", this._binded_mouse_callback, false);
    element.addEventListener("wheel", this._binded_mouse_callback, false);
  }

  computeVisibleArea(viewport) {
    if (!this.element) {
      this.visible_area[0] = this.visible_area[1] = this.visible_area[2] = this.visible_area[3] = 0;
      return;
    }
    var width = this.element.width;
    var height = this.element.height;
    var startx = -this.offset[0];
    var starty = -this.offset[1];
    if (viewport) {
      startx += viewport[0] / this.scale;
      starty += viewport[1] / this.scale;
      width = viewport[2];
      height = viewport[3];
    }
    var endx = startx + width / this.scale;
    var endy = starty + height / this.scale;
    this.visible_area[0] = startx;
    this.visible_area[1] = starty;
    this.visible_area[2] = endx - startx;
    this.visible_area[3] = endy - starty;
  }

  toCanvasContext(ctx) {
    ctx.scale(this.scale, this.scale);
    ctx.translate(this.offset[0], this.offset[1]);
  }

  convertOffsetToCanvas(pos) {
    //return [pos[0] / this.scale - this.offset[0], pos[1] / this.scale - this.offset[1]];
    return [(pos.x + this.offset[0]) * this.scale, (pos.y + this.offset[1]) * this.scale];
  }

  convertCanvasToOffset(pos, out) {
    out = out || [0, 0];
    out[0] = pos.x / this.scale - this.offset[0];
    out[1] = pos.y / this.scale - this.offset[1];
    return out;
  }

  changeScale(value, zooming_center) {
    if (value < this.min_scale) {
      value = this.min_scale;
    } else if (value > this.max_scale) {
      value = this.max_scale;
    }

    if (value == this.scale) {
      return;
    }

    if (!this.element) {
      return;
    }

    var rect = this.element.getBoundingClientRect();
    if (!rect) {
      return;
    }

    zooming_center = zooming_center || [rect.width * 0.5, rect.height * 0.5];
    var center = this.convertCanvasToOffset(zooming_center);
    this.scale = value;
    if (Math.abs(this.scale - 1) < 0.01) {
      this.scale = 1;
    }

    var new_center = this.convertCanvasToOffset(zooming_center);
    var delta_offset = [new_center[0] - center[0], new_center[1] - center[1]];

    this.offset[0] += delta_offset[0];
    this.offset[1] += delta_offset[1];

    if (this.onredraw) {
      this.onredraw(this);
    }
  }

  changeDeltaScale(value, zooming_center) {
    this.changeScale(this.scale * value, zooming_center);
  }
  reset() {
    this.scale = 1;
    this.offset[0] = 0;
    this.offset[1] = 0;
  }
}
