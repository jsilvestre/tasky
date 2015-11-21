'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _index = require('./index');

var index = _interopRequireWildcard(_index);

var _tasks = require('./tasks');

var tasks = _interopRequireWildcard(_tasks);

var _tags = require('./tags');

var tags = _interopRequireWildcard(_tags);

exports['default'] = {
    '': {
        get: index.main
    },

    'tasks': {
        post: [tasks.reindexationMiddleware, tasks.create]
    },

    'taskID': {
        param: tasks.fetch
    },

    'tasks/:taskID': {
        put: [tasks.reindexationMiddleware, tasks.update],
        'delete': tasks.remove
    },

    'tasks/reindex': {
        post: tasks.reindex
    },

    'tags': {
        post: tags.create,
        'delete': tags.remove
    }
};
module.exports = exports['default'];