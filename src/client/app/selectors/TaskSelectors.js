import { createSelector } from 'reselect';

import hasValue from '../utils/hasValue';
import {containsTags, doesntContainsTags} from '../utils/TaskUtil';

// Get tasks todo list or tasks archived list, based on selected mode.
const tasksListSelector = (state) => {
    let result;
    if (state.isArchivedModeEnabled) {
        result = state.archivedTasks;
    } else {
        result = state.tasks;
    }

    return result;
};

// Get the selected tags.
const selectedTagsSelector = (state) => state.selectedTags;

// Get the search query.
const searchQuerySelector = (state) => state.searchQuery;


// Get all untagged tasks, given a collection of tasks.
function getUntagged(tasks) {
    return tasks.filter(task => task.tags.length === 0);
}

// Get all tasks tagged by given tags, matching the searchQuery.
function getByTags(tasks, tags, searchQuery) {
    let result;
    // Return all tasks with no tags, if the tag filter is empty.
    if (hasValue(tags) && tags.length === 0) {
        result = getUntagged(tasks);
    } else {
        // Filter by tag.
        let filteredTasksList = tasks;
        if (hasValue(tags)) {
            const mapValue = function mapValue(tag) {
                return tag.label;
            };

            const includedTags = tags
                .filter(tag => !tag.isExcluded)
                .map(mapValue);
            const excludedTags = tags
                .filter(tag => tag.isExcluded)
                .map(mapValue);
            const noInclusion = includedTags.length === 0;

            /* When there are no included tags, it means all tasks should be
               selected. */
            filteredTasksList = filteredTasksList.filter(task => {
                const includeOk = containsTags(task, includedTags);
                const excludeOk = doesntContainsTags(task, excludedTags);
                return (includeOk || noInclusion) && excludeOk;
            });
        }

        // Filter with the plain-text search query, if it exists.
        if (hasValue(searchQuery)) {
            const regex = new RegExp(searchQuery, 'i');
            filteredTasksList = filteredTasksList.filter(task => {
                return regex.test(task.description);
            });
        }

        result = filteredTasksList;
    }

    return result;
}

// Get the tasks to display.
export const visibleTasksSelector = createSelector(
    [tasksListSelector, selectedTagsSelector, searchQuerySelector],
    (tasksList, selectedTags, searchQuery) => {
        return {
            tasks: getByTags(tasksList, selectedTags, searchQuery),
            untaggedTasks: getUntagged(tasksList),
        };
    }
);

// Get the done tasks to display.
export const visibleTasksDoneSelector = createSelector(
    [visibleTasksSelector],
    (visibleTasks) => {
        const {tasks} = visibleTasks;
        return { tasksDone: tasks.filter(task => task.done) };
    }
);
