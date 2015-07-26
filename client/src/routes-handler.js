"use strict";

import * as TaskActionCreator from "./actions/TaskActionCreator";
import * as TagActionCreator from "./actions/TagActionCreator";

export const Handlers = {

    main() {
        TaskActionCreator.setSearchQuery(null);
        TaskActionCreator.setArchivedMode(false);
        TagActionCreator.selectTags(null);
    },

    mainSearch(query) {
        TaskActionCreator.setSearchQuery(query);
        TaskActionCreator.setArchivedMode(false);
        TagActionCreator.selectTags(null);
    },

    archived() {
        TaskActionCreator.setSearchQuery(null);
        TaskActionCreator.setArchivedMode(true);
        TagActionCreator.selectTags(null);
    },

    todoByTags(tags) {
        Handlers.byTags(tags, null, false);
    },

    todoByTagsWithSearch(tags, search) {
        Handlers.byTags(tags, search, false);
    },

    archivedByTags(tags) {
        Handlers.byTags(tags, null, true);
    },

    byTags(tags, searchQuery, isArchived) {

        if(tags !== null && tags !== void 0) {
            tags = tags.split("/");

            // if the last char is '/', there is an empty element
            if(tags[tags.length - 1].length === 0) {
                tags.splice(tags.length - 1);
            }
        }
        else {
            tags = [];
        }

        TaskActionCreator.setArchivedMode(isArchived);
        TagActionCreator.selectTags(tags);
        TaskActionCreator.setSearchQuery(searchQuery);
    }
};
