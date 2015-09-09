// See documentation on https://github.com/frankrousseau/americano#routes.
"use strict";

import * as index from "./index";
import * as tasks from "./tasks";
import * as tags from "./tags";

export const routes = {
    "": {
        get: index.main
    },

    "tasks": {
        get: tasks.all,
        post: [tasks.reindexationMiddleware, tasks.create]
    },

    "taskID": {
        param: tasks.fetch
    },

    "tasks/:taskID": {
        put: [tasks.reindexationMiddleware, tasks.update],
        delete: tasks.delete
    },

    "tasks/reindex": {
        post: tasks.reindex
    },

    "tags": {
        post: tags.create,
        delete: tags.delete
    }
};
