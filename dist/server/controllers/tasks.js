'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.reindexationMiddleware = reindexationMiddleware;
exports.create = create;
exports.fetch = fetch;
exports.update = update;
exports.remove = remove;
exports.reindex = reindex;

var _hasValue = require('../hasValue');

var _hasValue2 = _interopRequireDefault(_hasValue);

var _reindexer = require('../lib/reindexer');

var _tasky = require('../models/tasky');

var _tasky2 = _interopRequireDefault(_tasky);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function reindexationMiddleware(req, res, next) {
    if ((0, _reindexer.isReindexing)()) {
        var error = new Error('reindexation is occuring, retry later');
        error.status = 400;
        next(error);
    } else {
        next();
    }
}

function create(req, res, next) {
    _tasky2.default.create(req.body, function (err, task) {
        if ((0, _hasValue2.default)(err)) {
            var message = 'An error occured while creating a task -- ' + err;
            var error = new Error(message);
            next(error);
        } else {
            res.status(201).json(task);
        }
    });
}

function fetch(req, res, next, id) {
    _tasky2.default.find(id, function (err, task) {
        if ((0, _hasValue2.default)(err) || !(0, _hasValue2.default)(task)) {
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
        if ((0, _hasValue2.default)(err)) {
            var message = 'An error occured while updating a task -- ' + err;
            var error = new Error(message);
            next(error);
        } else {
            res.status(200).json(task);
        }
    });
}

function remove(req, res, next) {
    req.task.destroy(function (err) {
        if ((0, _hasValue2.default)(err)) {
            var message = 'An error occured while deleting a task -- ' + err;
            var error = new Error(message);
            next(error);
        } else {
            res.sendStatus(204);
        }
    });
}

function reindex(req, res, next) {
    (0, _reindexer.processIndexation)(function (err, tasks) {
        if ((0, _hasValue2.default)(err)) {
            var error = new Error(err);
            next(error);
        } else {
            res.status(200).json(tasks);
        }
    });
}