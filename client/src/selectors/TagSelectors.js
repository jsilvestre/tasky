import logger from 'debug';
import { createSelector } from 'reselect';
import _ from 'underscore';
import {SortCriterions} from '../constants/AppConstants';

import hasValue from '../utils/hasValue';

const debug = logger('app:selectors:tag');

// Get the selected tags.
const selectedTagsSelector = (state) => state.selectedTags;

// Get the selected tags.
const sortCriterionSelector = (state) => state.sortCriterion;

// Get the selected tags.
const favoriteTagsSelector = (state) => state.favoriteTags;

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


function getSelectedTagNames(selectedTags) {
    let result;
    if (hasValue(selectedTags)) {
        result = selectedTags.map(tag => tag.label);
    } else {
        result = null;
    }

    return result;
}

export const selectedTagsNameSelector = createSelector(
    [selectedTagsSelector],
    (selectedTags) => {
        return getSelectedTagNames(selectedTags);
    }
);

function computeMaxDepth(selectedTagNames) {
    let maxDepth = 0;

    if (hasValue(selectedTagNames)) {
        maxDepth = selectedTagNames.length;
    }

    return maxDepth;
}

function initializeTree(maxDepth) {
    const tree = [];

    // Initialize an empty object for all depth.
    for (let i = 0; i <= maxDepth; i++) {
        tree.push([]);
    }

    return tree;
}

// Count number of tasks for each tag at the relevant depth.
function buildTree(tree, depth, list, isDone, favoriteTags, excludeList = []) {
    // Only count a task once for a tag.
    const uniqList = _.uniq(list);

    let tag;
    const listLength = uniqList.length;
    for (let i = 0; i < listLength; i++) {
        tag = uniqList[i];
        if (!_.contains(excludeList, tag)) {
            let tagObject;
            let tagIndex = _.findIndex(tree[depth], {label: tag});

            // Initialize the tag object if it doesn't exist yet.
            if (tagIndex === -1) {
                tagIndex = tree[depth].length;

                tagObject = {
                    label: tag,
                    count: 0,
                    doneCount: 0,
                    isFavorite: favoriteTags.indexOf(tag) !== -1,
                };

                tree[depth].push(tagObject);
            } else {
                tagObject = tree[depth][tagIndex];
            }

            // Increase number of tasks for this tag.
            tagObject.count++;
            if (isDone) {
                tagObject.doneCount++;
            }

            tree[depth][tagIndex] = tagObject;
        }
    }
}

// Get sorting parameters based on user-selected criterion.
function getSortingParams(sortCriterion) {
    let firstCriterion;
    let secondCriterion;
    let factor;

    if (sortCriterion === SortCriterions.COUNT) {
        // Sort by -count, then +label.
        firstCriterion = SortCriterions.COUNT;
        secondCriterion = SortCriterions.ALPHA;
        factor = 1;
    } else if (sortCriterion === SortCriterions.ALPHA) {
        // Sort by +label, then -count.
        firstCriterion = SortCriterions.ALPHA;
        secondCriterion = SortCriterions.COUNT;
        factor = -1;
    }

    return { firstCriterion, secondCriterion, factor };
}

// Create a sorting function based on sorting parameters.
function getSorter(firstCriterion, secondCriterion, factor) {
    return (a, b) => {
        let aFirst;
        let bFirst;
        let aSecond;
        let bSecond;
        let result;

        if (a.isFavorite && !b.isFavorite) {
            result = -1;
        } else if (!a.isFavorite && b.isFavorite) {
            result = 1;
        } else {
            aFirst = a[firstCriterion];
            bFirst = b[firstCriterion];
            if (aFirst > bFirst) {
                result = -1 * factor;
            } else if (aFirst < bFirst) {
                result = 1 * factor;
            } else {
                aSecond = a[secondCriterion];
                bSecond = b[secondCriterion];
                if (aSecond > bSecond) {
                    result = -1 * factor;
                } else if (aSecond < bSecond) {
                    result = 1 * factor;
                } else {
                    result = 0;
                }
            }
        }
        return result;
    };
}

// Sort all tree's branches, given a sorting function.
function sortTree(tree, sorter) {
    const treeDepth = tree.length;
    for (let depth = 0; depth < treeDepth; depth++) {
        tree[depth].sort(sorter);
    }

    return tree;
}

function extractTagsFromTask(tree, task, selectedTagNames, favoriteTags,
                                                                    maxDepth) {
    let processedSelection;
    let intersection;

    const treeBuilder = _.partial(buildTree, _, _, task.tags, task.done,
                                  favoriteTags);

    // All tags are represented at depth 0.
    treeBuilder(tree, 0);

    // Build the tree with task's tags if relevant.
    for (let depth = 1; depth <= maxDepth; depth++) {
        // Tags already processed can be determined based on depth and list of
        // selected tags.
        if (hasValue(selectedTagNames)) {
            processedSelection = selectedTagNames.slice(0, depth);
        } else {
            processedSelection = null;
        }

        // This task is not counted for tags already processed at
        // previous depth.
        intersection = _.intersection(processedSelection, task.tags);
        if (intersection.length === processedSelection.length) {
            treeBuilder(tree, depth, processedSelection);
        }
    }
}

export const treeSelector = createSelector(
    [
        selectedTagsNameSelector,
        tasksListSelector,
        sortCriterionSelector,
        favoriteTagsSelector,
    ],
    (selectedTagNames, tasks, sortCriterion, favoriteTags) => {
        debug('Start generation of tag tree');
        const maxDepth = computeMaxDepth(selectedTagNames);
        const tree = initializeTree(maxDepth);

        // Process each tasks to build the tag tree (based on selected tags).
        debug('Extract tags for all depth for each task.');
        let task;
        const numTasks = tasks.length;
        const extractor = _.partial(extractTagsFromTask, _, _,
                                    selectedTagNames, favoriteTags, maxDepth);
        for (let i = 0; i < numTasks; i++) {
            task = tasks[i];
            extractor(tree, task);
        }

        // Get sorting parameters.
        const {
            firstCriterion,
            secondCriterion,
            factor,
        } = getSortingParams(sortCriterion);
        debug(`Sort tree by ${firstCriterion}, ${secondCriterion}`);
        const sorter = getSorter(firstCriterion, secondCriterion, factor);
        sortTree(tree, sorter);

        debug('Tag tree has been successfully generated.');
        return tree;
    }
);
