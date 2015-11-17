import createHistory from 'history/lib/createHashHistory';
import logger from 'debug';
import UrlPattern from 'url-pattern';

const debug = logger('app:router');

export default function start(store) {
    debug('Start router.');

    // List of URL patterns.
    const patterns = {
        'search': new UrlPattern('/search/:query'),
        'byTagsSearch': new UrlPattern(
            /^\/todoByTags\/([\w/]+)+\/;search\/([\w]+)$/,
            ['tags', 'query']
        ),
        'noTagSearch': new UrlPattern('/todoByTags/;search/:query'),
        'byTags': new UrlPattern(/^\/todoByTags\/([\w/]*)$/),
        'archivedByTags': new UrlPattern(/^\/archivedByTags\/(.*)$/),
        'archived': new UrlPattern('/archived'),
        'main': new UrlPattern('/'),
    };
    const history = createHistory();

    // Everytime the URL changes, dispatch the first URL matched with its
    // parameter.
    history.listen(location => {
        let name = null;
        let params = null;
        let i = 0;
        const patternKeys = Object.keys(patterns);
        while (params === null && i < patternKeys.length) {
            name = patternKeys[i];
            params = patterns[name].match(location.pathname);
            i++;
        }

        if (name !== null) {
            store.dispatch({
                type: 'ROUTE_UPDATE',
                name,
                params,
            });
        } else {
            debug(`Location "${location.pathname}" have not been matched.`);
        }
    });

    return history;
}
