"use strict";

import * as _ from "underscore";

import * as Store from "../libs/flux/store/Store";
import * as hasValue from "../utils/hasValue";

import TaskStore from "./TaskStore";
import {ActionTypes, SortCriterions} from "../constants/AppConstants";


let _selectedTags = null;
let _favoriteTags = window.favoriteTags || [];
let json = localStorage.getItem("tasky.favorite_search");
let _favoriteSearch = JSON.parse(json);
let fromLocalStorage = localStorage.getItem("sort-criterion");
let _sortCriterion = fromLocalStorage || SortCriterions.COUNT;

class TagStore extends Store {

    __bindHandlers(handle) {

        handle(ActionTypes.SELECT_TAGS, tags => {
            if(hasValue(tags)) {
                _selectedTags.map(tag => {
                    const isExcluded = tag.indexOf("!") !== -1;
                    const label = tag.replace("!", "");
                    return {label: label, isExcluded: isExcluded};
                });
            }
            else {
                _selectedTags = null;
            }

            this.emit("change");
        });

        handle(ActionTypes.SELECT_SORT_CRITERION, criterion => {
            _sortCriterion = criterion;
            this.emit("change");
        });

        handle(ActionTypes.TOGGLE_FAVORITE_TAG, tag => {
            const tagIndex = _favoriteTags.indexOf(tag);

            if(tagIndex === -1) {
                _favoriteTags.push(tag);
            }
            else {
                _favoriteTags.splice(tagIndex, 1);
            }

            this.emit("change");
        });

        handle(ActionTypes.MARK_SEARCH_AS_FAVORITE, selectedTags => {
            _favoriteSearch = selectedTags;
            this.emit("change");
        });
    }

    getSelected() { return _selectedTags; }

    getSelectedNames() {
        if(hasValue(_selectedTags)) {
            return _selectedTags.map(tag => tag.label);
        }
        else {
            return null;
        }
    }

    getSortCriterion() { return _sortCriterion; }

    getFavoriteTags() { return _favoriteTags; }

    getFavoriteSearch() { return _favoriteSearch; }

    getTree() {
        const selectedTagNames = this.getSelectedNames();
        let maxDepth = 0;
        if(hasValue(selectedTagNames)) {
            maxDepth = selectedTagNames.length;
        }

        const tree = [];

        // Initialize an empty array for all depth.
        for(let i = 0; i < maxDepth; i++) {
            tree.push({});
        }


        // Count number of tasks for each tag at the relevant depth.
        function buildTree(depth, list, isDone, excludeList = []) {

            // Only count a task once for a tag.
            const uniqList = _.uniq(list);

            uniqList.forEach(tag => {
                if(!_.contains(tag, excludeList)) {
                    // Initialize if it doesn't exist yet.
                    if(!hasValue(tree[depths][tag])) {
                        tree[depths][tag] = {
                            global: 0,
                            done: 0
                        };
                    }

                    tree[depth][tag].global++;
                    if(isDone) {
                        tree[depth][tag].done++;
                    }
                }
            });
        }

        // Process each tasks to build the tag tree (based on selected tags).
        let tagsOfTask, isDone, processedSelection, intersection;
        TaskStore.getAll()
            .forEach(task => {
                tagsOfTask = task.tags;
                isDone = task.done;

                // All tags are represented at depth 0.
                buildTree(0, tagsOfTask, isDone);

                // Build the tree with task's tags if relevant.
                for(let depth = 1; depth < maxDepth; depth++) {


                    /* We don't count this task for tags already processed
                       at previous depth. */
                       if(hasValue(selectedTagNames)) {
                           processedSelection = selectedTagNames
                                                        .slice(0, depth);
                       }
                       else {
                           processedSelection = null;
                       }

                    intersection = _.intersection(processedSelection,
                                                  tagsOfTask);
                    if(intersection.length === processedSelection.length) {
                        buildTree(depth, tagsOfTask, isDone,
                                  processedSelection);
                    }
                }
            });

        // Tree is now complete.
        const aTree = [];
        let firstCriterion, secondCriterion, factor;

        // sort by -count, then +label
        if(_sortCriterion === "count") {
            firstCriterion = "count";
            secondCriterion = "label";
            factor = 1;
        }
        // sort by +label, then -count
        else if(_sortCriterion === "alpha") {
            firstCriterion = "label";
            secondCriterion = "count";
            factor = -1;
        }

        let branch, depths, tag, count;
        for(branch in tree) {
            depths = [];
            for(tag in Object.keys(branch)) {
                count = branch[tag];

                depths.push({
                    label: tag,
                    count: count.global,
                    doneCount: count.done,
                    isFavorite: _favoriteTags.indexOf(tag) !== -1
                });
            }

            let aFirst, bFirst, aSecond, bSecond;
            depths.sort((a, b) => { // eslint-disable-line no-loop-func

                if(a.isFavorite && !b.isFavorite) {
                    return -1;
                }
                else if(!a.isFavorite && b.isFavorite) {
                    return 1;
                }
                else {
                    aFirst = a[firstCriterion];
                    bFirst = b[firstCriterion];
                    if(aFirst > bFirst) {
                        return -1 * factor;
                    }
                    else if(aFirst < bFirst) {
                        return 1 * factor;
                    }
                    else {
                        aSecond = a[secondCriterion];
                        bSecond = b[secondCriterion];
                        if(aSecond > bSecond) {
                            return -1 * factor;
                        }
                        else if(aSecond < bSecond) {
                            return 1 * factor;
                        }
                        else {
                            return 0;
                        }
                    }
                }
            });

            aTree.push(depths);
        }

        return aTree;
    }


}

export const singleton = new TagStore();
