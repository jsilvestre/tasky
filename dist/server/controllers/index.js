'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.main = main;

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _cozydb = require('cozydb');

var _cozydb2 = _interopRequireDefault(_cozydb);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _favorite_tag = require('../models/favorite_tag');

var _favorite_tag2 = _interopRequireDefault(_favorite_tag);

var _hasValue = require('../hasValue');

var _hasValue2 = _interopRequireDefault(_hasValue);

var _tasky = require('../models/tasky');

var _tasky2 = _interopRequireDefault(_tasky);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('app:controller:main');

function main(req, res, next) {
    debug('Retrieve data to build HTML.');

    _async2.default.parallel({
        tasks: function tasks(done) {
            _tasky2.default.allNotArchived(done);
        },
        archivedTasks: function archivedTasks(done) {
            _tasky2.default.allArchived(done);
        },
        locale: function locale(done) {
            _cozydb2.default.api.getCozyLocale(done);
        },
        favoriteTags: function favoriteTags(done) {
            _favorite_tag2.default.allForTasky(done);
        }
    }, function (err, results) {
        if ((0, _hasValue2.default)(err)) {
            debug('Some data have not been retrieved due to an unexpected ' + 'error.');
            next(err);
        } else {
            (function () {
                (0, _invariant2.default)((0, _hasValue2.default)(results.tasks), '`tasks` is a mandatory ' + 'property');
                (0, _invariant2.default)((0, _hasValue2.default)(results.archivedTasks), '`archivedTasks` is a ' + 'mandatory property');
                (0, _invariant2.default)((0, _hasValue2.default)(results.locale), '`locale` is a mandatory ' + 'property');
                (0, _invariant2.default)((0, _hasValue2.default)(results.favoriteTags), '`favoriteTags` is a ' + 'mandatory property');
                debug('Data have been retrieved.');

                var tasks = results.tasks;
                var archivedTasks = results.archivedTasks;
                var locale = results.locale;
                var favoriteTags = results.favoriteTags;

                debug('Build unserialized properties (cid) into data model.');
                var cid = 0;
                tasks = tasks.map(function (task) {
                    task.cid = cid++;
                    return task;
                });

                archivedTasks = archivedTasks.map(function (task) {
                    task.cid = cid++;
                    return task;
                });

                debug('Render template with data.');
                try {
                    var imports = '\n                    window.locale = "' + locale + '";\n                    window.tasks = ' + JSON.stringify(tasks) + ';\n                    window.archivedTasks = ' + JSON.stringify(archivedTasks) + ';\n                    window.favoriteTags = ' + JSON.stringify(favoriteTags) + ';\n                    window.cid = ' + cid + ';\n                ';
                    res.render('index', { imports: imports });
                } catch (error) {
                    next(error);
                }
            })();
        }
    });
}