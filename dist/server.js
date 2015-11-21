'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _americano = require('americano');

var _americano2 = _interopRequireDefault(_americano);

// Define the function to boot the application's HTTP server.
var boot = function boot(callback) {
    var options = {
        name: 'tasky',
        root: __dirname,
        port: process.env.PORT || 9250,
        host: process.env.HOST || '127.0.0.1'
    };

    _americano2['default'].start(options, callback);
};

exports.boot = boot;
/*
 If it's not loaded from another module (i.e. not loaded from tests), it's
 executed so the application actually starts.
*/
if (!module.parent) {
    boot();
}
