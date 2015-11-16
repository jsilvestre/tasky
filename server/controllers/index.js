import async from 'async';
import cozydb from 'cozydb';
import invariant from 'invariant';
import logger from 'debug';
import FavoriteTag from '../models/favorite_tag';
import hasValue from '../hasValue';
import Task from '../models/tasky';

const debug = logger('app:controller:main');

export function main(req, res, next) {
    debug('Retrieve data to build HTML.');

    async.parallel({
        tasks: (done) => { Task.allNotArchived(done); },
        archivedTasks: (done) => { Task.allArchived(done); },
        locale: (done) => { cozydb.api.getCozyLocale(done); },
        favoriteTags: (done) => { FavoriteTag.allForTasky(done); },
    }, (err, results) => {
        if (hasValue(err)) {
            debug('Some data have not been retrieved due to an unexpected ' +
                  'error.');
            next(err);
        } else {
            invariant(hasValue(results.tasks), '`tasks` is a mandatory ' +
                                               'property');
            invariant(hasValue(results.archivedTasks), '`archivedTasks` is a ' +
                                                       'mandatory property');
            invariant(hasValue(results.locale), '`locale` is a mandatory ' +
                                                'property');
            invariant(hasValue(results.favoriteTags), '`favoriteTags` is a ' +
                                                      'mandatory property');
            debug('Data have been retrieved.');

            let {tasks, archivedTasks} = results;
            const {locale, favoriteTags} = results;

            debug('Build unserialized properties (cid) into data model.');
            let cid = 0;
            tasks = tasks.map(task => {
                task.cid = cid++;
                return task;
            });

            archivedTasks = archivedTasks.map(task => {
                task.cid = cid++;
                return task;
            });

            debug('Render template with data.');
            try {
                const imports = `
                    window.locale = "${locale}";
                    window.tasks = ${JSON.stringify(tasks)};
                    window.archivedTasks = ${JSON.stringify(archivedTasks)};
                    window.favoriteTags = ${JSON.stringify(favoriteTags)};
                    window.cid = ${cid};
                `;
                res.render('index', {imports});
            } catch (error) {
                next(error);
            }
        }
    });
}
