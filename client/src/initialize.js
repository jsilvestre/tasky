import logger from 'debug';
const debug = logger('app:init');

window.onload = () => {
    debug('`onload` event fired.');
    debug('Initialize application.');

    debug('Get localization strings based on given locale.');
    const locale = window.locale;
    delete window.locale;

    const localesLoader = {
        en: require('./locales/en'),
        fr: require('./locales/fr'),
    };

    let locales = localesLoader[locale];

    if (!locales) {
        debug(`Localized strings could not be found for locale ${locale}, `
              `using EN locale instead.`);
        locales = localesLoader.en;
    }

    // Initialize polyglot object with locales.
    const Polyglot = require('node-polyglot');
    const polyglot = new Polyglot({locale: locale});

    polyglot.extend(locales);

    // Handy shortcut.
    window.t = polyglot.t.bind(polyglot);

    debug('Initialize router and start application.');
    const router = require('./router');
    router.start();

    debug('Application initialized.');
};
