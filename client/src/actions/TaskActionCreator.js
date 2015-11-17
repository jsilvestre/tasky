import _ from 'underscore';
import async from 'async';
import hasValue from '../utils/hasValue';
import * as TaskUtil from '../utils/TaskUtil';
import { getNewOrder } from '../utils/TaskUtil';
import * as XHRUtils from '../utils/XHRUtils';
import {Options} from '../constants/AppConstants';

import {visibleTasksSelector} from '../selectors/TaskSelectors';

export const SET_REINDEX_STATE = 'SET_REINDEX_STATE';
export function reindexTasks() {
    return dispatch => {
        dispatch({
            type: SET_REINDEX_STATE,
            value: true,
        });
        XHRUtils.reindex(() => {
            location.reload();

            dispatch({
                type: SET_REINDEX_STATE,
                value: false,
            });
        });
    };
}

export const CREATE_TASK_REQUEST = 'CREATE_TASK_REQUEST';
export function createTask(description, previousTask) {
    return (dispatch, getState) => {
        const tasks = getState().tasks;

        let nextIndex;
        if (hasValue(previousTask)) {
            nextIndex = tasks.indexOf(previousTask) + 1;
        } else {
            nextIndex = 0;
        }

        const cid = getState().cid + 1;
        const nextTask = tasks[nextIndex];
        const {order, step} = TaskUtil.getNewOrder(previousTask, nextTask);
        const tags = TaskUtil.extractTags(description);

        const rawTask = {
            cid,
            description,
            order,
            tags,
        };

        return dispatch({
            type: CREATE_TASK_REQUEST,
            rawTask,
            step,
            nextIndex,
        });
    };
}

export const CREATE_TASK_SUCCESS = 'CREATE_TASK_SUCCESS';
export function createTaskSuccess(task, nextIndex) {
    return {
        type: CREATE_TASK_SUCCESS,
        task,
        nextIndex,
    };
}

export const CREATE_TASK_ERROR = 'CREATE_TASK_ERROR';
export function createTaskError(rawTask, error) {
    return {
        type: CREATE_TASK_ERROR,
        rawTask,
        error,
    };
}

export function persistNewTask(description, previousTask) {
    return dispatch => {
        const action = dispatch(createTask(description, previousTask));
        const {rawTask, step, nextIndex} = action;

        XHRUtils.create(rawTask, (error, task) => {
            if (hasValue(error)) {
                dispatch(createTaskError(rawTask, error));
            } else {
                const model = _.extend(rawTask, task);
                dispatch(createTaskSuccess(model, nextIndex));
            }

            // Reindex if step is too small.
            if (step <= Options.MIN_STEP) {
                reindexTasks();
            }
        });
    };
}

export const EDIT_TASK = 'EDIT_TASK';
export function editTask(task, newContent) {
    return dispatch => {
        const changes = {
            description: newContent,
            tags: TaskUtil.extractTags(newContent),
        };
        const cid = task.cid;
        dispatch({
            type: EDIT_TASK,
            value: {cid: cid, changes: changes},
        });

        XHRUtils.update(task.id, changes, () => {

        });
    };
}

export const REORDER_TASK = 'REORDER_TASK';
export function moveUp(task) {
    return (dispatch, getState) => {
        const tasks = getState().tasks;
        const subCollection = visibleTasksSelector(getState()).tasks;

        /*
            Task is moved relatively to the task before, which is the pivot,
            given a tag selection. The task before the pivot must be determined
            based on the whole list, not the given tag selection in order to
            avoid potential issue with tasks with the same order.
        */
        const previousIndexInSubCollection = subCollection.indexOf(task) - 1;
        const previous = subCollection[previousIndexInSubCollection];
        const previousIndex = tasks.indexOf(previous);
        const previousOfPrevious = tasks[previousIndex - 1] || null;

        if (previousIndex >= 0) {
            const orderInfos = getNewOrder(previousOfPrevious, previous);
            const order = orderInfos.order;
            const step = orderInfos.step;
            const changedPiece = [task, previous];

            const changes = {order: order};
            const cid = task.cid;
            dispatch({
                type: EDIT_TASK,
                value: {cid: cid, changes: changes},
            });

            dispatch({
                type: REORDER_TASK,
                value: {
                    task: task,
                    changedPiece: changedPiece,
                    index: previousIndex,
                    oldIndex: tasks.indexOf(task),
                },
            });

            XHRUtils.update(task.id, changes, (err) => {
                if (hasValue(err)) {
                    // console.log(err);
                }

                // Reindexes if step is too small.
                if (step <= Options.MIN_STEP) {
                    reindexTasks();
                }
            });
        }
    };
}

