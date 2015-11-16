import logger from 'debug';
import createHistory from 'history/lib/createHashHistory';
import React from 'react/addons';
import { Provider } from 'react-redux';
import UrlPattern from 'url-pattern';

// import * as RoutesHandler from './routes-handler';
import Application from './components/application';

import { configureStore } from './store.js';

const store = configureStore(window);
const history = createHistory();

// Helper to allow link creation all around the application.
window.router = history;

const patterns = {
    'search': new UrlPattern('/search/:query'),
    'byTagsSearch': new UrlPattern(
        /^\/todoByTags\/([\w/]+)+\/;search\/([\w]+)$/,
        ['tags', 'query']
    ),
    'noTagSearch': new UrlPattern('/todoByTags/;search/:query'),
    'byTags': new UrlPattern(/^\/todoByTags\/([\w/]+)$/),
    'archivedByTags': new UrlPattern(/^\/archivedByTags\/(.*)$/),
    'archived': new UrlPattern('/archived'),
    'main': new UrlPattern('/'),
};

const debug = logger('app:router');

export function start() {
    debug('Start router.');

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

        store.dispatch({
            type: 'ROUTE_UPDATE',
            name,
            params,
        });
    });

    debug('Mount React application');
    const node = document.querySelector('#mount-point');
    React.render(
        <Provider store={store}>
            {() =>
                <Application />
            }
        </Provider>, node);
}
