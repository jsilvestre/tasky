'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.reindexationMiddleware = reindexationMiddleware;
exports.create = create;
exports.fetch = fetch;
exports.update = update;
exports.remove = remove;
exports.reindex = reindex;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _hasValue = require('../hasValue');

var _hasValue2 = _interopRequireDefault(_hasValue);

var _libReindexer = require('../lib/reindexer');

var _modelsTasky = require('../models/tasky');

var _modelsTasky2 = _interopRequireDefault(_modelsTasky);

function reindexationMiddleware(req, res, next) {
    if ((0, _libReindexer.isReindexing)()) {
        var error = new Error('reindexation is occuring, retry later');
        error.status = 400;
        next(error);
    } else {
        next();
    }
}

function create(req, res, next) {
    _modelsTasky2['default'].create(req.body, function (err, task) {
        if ((0, _hasValue2['default'])(err)) {
            var message = 'An error occured while creating a task -- ' + err;
            var error = new Error(message);
            next(error);
        } else {
            res.status(201).json(task);
        }
    });
}

function fetch(req, res, next, id) {
    _modelsTasky2['default'].find(id, function (err, task) {
        if ((0, _hasValue2['default'])(err) || !(0, _hasValue2['default'])(task)) {
            var error = new Error('Task not found');
            error.status = 404;
            next(error);
        } else {
            req.task = task;
            next();
        }
    });
}

function update(req, res, next) {
    req.task.updateAttributes(req.body, function (err, task) {
        if ((0, _hasValue2['default'])(err)) {
            var message = 'An error occured while updating a task -- ' + err;
            var error = new Error(message);
            next(error);
        } else {
            res.status(200).json(task);
        }
    });
}

function remove(req, res) {
    req.task.destroy(function (err) {
        if ((0, _hasValue2['default'])(err)) {
            var message = 'An error occured while deleting a task -- ' + err;
            var error = new Error(message);
            next(error);
        } else {
            res.sendStatus(204);
        }
    });
}

function reindex(req, res) {
    (0, _libReindexer.processIndexation)(function (err, tasks) {
        if ((0, _hasValue2['default'])(err)) {
            var error = new Error(err);
            next(error);
        } else {
            res.status(200).json(tasks);
        }
    });
}