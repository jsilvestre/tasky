'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _americano = require('americano');

var _americano2 = _interopRequireDefault(_americano);

var _errorhandler = require('errorhandler');

var _errorhandler2 = _interopRequireDefault(_errorhandler);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

// Detect if it should use the precompiled jade or the raw jade.
var builtViewPath = _path2['default'].resolve(__dirname, '../client/index.js');
var viewEngine = _fs2['default'].existsSync(builtViewPath) ? 'js' : 'jade';

exports['default'] = {
    common: {
        use: [_americano2['default'].bodyParser(), _americano2['default'].methodOverride(), _americano2['default']['static'](_path2['default'].resolve(__dirname, '../client/public'), { maxAge: 86400000 })],

        set: {
            'view engine': viewEngine,
            'views': _path2['default'].resolve(__dirname, '../client/')
        },

        engine: {
            // Allow res.render of .js files (pre-rendered jade)
            js: function js(filePath, locals, callback) {
                callback(null, require(filePath)(locals));
            }
        },

        afterStart: function afterStart(app) {
            app.use((0, _errorhandler2['default'])());
        }
    },

    development: [_americano2['default'].logger('dev')],

    production: [_americano2['default'].logger('short')],

    plugins: ['cozydb']
};
module.exports = exports['default'];