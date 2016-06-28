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

var debug = (0, _debug2.default)('app:model:favorite_tag');

var FavoriteTag = _cozydb2.default.getModel('FavoriteTag', {
    'label': String,
    'application': String
});

module.exports = FavoriteTag;

FavoriteTag.allForTasky = function (callback) {
    (0, _invariant2.default)((0, _hasValue2.default)(callback), '`callback` is a mandatory parameter');
    (0, _invariant2.default)(typeof callback === 'function', '`callback` must be a function');

    debug('Retrieve all favorite tag for app Tasky.');
    FavoriteTag.request('allByApp', { key: 'tasky' }, function (err, tags) {
        var error = err || tags.error;
        if ((0, _hasValue2.default)(error)) {
            callback(error);
        } else {
            var labels = tags.map(function (tag) {
                return tag.label;
            });
            callback(null, labels);
        }
    });
};

FavoriteTag.byLabelForTasky = function (label, callback) {
    (0, _invariant2.default)((0, _hasValue2.default)(label), '`label` is a mandatory parameter');
    (0, _invariant2.default)((0, _hasValue2.default)(callback), '`callback` is a mandatory parameter');
    (0, _invariant2.default)(typeof label === 'string', '`label` must be a string');
    (0, _invariant2.default)(typeof callback === 'function', '`callback` must be a function');

    debug('Retrieve a favorite tag given a label, for app Tasky.');
    var options = {
        key: ['tasky', label]
    };
    FavoriteTag.request('byAppByLabel', options, callback);
};