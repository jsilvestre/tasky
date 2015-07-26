"use strict";

import * as _ from "underscore";

import * as Store from "../libs/flux/store/Store";
import * as hasValue from "../utils/hasValue";

import TaskUtils from "../utils/TaskUtil";
import {ActionTypes} from "../constants/AppConstants";

/* `cid`s are internal client IDs to identify a model even if
   it has not an ID in the database yet. Not persisted. */
let _cid = 0;
let _archivedMode = false;
let _archivedTasks = window.archivedTasks;
let _tasks = window.tasks;
let _searchQuery = null;
let _isReindexing = false;
let _cache = {};

let tempTask, ite;

// TODO: retrieve the tasks sorted server-side
_archivedTasks.sort((a, b) => {
    if(a.completionDate > b.completionDate) {
        return 1;
    }
    else if(a.completionDate < b.completionDate) {
        return -1;
    }
    else {
        return 0;
    }
});

_tasks.sort((a, b) => {
    if(a.order > b.order) {
        return 1;
    }
    else if(a.order < b.order) {
        return -1;
    }
    else {
        return 0;
    }
});

let _tasksByCid = {};
for(ite = 0; ite < _tasks.length; ite++) {
    tempTask = _tasks[ite];
    tempTask.cid = _cid++;
    _tasksByCid[tempTask.cid] = tempTask;
}

let _archivedTasksByCid = {};
for(tempTask in _archivedTasks) {
    tempTask.cid = _cid++;
    _archivedTasksByCid[tempTask.cid] = tempTask;
}

function _getTaskLists() {
    let tasksList, tasksListByCid;
    if(_archivedMode) {
        tasksList = _archivedTasks;
        tasksListByCid = _archivedTasksByCid;
    }
    else {
        tasksList = _tasks;
        tasksListByCid = _tasksByCid;
    }

    return {tasksList: tasksList, tasksListByCid: tasksListByCid};
}

// Invalid all cached lists if they contain the task
function _invalidCache(task) {
    const tags = task.tags;
    const cacheKeys = Object.keys(_cache);
    let i, cacheKey;
    for(cacheKey in cacheKeys) {
        i = 0;
        while(i < tags.length && cacheKey.indexOf(tags[i]) === -1) {
            i++;
        }

        // invalidate the cache if the task is in it
        if(cacheKey.indexOf(tags[i]) !== -1) {
            delete _cache[cacheKey];
        }
    }
}

class TaskStore extends Store {

    __bindHandlers(handle) {
        handle(ActionTypes.CREATE_TASK, payload => {
            const nextIndex = payload.nextIndex;
            const rawTask = payload.rawTask;

            // insert rawTask at index nextIndex.
            _tasks.splice(nextIndex, 0, rawTask);

            // adds the task to the cid index.
            _tasksByCid[rawTask.cid] = rawTask;

            // invalid cache.
            _invalidCache(rawTask);

            this.emit("change");
        });

        handle(ActionTypes.REMOVE_TASK, task => {
            const lists = _getTaskLists();
            const tasksList = lists.tasksList;
            const tasksListByCid = lists.tasksListByCid;

            const index = tasksList.indexOf(task);
            tasksList.splice(index, 1);

            // removes task from cid index
            delete tasksListByCid[task.cid];

            // invalid cache
            _invalidCache(task);

            this.emit("change");
        });

        handle(ActionTypes.UPDATE_TASK, payload => {
            const tasksListByCid = _getTaskLists().tasksListByCid;

            const cid = payload.cid;
            const changes = payload.changes;

            const task = tasksListByCid[cid];

            // invalid cache
            _invalidCache(task);

            let field, value;
            for(field in Object.keys(changes)) {
                value = changes[field];
                task[field] = value;
            }

            // invalid cache if the tags have changed
            if(hasValue(changes.tags)) {
                _invalidCache(task);
            }

            this.emit("change");
        });

        handle(ActionTypes.REORDER_TASK, payload => {
            const tasksList = _getTaskLists().tasksList;

            let index = payload.index;
            const oldIndex = payload.oldIndex;
            const task = payload.task;

            index = Math.max(index, 0);

            /// No need to sort the list, just insert at the right spot
            tasksList.splice(oldIndex, 1);
            tasksList.splice(index, 0, task);

            // invalid cache
            _invalidCache(task);

            this.emit("change");
        });

        handle(ActionTypes.SET_ARCHIVED_MODE, isArchived => {
            _archivedMode = isArchived;
            this.emit("change");
        });

        handle(ActionTypes.SET_SEARCH_QUERY, searchQuery => {
            _searchQuery = searchQuery;
            this.emit("change");
        });

        handle(ActionTypes.ARCHIVE_TASK, cid => {
            const task = _tasksByCid[cid];

            if(hasValue(task)) {
                // removes from list of tasks to do
                let index = _tasks.indexOf(task);
                delete _tasksByCid[cid];
                _tasks.splice(index, 1);

                // changes boolean indicator
                task.isArchived = true;

                // adds to the archived list of tasks
                _archivedTasksByCid[cid] = task;
                index = _.sortedIndex(_archivedTasks, task,
                    temp => -(new Date(temp.completionDate).getTime()));
                _archivedTasks.splice(index, 0, task);

                // invalid cache
                _invalidCache(task);

                this.emit("change");
            }
        });

        handle(ActionTypes.RESTORE_TASK, cid => {
            const task = _archivedTasksByCid[cid];

            if(hasValue(task)) {
                // removes from list of archived tasks
                let index = _archivedTasks.indexOf(task);
                delete _archivedTasksByCid[cid];
                _archivedTasks.splice(index, 1);

                // changes boolean indicator
                task.isArchived = false;
                task.done = false;

                // adds to the list of tasks to do
                _tasksByCid[cid] = task;
                index = _.sortedIndex(_tasks, task, temp => temp.order);
                _tasks.splice(index, 0, task);

                // invalid cache
                _invalidCache(task);

                this.emit("change");
            }
        });

        handle(ActionTypes.SET_REINDEX_STATE, isReindexing => {
            _isReindexing = isReindexing;
            this.emit("change");
        });
    }

