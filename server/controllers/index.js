"use strict";
import * as fs from "fs";
import * as path from "path";
import * as async from "async";
import * as Task from "../models/tasky";
import * as CozyInstance from "../models/cozy_instance";
import * as FavoriteTag from "../models/favorite_tag";
import * as hasValue from "../hasValue";


function getTemplateExtension() {
    /*
     If run from build/, templates are compiled to JS
     otherwise, they are in jade.
    */
    const filePath = path.resolve(__dirname, "../../client/index.js");
    const runFromBuild = fs.existsSync(filePath);
    const extension = runFromBuild ? "js" : "jade";
    return extension;
}

export const main = function(req, res, next) {

    async.parallel({
        tasks: (done) => { Task.allNotArchived(done); },
        archivedTasks: (done) => { Task.allArchived(done); },
        locale: (done) => { CozyInstance.getLocale(done); },
        favoriteTags: (done) => { FavoriteTag.allForTasky(done); }
    }, function(err, results) {

        if(hasValue(err)) {
            // next(err);
            res.status(500).json({
                error: "Server error occurred while retrieving data",
                stack: err.stack
            });
        }
        else {
            const {tasks, archivedTasks, locale, favoriteTags} = results;
            const extension = getTemplateExtension();

            try {
                const imports = `
                    window.locale = "${locale}";
                    window.tasks = ${JSON.stringify(tasks)};
                    window.archivedTasks = ${JSON.stringify(archivedTasks)};
                    window.favoriteTags = ${JSON.stringify(favoriteTags)};
                `;
                res.render(`index.${extension}`, {imports});
            }
            catch(error) {
                next(error);
            }

        }
    });
};
