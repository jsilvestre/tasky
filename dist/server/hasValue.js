"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = hasValue;
// Return true if `value` is not null nor undefined.
function hasValue(variable) {
    return variable !== null && variable !== void 0;
}