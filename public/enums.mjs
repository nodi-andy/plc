export const NodiEnums = {
    VERSION: 0.1,

    CANVAS_GRID_SIZE: 64,

    NODE_TITLE_HEIGHT: 24,
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


}

NodiEnums.link_type_colors = {
    "-1": NodiEnums.EVENT_LINK_COLOR,
    number: "#AAA",
    node: "#DCA"
};
//timer that works everywhere
if (typeof performance != "undefined") {
    NodiEnums.getTime = performance.now.bind(performance);
} else if (typeof Date != "undefined" && Date.now) {
    NodiEnums.getTime = Date.now.bind(Date);
} else if (typeof process != "undefined") {
    NodiEnums.getTime = function() {
        var t = process.hrtime();
        return t[0] * 0.001 + t[1] * 1e-6;
    };
} else {
    NodiEnums.getTime = function getTime() {
        return new Date().getTime();
    };
}