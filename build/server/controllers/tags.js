'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.create = create;
exports.remove = remove;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _modelsFavorite_tag = require('../models/favorite_tag');

var _modelsFavorite_tag2 = _interopRequireDefault(_modelsFavorite_tag);

var _hasValue = require('../hasValue');

var _hasValue2 = _interopRequireDefault(_hasValue);

var debug = (0, _debug2['default'])('app:controller:tags');

function create(req, res, next) {
    var label = req.body.label;

    debug('Set a tag as favorite.');
    _modelsFavorite_tag2['default'].byLabelForTasky(label, function (err, tags) {
        if ((0, _hasValue2['default'])(err) || (0, _hasValue2['default'])(tags) && tags.length > 0) {
            var error = err || 'tag is already favorite';
            next(error);
        } else {
            (function () {
                debug('Persist the tag "' + label + '" as favorite.');
                var payload = { label: label, application: 'tasky' };
                _modelsFavorite_tag2['default'].create(payload, function (error) {
                    if ((0, _hasValue2['default'])(error)) {
                        next(error);
                    } else {
                        res.status(201).json(payload);
                    }
                });
            })();
        }
    });
}

function remove(req, res, next) {
    var label = req.body.label;

    debug('Unset a tag as favorite.');
    _modelsFavorite_tag2['default'].byLabelForTasky(label, function (err, tags) {
        if ((0, _hasValue2['default'])(err) || (0, _hasValue2['default'])(tags) && tags.length === 0) {
            var error = new Error(err || 'tag is not favorite');
            next(error);
        } else {
            debug('Remove the document.');
            _async2['default'].eachSeries(tags, function (tag, done) {
                tag.destroy(done);
            }, function (err2) {
                if ((0, _hasValue2['default'])(err2)) {
                    var error = new Error(err2);
                    next(error);
                } else {
                    res.status(204).send();
                }
            });
        }
    });
}