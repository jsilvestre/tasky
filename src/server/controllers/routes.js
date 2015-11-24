import * as index from './index';
import * as tasks from './tasks';
import * as tags from './tags';

module.exports = {
    '': {
        get: index.main,
    },

    'tasks': {
        post: [tasks.reindexationMiddleware, tasks.create],
    },

    'taskID': {
        param: tasks.fetch,
    },

    'tasks/:taskID': {
        put: [tasks.reindexationMiddleware, tasks.update],
        delete: tasks.remove,
    },

    'tasks/reindex': {
        post: tasks.reindex,
    },

    'tags': {
        post: tags.create,
        delete: tags.remove,
    },
};
