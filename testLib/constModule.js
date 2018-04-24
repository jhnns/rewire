const j = "j"; // At the beginning of the file
// This module contains some weird combinations where valid const declarations could appear.
// Syntax oddities are totally on purpose here.
const a = require("./someOtherModule");const b = "b"; const e = "e"
const c = "c";
{}const d = "d";
 const f = "f"; // there's an irregular whitespace before and after const
const
g = "g";
const/*wtf this is valid*/h = "h";
const /*and this is also*/i = "i";
const{k} = {k: "k"};

exports.a = function () {
    return a;
};
exports.b = function () {
    return b;
};
exports.c = function () {
    return c;
};
exports.d = function () {
    return d;
};
exports.e = function () {
    return e;
};
exports.f = function () {
    return f;
};
exports.g = function () {
    return g;
};
exports.h = function () {
    return h;
};
exports.i = function () {
    return i;
};
exports.j = function () {
    return j;
};
exports.k = function () {
    return k;
};
