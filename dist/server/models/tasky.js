'use strict';

var _cozydb = require('cozydb');

var _cozydb2 = _interopRequireDefault(_cozydb);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _hasValue = require('../hasValue');

var _hasValue2 = _interopRequireDefault(_hasValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var debug = (0, _debug2.default)('app:model:tasky');

var Task = _cozydb2.default.getModel('Tasky', {
    'done': {
        default: false,
        type: Boolean
    },
    'creationDate': {
        type: Date
    },
    'completionDate': {
        default: null,
        type: Date
    },
    'description': {
        default: '',
        type: String
    },
    'order': {
        type: Number
    },
    'tags': {
        default: [],
        type: [String]
    },
    'isArchived': {
        default: false,
        type: Boolean
    }
});

module.exports = Task;

Task.all = function (callback) {
    (0, _invariant2.default)((0, _hasValue2.default)(callback), '`callback` is a mandatory parameter');
    (0, _invariant2.default)(typeof callback === 'function', '`callback` must be a function');

    debug('Retrieve all tasks.');
    Task.request('all', {}, function (err, tasks) {
        var error = err || tasks.error;
        callback(error, tasks);
    });
};

Task.allInInterval = function (options, callback) {
    (0, _invariant2.default)((0, _hasValue2.default)(options), '`options` is a mandatory parameter');
    (0, _invariant2.default)((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object', '`callback` must be an object');
    (0, _invariant2.default)((0, _hasValue2.default)(callback), '`callback` is a mandatory parameter');
    (0, _invariant2.default)(typeof callback === 'function', '`callback` must be a function');

    debug('Retrieve all tasks in given interval.');
    Task.request('byOrder', options, function (err, tasks) {
        var error = err || tasks.error;
        callback(error, tasks);
    });
};

Task.allNotArchived = function (callback) {
    (0, _invariant2.default)((0, _hasValue2.default)(callback), '`callback` is a mandatory parameter');
    (0, _invariant2.default)(typeof callback === 'function', '`callback` must be a function');

    debug('Retrieve all unarchived tasks.');

    // null for backward compatibility
    var params = {
        keys: [false, null]
    };
    Task.request('byArchiveState', params, function (err, tasks) {
        var error = err || tasks.error;
        callback(error, tasks);
    });
};

Task.allArchived = function (callback) {
    (0, _invariant2.default)((0, _hasValue2.default)(callback), '`callback` is a mandatory parameter');
    (0, _invariant2.default)(typeof callback === 'function', '`callback` must be a function');

    debug('Retrieve all archived tasks.');
    var params = {
        key: true
    };
    Task.request('byArchiveState', params, function (err, tasks) {
        var error = err || tasks.error;
        callback(error, tasks);
    });
};