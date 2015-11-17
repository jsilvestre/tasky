import Application from './components/application';
import logger from 'debug';
import React from 'react/addons';
import { Provider } from 'react-redux';
import startRouter from './router';
import { configureStore } from './store.js';

const debug = logger('app:init');

window.onload = () => {
    debug('`onload` event fired.');
    debug('Initialize application.');

    debug('Get localization strings based on given locale.');
    // TODO: make it independant of browser implementation.
    const locale = window.locale;
    delete window.locale;

    const localesLoader = {
        en: require('./locales/en'),
        fr: require('./locales/fr'),
    };

    let phrases = localesLoader[locale];

    if (!phrases) {
        debug(`Localized strings could not be found for locale ${locale}, `
              `using EN locale instead.`);
        phrases = localesLoader.en;
    }

    // Initialize polyglot object with phrases.
    const Polyglot = require('node-polyglot');
    const polyglot = new Polyglot({locale: locale});
    polyglot.extend(phrases);

    // Handy shortcut.
    // TODO: make it independant of browser implementation.
    window.t = polyglot.t.bind(polyglot);

    debug('Initialize store.');
    // TODO: make it independant of browser implementation.
    const store = configureStore(window);

    const history = startRouter(store);

    // Helper to allow link creation all around the application.
    // TODO: make it independant of browser implementation.
    window.router = history;

    debug('Mount React application');
    const node = document.querySelector('#mount-point');
    React.render(
        <Provider store={store}>
            {() =>
                <Application />
            }
        </Provider>, node);

    debug('Application initialized.');
};
