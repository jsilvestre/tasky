// Return true if `value` is not null nor undefined.
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = hasValue;

function hasValue(variable) {
    return variable !== null && variable !== void 0;
}

module.exports = exports["default"];