    getAll() {
        return _getTaskLists().tasksList;
    }

    getUntagged() {
        const tasksList = _getTaskLists().tasksList;
        return tasksList.filter(task => task.tags.length === 0);
    }

    getByTags(tags) {
        const tasksList = _getTaskLists().tasksList;

        // returns all unselected tags if the tag filter is empty
        if(hasValue(tags) && tags.length === 0) {
            return tasksList.filter(task => task.tags.length === 0);
        }

        // filter by tag
        else {
            let filteredTasksList = tasksList;

            if(hasValue(tags)) {
                const mapValue = function mapValue(tag) {
                    return tag.label;
                };
                const includedTags = tags
                    .filter(tag => !tag.isExcluded)
                    .map(mapValue);
                const noInclusion = includedTags.length === 0;

                const excludedTags = tags
                    .filter(tag => tag.isExcluded)
                    .map(mapValue);

                // the cache key is a unique hash based on tag selection
                const cacheKey = [].concat(tags) // clone the tags

                    /* Sort the tag list so the cache is stable. I.e. cache
                       is the same for tag1/tag2 and tag2/tag1 */
                    .sort((a, b) => {
                        if(a.label > b.label) {
                            return 1;
                        }
                        else if(a.label > b.label) {
                            return -1;
                        }
                        else {
                            return 0;
                        }
                    })

                    /* lists are different if they have the same tags but
                       some of them are included and others are excluded */
                    .map(tag => {
                        const prefix = tag.isExcluded ? "!" : "";
                        return `${prefix}${tag.label}`;
                    })

                    /* '#' is the safest separator because it's used to mark
                       the beginning of a tag. */
                    .join("#");

                const cachedList = _cache[cacheKey];
                if(hasValue(cachedList)) {
                    filteredTasksList = cachedList;
                }
                else {
                    /* When there are no included tags, it means all tasks
                       should be selected. */
                    filteredTasksList = filteredTasksList.filter(task => {
                        return (TaskUtils.containsTags(task, includedTags)
                            || noInclusion) &&
                            TaskUtils.doesntContainsTags(task,
                                                         excludedTags);
                    });

                    // add in cache
                    _cache[cacheKey] = filteredTasksList;
                }
            }

            if(hasValue(_searchQuery)) {
                const regex = new RegExp(_searchQuery, "i");
                filteredTasksList = filteredTasksList.filter(task => {
                    regex.test(task.description);
                });
            }

            return filteredTasksList;
        }
    }

    getNextCid() { return _cid++; }

    isArchivedMode() { return _archivedMode; }

    getNumTasks() { return _tasks.length; }
    getNumArchivedTasks() { return _archivedTasks.length; }

    getSearchQuery() { return _searchQuery; }

    isReindexing() { return _isReindexing; }
}

export const singleton = new TaskStore();

/*
    # Creates an OrderedMap of tasks
    ###
    _tasks = Immutable.Sequence window.tasks

        # sets task ID as index
        .mapKeys (_, task) -> return task.id

        # makes task object an immutable Map
        .map (task) -> Immutable.fromJS task

        .toOrderedMap()
    ###
*/