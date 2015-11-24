import Application from './components/application';
import logger from 'debug';
import React from 'react';
import { Provider } from 'react-redux';
import startRouter from './router';
import { configureStore } from './store.js';

import en from './locales/en';
import fr from './locales/fr';

const debug = logger('app:boot');

export default function boot(data) {
    debug('Prepare application to boot.');

    debug('Get localization strings based on given locale.');
    const locale = data.locale;
    const localesLoader = {en, fr};

    let phrases = localesLoader[locale];

    if (!phrases) {
        debug(`Localized strings could not be found for locale ${locale}, `
              `using EN locale instead.`);
        phrases = localesLoader.en;
    }

    // Initialize polyglot object with phrases.
    const Polyglot = require('node-polyglot');
    const polyglot = new Polyglot({
        allowMissing: process.env.NODE_ENV === 'production',
        locale: locale,
    });
    polyglot.extend(phrases);

    const store = configureStore(data);
    const history = startRouter(store);

    const application = (
        <Provider store={store}>
            <Application router={history} t={polyglot.t.bind(polyglot)}/>
        </Provider>
    );

    debug('Application configured.');
    return application;
}
