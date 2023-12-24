import { NodiEnums } from "./enums.mjs";

//this is the class in charge of storing link information
export default class LLink {
  constructor(id, type, origin_id, origin_slot, target_id, target_slot) {
    this.id = id;
    this.type = type;
    this.origin_id = origin_id;
    this.origin_slot = origin_slot;
    this.target_id = target_id;
    this.target_slot = target_slot;

    this._data = null;
    this.pos = [];
  }

  configure(o) {
    this.id = o.nodeID;
    this.type = o.type;
    this.origin_id = o.from;
    this.origin_slot = o.fromSlot;
    this.target_id = o.to;
    this.target_slot = o.toSlot;
  }

  serialize() {
    return [
      this.id,
      this.origin_id,
      this.origin_slot,
      this.target_id,
      this.target_slot,
      this.type,
    ];
  }

  render(ctx, a, b, skip_border, flow, color, start_dir, end_dir) {
    var link = this;
    var canvas = window.canvas;
    if (link) {
      canvas.visible_links.push(link);
    }

    //choose color
    if (!color && link) {
      color = link.color || NodiEnums.LINK_COLOR;
    }
    if (!color) {
      color = canvas.default_link_color;
    }
    if (link != null && canvas.highlighted_links[link.id]) {
      color = "#FFF";
    }

    start_dir = start_dir || NodiEnums.RIGHT;
    end_dir = end_dir || NodiEnums.LEFT;

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
      originType = canvas.graph.nodes[link.target_id].constructor.type;
      targetType = canvas.graph.nodes[link.origin_id].constructor.type;
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
    if (
      canvas.render_connections_border &&
      canvas.ds.scale > 0.6 &&
      !skip_border
    ) {
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.stroke();
    }

    ctx.lineWidth = canvas.connections_width;
    ctx.fillStyle = ctx.strokeStyle = color;
    ctx.stroke();
    //end line shape
    var pos = canvas.computeConnectionPoint(
      [start_x, start_y],
      [end_x, end_y],
      0.5,
      start_dir,
      end_dir,
      link
    );
    if (link && link.pos) {
      link.pos[0] = pos[0];
      link.pos[1] = pos[1];
    }

    //render arrow in the middle
    if (
      canvas.ds.scale >= 0.6 &&
      canvas.highquality_render &&
      end_dir != NodiEnums.CENTER
    ) {
      //render arrow
      if (canvas.render_connection_arrows) {
        //compute two points in the connection
        var posA = canvas.computeConnectionPoint(
          a,
          b,
          0.25,
          start_dir,
          end_dir
        );
        var posB = canvas.computeConnectionPoint(
          a,
          b,
          0.26,
          start_dir,
          end_dir
        );
        var posC = canvas.computeConnectionPoint(
          a,
          b,
          0.75,
          start_dir,
          end_dir
        );
        var posD = canvas.computeConnectionPoint(
          a,
          b,
          0.76,
          start_dir,
          end_dir
        );

        //compute the angle between them so the arrow points in the right direction
        var angleA = 0;
        var angleB = 0;
        if (canvas.render_curved_connections) {
          angleA = -Math.atan2(posB[0] - posA[0], posB[1] - posA[1]);
          angleB = -Math.atan2(posD[0] - posC[0], posD[1] - posC[1]);
        } else {
          angleB = angleA = b[1] > a[1] ? 0 : Math.PI;
        }

        //render arrow
        ctx.save();
        ctx.translate(posA[0], posA[1]);
        ctx.rotate(angleA);
        ctx.beginPath();
        ctx.moveTo(-5, -3);
        ctx.lineTo(0, +7);
        ctx.lineTo(+5, -3);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.translate(posC[0], posC[1]);
        ctx.rotate(angleB);
        ctx.beginPath();
        ctx.moveTo(-5, -3);
        ctx.lineTo(0, +7);
        ctx.lineTo(+5, -3);
        ctx.fill();
        ctx.restore();
      }

      //circle
      ctx.beginPath();
      ctx.arc(pos[0], pos[1], 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
