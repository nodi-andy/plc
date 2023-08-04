import { NodiEnums } from "./enums.js";

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
        this._pos = new Float32Array(2); //center
    }
    configure(o) {
        if (o.constructor === Array) {
            this.id = o[0];
            this.origin_id = o[1];
            this.origin_slot = o[2];
            this.target_id = o[3];
            this.target_slot = o[4];
            this.type = o[5];
        } else {
            this.id = o.id;
            this.type = o.type;
            this.origin_id = o.origin_id;
            this.origin_slot = o.origin_slot;
            this.target_id = o.target_id;
            this.target_slot = o.target_slot;
        }
    }
    serialize() {
        return [
            this.id,
            this.origin_id,
            this.origin_slot,
            this.target_id,
            this.target_slot,
            this.type
        ];
    }
    /**
         * draws a link between two points
         * @method renderLink
         * @param {vec2} a start pos
         * @param {vec2} b end pos
         * @param {Object} link the link object with all the link info
         * @param {boolean} skip_border ignore the shadow of the link
         * @param {boolean} flow show flow animation (for events)
         * @param {string} color the color for the link
         * @param {number} start_dir the direction enum
         * @param {number} end_dir the direction enum
         * @param {number} num_sublines number of sublines (useful to represent vec3 or rgb)
         **/
    render(ctx, a, b, skip_border, flow, color, start_dir, end_dir, num_sublines) {
        var link = this
        var canvas = window.canvas;
        if (link) {
            canvas.visible_links.push(link);
        }

        //choose color
        if (!color && link) {
            color = link.color || NodiEnums.link_type_colors[link.type];
        }
        if (!color) {
            color = canvas.default_link_color;
        }
        if (link != null && canvas.highlighted_links[link.id]) {
            color = "#FFF";
        }

        start_dir = start_dir || NodiEnums.RIGHT;
        end_dir = end_dir || NodiEnums.LEFT;

        var dist = Math.distance(a, b);
        ctx.setLineDash([]);
        if (canvas.render_connections_border && canvas.ds.scale > 0.6) {
            ctx.lineWidth = canvas.connections_width + 4;
        }
        ctx.lineJoin = "round";
        num_sublines = num_sublines || 1;
        if (num_sublines > 1) {
            ctx.lineWidth = 0.5;
        }

        //begin line shape
        ctx.beginPath();
        for (var i = 0; i < num_sublines; i += 1) {
            var offsety = (i - (num_sublines - 1) * 0.5) * 5;

            var start_offset_x = 0;
            var start_offset_y = 0;
            var end_offset_x = 0;
            var end_offset_y = 0;
            if (canvas.links_render_mode == NodiEnums.SPLINE_LINK) {
                ctx.moveTo(a[0], a[1] + offsety);
                switch (start_dir) {
                    case NodiEnums.LEFT:
                        start_offset_x = dist * -0.25;
                        break;
                    case NodiEnums.RIGHT:
                        start_offset_x = dist * 0.25;
                        break;
                    case NodiEnums.UP:
                        start_offset_y = dist * -0.25;
                        break;
                    case NodiEnums.DOWN:
                        start_offset_y = dist * 0.25;
                        break;
                }
                switch (end_dir) {
                    case NodiEnums.LEFT:
                        end_offset_x = dist * -0.25;
                        break;
                    case NodiEnums.RIGHT:
                        end_offset_x = dist * 0.25;
                        break;
                    case NodiEnums.UP:
                        end_offset_y = dist * -0.25;
                        break;
                    case NodiEnums.DOWN:
                        end_offset_y = dist * 0.25;
                        break;
                }
                ctx.bezierCurveTo(
                    a[0] + start_offset_x,
                    a[1] + start_offset_y + offsety,
                    b[0] + end_offset_x,
                    b[1] + end_offset_y + offsety,
                    b[0],
                    b[1] + offsety
                );
            } else if (canvas.links_render_mode == NodiEnums.LINEAR_LINK) {
                ctx.moveTo(a[0], a[1] + offsety);
                switch (start_dir) {
                    case NodiEnums.LEFT:
                        start_offset_x = -1;
                        break;
                    case NodiEnums.RIGHT:
                        start_offset_x = 1;
                        break;
                    case NodiEnums.UP:
                        start_offset_y = -1;
                        break;
                    case NodiEnums.DOWN:
                        start_offset_y = 1;
                        break;
                }
                switch (end_dir) {
                    case NodiEnums.LEFT:
                        end_offset_x = -1;
                        break;
                    case NodiEnums.RIGHT:
                        end_offset_x = 1;
                        break;
                    case NodiEnums.UP:
                        end_offset_y = -1;
                        break;
                    case NodiEnums.DOWN:
                        end_offset_y = 1;
                        break;
                }
                var l = 15;
                ctx.lineTo(
                    a[0] + start_offset_x * l,
                    a[1] + start_offset_y * l + offsety
                );
                ctx.lineTo(
                    b[0] + end_offset_x * l,
                    b[1] + end_offset_y * l + offsety
                );
                ctx.lineTo(b[0], b[1] + offsety);
            } else if (canvas.links_render_mode == NodiEnums.STRAIGHT_LINK) {
                ctx.moveTo(a[0], a[1]);
                var start_x = a[0];
                var start_y = a[1];
                var end_x = b[0];
                var end_y = b[1];
                let originType = "";
                let targetType = "";
                if (link) {
                    originType = canvas.graph._nodes_by_id[link.target_id]?.constructor.type;
                    targetType = canvas.graph._nodes_by_id[link.origin_id]?.constructor.type;
                }
                if (targetType != "control/junction") {
                    if (start_dir == NodiEnums.RIGHT) {
                        start_x += 32;
                    } else {
                        start_y += 32;
                    }
                }
                if (originType != "control/junction") {
                    if (end_dir == NodiEnums.LEFT) {
                        end_x -= 32;
                    } else {
                        end_y -= 32;
                    }
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
            } else {
                return;
            } //unknown
        }

        //rendering the outline of the connection can be a little bit slow
        if (canvas.render_connections_border &&
            canvas.ds.scale > 0.6 &&
            !skip_border) {
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.stroke();
        }

        ctx.lineWidth = canvas.connections_width;
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.stroke();
        //end line shape
        var pos = canvas.computeConnectionPoint([start_x, start_y], [end_x, end_y], 0.5, start_dir, end_dir, link);
        if (link && link._pos) {
            link._pos[0] = pos[0];
            link._pos[1] = pos[1];
        }

        //render arrow in the middle
        if (canvas.ds.scale >= 0.6 && canvas.highquality_render && end_dir != NodiEnums.CENTER) {
            //render arrow
            if (canvas.render_connection_arrows) {
                //compute two points in the connection
                var posA = canvas.computeConnectionPoint(a, b, 0.25, start_dir, end_dir);
                var posB = canvas.computeConnectionPoint(a, b, 0.26, start_dir, end_dir);
                var posC = canvas.computeConnectionPoint(a, b, 0.75, start_dir, end_dir);
                var posD = canvas.computeConnectionPoint(a, b, 0.76, start_dir, end_dir);

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


            //selection
            /*
            if (this.selected) {
                ctx.fillStyle = "#000";

                ctx.beginPath();
                ctx.arc(pos[0], pos[1], 5, 0, Math.PI * 2);
                ctx.fill();
            }*/
        }

    }
}