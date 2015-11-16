import * as TaskActionCreator from './actions/TaskActionCreator';
import * as TagActionCreator from './actions/TagActionCreator';

export function main() {
    TaskActionCreator.setSearchQuery(null);
    TaskActionCreator.setArchivedMode(false);
    TagActionCreator.selectTags(null);
}

export function mainSearch(query) {
    TaskActionCreator.setSearchQuery(query);
    TaskActionCreator.setArchivedMode(false);
    TagActionCreator.selectTags(null);
}

export function archived() {
    TaskActionCreator.setSearchQuery(null);
    TaskActionCreator.setArchivedMode(true);
    TagActionCreator.selectTags(null);
}

export function byTags(rawTags, searchQuery, isArchived) {
    let tags;
    if (rawTags !== null && rawTags !== void 0) {
        tags = rawTags.split('/');

        // if the last char is '/', there is an empty element
        if (tags[tags.length - 1].length === 0) {
            tags.splice(tags.length - 1);
        }
    } else {
        tags = [];
    }

    TaskActionCreator.setArchivedMode(isArchived);
    TagActionCreator.selectTags(tags);
    TaskActionCreator.setSearchQuery(searchQuery);
}

export function todoByTags(tags) {
    byTags(tags, null, false);
}

export function todoByTagsWithSearch(tags, search) {
    byTags(tags, search, false);
}

export function archivedByTags(tags) {
    byTags(tags, null, true);
}
