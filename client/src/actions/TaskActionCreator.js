"use strict";

import * as async from "async";

import * as hasValue from "../utils/hasValue";

import * as AppDispatcher from "../AppDispatcher";
import * as TaskStore from "../stores/TaskStore";
import * as TagStore from "../stores/TagStore";
import {ActionTypes, Options} from "../constants/AppConstants";
import * as XHRUtils from "../utils/XHRUtils";
import * as TaskUtil from "../utils/TaskUtil";

export function createTask(content, previousTask) {
    const tasks = TaskStore.getAll();

    let nextIndex;
    if(hasValue(previousTask)) {
        nextIndex = tasks.indexOf(previousTask) + 1;
    }
    else {
        nextIndex = 0;
    }

    const nextTask = tasks[nextIndex];
    const orderInfos = TaskUtil.getNewOrder(previousTask, nextTask);
    const order = orderInfos.order;
    const step = orderInfos.step;

    const rawTask = {
        cid: TaskStore.getNextCid(),
        description: content,
        order: order,
        tags: TaskUtil.extractTags(content)
    };

    AppDispatcher.handleViewAction({
        type: ActionTypes.CREATE_TASK,
        value: {nextIndex: nextIndex, rawTask: rawTask}
    });

    XHRUtils.create(rawTask, function(error, task) {
        // TODO: handle error.
        //updates with task id.
        const changes = {
            id: task.id,
            creationDate: task.creationDate,
            completionDate: task.completionDate
        };
        const cid = rawTask.cid;

        AppDispatcher.handleViewAction({
            type: ActionTypes.UPDATE_TASK,
            value: {cid: cid, changes: changes}
        });

        // Reindexes if step is too small.
        if(step <= Options.MIN_STEP) {
            reindexTasks();
        }
    });
}

export function moveUp(task) {
    const selectedTags = TagStore.getSelected();
    const tasks = TaskStore.getAll();
    const subCollection = TaskStore.getByTags(selectedTags);

    /* we want to move up to the previous model in the base collection
     so we need to know where is it then make get the new order. */
    const previousIndexInSubCollection = subCollection.indexOf(task) - 1;
    const previous = subCollection[previousIndexInSubCollection];
    const previousIndex = tasks.indexOf(previous);
    const previousOfPrevious = tasks[previousIndex - 1] || null;

    if(previousIndex >= 0) {
        const orderInfos = TaskUtil.getNewOrder(previousOfPrevious, previous);
        const order = orderInfos.order;
        const step = orderInfos.step;
        const changedPiece = [task, previous];

        const changes = {order: order};
        const cid = task.cid;
        AppDispatcher.handleViewAction({
            type: ActionTypes.UPDATE_TASK,
            value: {cid: cid, changes: changes}
        });

        AppDispatcher.handleViewAction({
            type: ActionTypes.REORDER_TASK,
            value: {
                task: task,
                changedPiece: changedPiece,
                index: previousIndex,
                oldIndex: tasks.indexOf(task)
            }
        });

        XHRUtils.update(task.id, changes, function(err) {
            if(hasValue(err)) {
                //console.log(err);
            }

            // Reindexes if step is too small.
            if(step <= Options.MIN_STEP) {
                reindexTasks();
            }
        });
    }
}

export function moveDown(task) {
    const selectedTags = TagStore.getSelected();
    const tasks = TaskStore.getAll();
    const subCollection = TaskStore.getByTags(selectedTags);

    /* we want to move up to the next model in the base collection
     so we need to know where is it then make get the new order. */
    const nextIndexInSubCollection = subCollection.indexOf(task) + 1;
    const next = subCollection[nextIndexInSubCollection];
    const nextIndex = tasks.indexOf(next);
    const nextOfNext = tasks[nextIndex + 1] || null;

    // if not last item of the collection
    const lastItemOfCollection =
        nextIndex === tasks.length ||
        nextIndexInSubCollection === subCollection.length;

    if(!lastItemOfCollection) {
        const orderInfos = TaskUtil.getNewOrder(next, nextOfNext);
        const order = orderInfos.order;
        const step = orderInfos.step;
        const changedPiece = [next, task];

        const changes = {order: order};
        const cid = task.cid;
        AppDispatcher.handleViewAction({
            type: ActionTypes.UPDATE_TASK,
            value: {cid: cid, changes: changes}
        });

        AppDispatcher.handleViewAction({
            type: ActionTypes.REORDER_TASK,
            value: {
                task: task,
                changedPiece: changedPiece,
                index: nextIndex,
                oldIndex: tasks.indexOf(task)
            }
        });

        XHRUtils.update(task.id, changes, function() {
            // Reindexes if step is too small.
            if(step <= Options.MIN_STEP) {
                reindexTasks();
            }
        });
    }
}

export function editTask(task, newContent) {
    const changes = {
        description: newContent,
        tags: TaskUtil.extractTags(newContent)
    };
    const cid = task.cid;
    AppDispatcher.handleViewAction({
        type: ActionTypes.UPDATE_TASK,
        value: {cid: cid, changes: changes}
    });

    XHRUtils.update(task.id, changes, function() {

    });
}

export function toggleState(task, isDone) {
    let completionDate = null;
    if(isDone) {
        completionDate = Date.now();
    }

    const changes = {done: isDone, completionDate: completionDate};
    const cid = task.cid;
    AppDispatcher.handleViewAction({
        type: ActionTypes.UPDATE_TASK,
        value: {cid: cid, changes: changes}
    });

    XHRUtils.update(task.id, changes, function() {});
}

export function removeTask(task) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.REMOVE_TASK,
        value: task
    });

    XHRUtils.remove(task.id, function() {});
}

export function setArchiveMode(isArchived) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.SET_ARCHIVED_MODE,
        value: isArchived
    });
}

export function setSearchQuery(searchQuery) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.SET_SEARCH_QUERY,
        value: searchQuery
    });
}

export function archiveTasks(tasks) {
    async.eachLimit(tasks, 5, function(task, callback) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.ARCHIVE_TASK,
            value: task.cid
        });
        const payload = {
            isArchived: true,
            completionDate: Date.now()
        };
        XHRUtils.update(task.id, payload, callback);
    }, function() {});
}

export function restoreTask(task) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.RESTORE_TASK,
        value: task.cid
    });
    const payload = {
        isArchived: false,
        done: false,
        completionDate: null
    };
    XHRUtils.update(task.id, payload, function() {});
}

export function reindexTasks() {
    AppDispatcher.handleViewAction({
        type: ActionTypes.SET_REINDEX_STATE,
        value: true
    });
    XHRUtils.reindex(function() {

        location.reload();

        AppDispatcher.handleViewAction({
            type: ActionTypes.SET_REINDEX_STATE,
            value: false
        });
    });
}