export function moveDown(task) {
    return (dispatch, getState) => {
        const tasks = getState().tasks;
        const subCollection = visibleTasksSelector(getState()).tasks;

        /*
            Task is moved relatively to the task after, which is the pivot,
            given a tag selection. The task after the pivot must be determined
            based on the whole list, not the given tag selection in order to
            avoid potential issue with tasks with the same order.
        */
        const nextIndexInSubCollection = subCollection.indexOf(task) + 1;
        const next = subCollection[nextIndexInSubCollection];
        const nextIndex = tasks.indexOf(next);
        const nextOfNext = tasks[nextIndex + 1] || null;

        // if not last item of the collection
        const lastItemOfCollection =
            nextIndex === tasks.length ||
            nextIndexInSubCollection === subCollection.length;

        if (!lastItemOfCollection) {
            const orderInfos = TaskUtil.getNewOrder(next, nextOfNext);
            const order = orderInfos.order;
            const step = orderInfos.step;
            const changedPiece = [next, task];

            const changes = {order: order};
            const cid = task.cid;
            dispatch({
                type: EDIT_TASK,
                value: {cid: cid, changes: changes},
            });

            dispatch({
                type: REORDER_TASK,
                value: {
                    task: task,
                    changedPiece: changedPiece,
                    index: nextIndex,
                    oldIndex: tasks.indexOf(task),
                },
            });

            XHRUtils.update(task.id, changes, () => {
                // Reindexes if step is too small.
                if (step <= Options.MIN_STEP) {
                    reindexTasks();
                }
            });
        }
    };
}

export function toggleState(task, isDone) {
    return dispatch => {
        let completionDate = null;
        if (isDone) {
            completionDate = Date.now();
        }

        const changes = {done: isDone, completionDate: completionDate};
        const cid = task.cid;
        dispatch({
            type: EDIT_TASK,
            value: {cid: cid, changes: changes},
        });

        XHRUtils.update(task.id, changes, () => {});
    };
}

export const REMOVE_TASK = 'REMOVE_TASK';
export function removeTask(task) {
    return dispatch => {
        dispatch({
            type: REMOVE_TASK,
            value: task,
        });

        XHRUtils.remove(task.id, () => {});
    };
}

export const SET_ARCHIVE_MODE = 'SET_ARCHIVED_MODE';
export function setArchiveMode(isArchived) {
    return {
        type: SET_ARCHIVE_MODE,
        value: isArchived,
    };
}

export const SET_SEARCH_QUERY = 'SET_SEARCH_QUERY';
export function setSearchQuery(searchQuery) {
    return {
        type: SET_SEARCH_QUERY,
        value: searchQuery,
    };
}

export const ARCHIVE_TASK = 'ARCHIVE_TASK';
export function archiveTasks(tasks) {
    return dispatch => {
        async.eachLimit(tasks, 5, (task, callback) => {
            dispatch({
                type: ARCHIVE_TASK,
                value: task.cid,
            });
            const payload = {
                isArchived: true,
                completionDate: Date.now(),
            };
            XHRUtils.update(task.id, payload, callback);
        }, () => {});
    };
}

export const RESTORE_TASK = 'RESTORE_TASK';
export function restoreTask(task) {
    return dispatch => {
        dispatch({
            type: RESTORE_TASK,
            value: task.cid,
        });
        const payload = {
            isArchived: false,
            done: false,
            completionDate: null,
        };
        XHRUtils.update(task.id, payload, () => {});
    };
}
