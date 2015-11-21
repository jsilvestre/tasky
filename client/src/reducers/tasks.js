import _ from 'underscore';

import {
    CREATE_TASK_REQUEST, CREATE_TASK_SUCCESS, CREATE_TASK_ERROR,
    REMOVE_TASK, EDIT_TASK, REORDER_TASK,
    ARCHIVE_TASK, RESTORE_TASK,
    SET_ARCHIVE_MODE, SET_SEARCH_QUERY, SET_REINDEX_STATE,
} from '../actions/TaskActionCreator';

function findByCid(cid) {
    return (task) => cid === task.cid;
}

function archivedTasksComparator(task) {
    return -(new Date(task.completionDate).getTime());
}

function tasksComparator(task) {
    return task.order;
}

function createTask(tasks, payload) {
    const {nextIndex, task} = payload;
    const result = [].concat(tasks);
    result.splice(nextIndex, 0, task);
    return result;
}

function removeTask(tasks, task) {
    const index = tasks.findIndex(findByCid(task.cid));
    const result = [].concat(tasks);
    result.splice(index, 1);
    return result;
}

function updateTask(tasks, payload) {
    const {cid, changes} = payload;
    const index = tasks.findIndex(findByCid(cid));
    const task = tasks[index];

    let field;
    let value;
    for (field of Object.keys(changes)) {
        value = changes[field];
        task[field] = value;
    }

    const result = [].concat(tasks);
    result[index] = task;
    return result;
}

function reorderTask(tasks, payload) {
    const {oldIndex, task} = payload;
    let index = payload.index;
    index = Math.max(index, 0);

    // No need to sort the list, just insert at the right spot
    const result = [].concat(tasks);
    result.splice(oldIndex, 1);
    result.splice(index, 0, task);

    return result;
}


function archiveTask(tasks, archivedTasks, cid) {
    const index = tasks.findIndex(findByCid(cid));
    const results = {
        tasks: [].concat(tasks),
        archivedTasks: [].concat(archivedTasks),
    };

    if (index !== -1) {
        const task = tasks[index];

        // Remove from list of tasks to do.
        results.tasks.splice(index, 1);

        // Change boolean flag.
        task.isArchived = true;

        // Add to the archived list of tasks.
        const newIndex = _.sortedIndex(results.archivedTasks, task,
                                       archivedTasksComparator);
        results.archivedTasks.splice(newIndex, 0, task);
    }

    return results;
}

function restoreTask(tasks, archivedTasks, cid) {
    const index = archivedTasks.findIndex(findByCid(cid));
    const results = {
        tasks: [].concat(tasks),
        archivedTasks: [].concat(archivedTasks),
    };

    if (index !== -1) {
        const task = tasks[index];

        // Remove from list of archived tasks.
        results.archivedTasks.splice(index, 1);

        // Change boolean flag.
        task.isArchived = false;

        // Reset task's done state.
        task.done = false;

        // Add to the list of tasks to do.
        const newIndex = _.sortedIndex(results.tasks, task, tasksComparator);
        results.tasks.splice(newIndex, 0, task);
    }

    return results;
}

export default function todoReducer(state = {}, action) {
    switch (action.type) {
        case CREATE_TASK_REQUEST:
            return _.extend({}, state, {cid: action.rawTask.cid});

        case CREATE_TASK_SUCCESS:
            return _.extend({}, state, {
                tasks: createTask(state.tasks, action),
            });

        case CREATE_TASK_ERROR:
            return _.extend({}, state);

        case REMOVE_TASK:
            return _.extend({}, state, {
                tasks: removeTask(state.tasks, action.value),
            });

        case EDIT_TASK:
            return _.extend({}, state, {
                tasks: updateTask(state.tasks, action.value),
            });

        case REORDER_TASK:
            return _.extend({}, state, {
                tasks: reorderTask(state.tasks, action.value),
            });

        case ARCHIVE_TASK:
            return _.extend({}, state,
                archiveTask(state.tasks, state.archivedTasks, action.value)
            );

        case RESTORE_TASK:
            return _.extend({}, state,
                restoreTask(state.tasks, state.archivedTasks, action.value)
            );

        case SET_ARCHIVE_MODE:
            return _.extend({}, state, {isArchivedModeEnabled: action.value});

        case SET_SEARCH_QUERY:
            return _.extend({}, state, {searchQuery: action.value});

        case SET_REINDEX_STATE:
            return _.extend({}, state, {isReindexing: action.value});

        default:
            return state;
    }
}
