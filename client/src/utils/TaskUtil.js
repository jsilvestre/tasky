"use strict";

import * as _ from "underscore";
import * as hasValue from "./hasValue";

// Weird stuff are for accentated characters.
// See http://stackoverflow.com/questions/1073412/javascript-validation-issue-
// with-international-characters.
const regex = /(^|\s)#([\w\d\-_\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)(?=\s|$)/g; // eslint-disable-line max-len

export function containsTags(task, tags) {
    if(tags.length === 0) {
        return task.tags.length === 0;
    }
    else {
        const lowerCasedTags = task.tags.map(tag => tag.toLowerCase());
        return _.every(tags, _.partial(_.contains, lowerCasedTags));
    }
}


export function doesntContainsTags(task, tags) {
    // No task to exclude, it cannot contain it.
    if(tags.length === 0) {
        return true;
    }
    else {
        const lowerCasedTags = task.tags.map(tag => tag.toLowerCase());
        return !_.some(tags, _.partial(_.contains, lowerCasedTags));
    }
}

// Helper function to extract tag from description.
export function extractTags(desc) {
    let tags = desc.match(regex);
    tags = _.map(tags, tag => tag.trim().replace("#", "").toLowerCase());
    tags = _.uniq(tags);
    return tags;
}

export function getNewOrder(previousTask, nextTask) {
    const topBoundary = hasValue(nextTask) ? nextTask.order : Number.MAX_VALUE;
    const lowBoundary = hasValue(previousTask) ? previousTask.order : 0.0;

    const step = (topBoundary - lowBoundary) / 2;
    const order = lowBoundary + step;

    return {order, step};
}

export function buildTagsList(tags, options = {}) {

    const tagPrefix = options.tagPrefix || "";
    const regularSeparator = options.regularSeparator || " ";
    const lastSeparator = options.lastSeparator || " ";

    if(!hasValue(tags)) {
        return "";
    }

    let tagsList = "";
    const includedTags = tags
        .filter(tag => !tag.isExcluded)
        .map(tag => tag.label);

    includedTags.forEach(tag => {
        if(includedTags.indexOf(tag) === 0) {
            tagsList = `${tagPrefix}${tag}`;
        }
        else if(includedTags.indexOf(tag) === (includedTags.length - 1)) {
            tagsList = `${tagsList}${lastSeparator}${tagPrefix}${tag}`;
        }
        else {
            tagsList = `${tagsList}${regularSeparator}${tagPrefix}${tag}`;
        }
    });

    return tagsList;
}
