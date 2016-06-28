'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.boot = undefined;

var _americano = require('americano');

var _americano2 = _interopRequireDefault(_americano);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Define the function to boot the application's HTTP server.
var boot = exports.boot = function boot(callback) {
    var options = {
        name: 'tasky',
        root: __dirname,
        port: process.env.PORT || 9250,
        host: process.env.HOST || '127.0.0.1'
    };

    _americano2.default.start(options, callback);
};

/*
 If it's not loaded from another module (i.e. not loaded from tests), it's
 executed so the application actually starts.
*/
if (!module.parent) {
    boot();
}
