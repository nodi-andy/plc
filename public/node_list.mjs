export const basic = [
    "nodes/basic/bit.mjs",
    "nodes/basic/number.mjs",
    "nodes/basic/connector.mjs",
    //"nodes/basic/inserter.mjs",
    "nodes/basic/button.mjs",
    "nodes/basic/custom.mjs",
/*    "nodes/basic/miner.mjs",
    "nodes/basic/rocket.mjs",*/
    "nodes/time/interval.mjs",
];

export const logic = [
    "nodes/logic/and.mjs",
    "nodes/logic/or.mjs",
    "nodes/logic/xor.mjs",
    "nodes/logic/not.mjs"
]
//"./nodes/basic/custom.mjs",
//    "./nodes/basic/province.mjs",
//    "./nodes/basic/country.mjs",

export const rest = [
    "nodes/math/add.mjs",
    "nodes/math/mult.mjs",
    "nodes/math/isequal.mjs",
    "nodes/math/isless.mjs",
    "nodes/math/isgreater.mjs",
    "nodes/time/interval.mjs",
    "nodes/nodi.box/b1.js",
    "nodes/nodi.box/b2.js",
    "nodes/nodi.box/b3.js",
    "nodes/nodi.box/b4.js",
    "nodes/nodi.box/yellow.js",
    "nodes/nodi.box/green.js",
    "nodes/nodi.box/stepper.js",
    "nodes/esp32mcu/b1.js",
    "nodes/esp32mcu/bit.js",
];
    /*"nodes/network/serial.mjs",
    "nodes/network/gdrive.mjs",
    "nodes/network/gdrivefile.mjs"
    */

export const nodeList = [...basic, ...logic/*, ...rest*/];
