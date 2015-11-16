'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.isReindexing = isReindexing;
exports.processIndexation = processIndexation;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _modelsTasky = require('../models/tasky');

var _modelsTasky2 = _interopRequireDefault(_modelsTasky);

var _hasValue = require('../hasValue');

var _hasValue2 = _interopRequireDefault(_hasValue);

var debug = (0, _debug2['default'])('app:lib:reindexer');

// Act like a singleton. Not reindexing by default.
var flagReindexing = false;

function isReindexing() {
    return flagReindexing;
}

function processIndexation(callback) {
    (0, _invariant2['default'])((0, _hasValue2['default'])(callback), '`callback` is a mandatory parameter');
    (0, _invariant2['default'])(typeof callback === 'function', '`callback` must be a function');

    debug('Start reindexation process.');

    debug('Mark the server as being reindexing.');
    flagReindexing = true;

    debug('Retrieve all tasks.');
    _modelsTasky2['default'].allInInterval({}, function (err, tasks) {
        if ((0, _hasValue2['default'])(err)) {
            callback(err);
        } else {
            (function () {
                debug('Compute constants to perform the reindexation.');
                var minOrder = 0;
                var maxOrder = Number.MAX_VALUE;
                var numTasks = tasks.length;
                var step = (maxOrder - minOrder) / (numTasks + 1);

                _async2['default'].mapSeries(tasks, function (task, next) {
                    var id = task.id;
                    var order = minOrder + (tasks.indexOf(task) + 1) * step;
                    task.updateAttributes({ order: order }, function (err2) {
                        if ((0, _hasValue2['default'])(err2)) {
                            debug(err2);
                        }
                        next(null, { id: id, order: order });
                    });
                }, function (err2, updatedTasks) {
                    if ((0, _hasValue2['default'])(err2)) {
                        var msg = 'Something went wrong while reindexing tasks\n                                 -- ' + err2;
                        debug(msg);
                    } else {
                        debug('Tasks have been successfully reindexed');
                    }

                    debug('Reset the server\'s state.');
                    flagReindexing = false;
                    callback(err, updatedTasks);
                });
            })();
        }
    });
}