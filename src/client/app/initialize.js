import boot from './boot';
import logger from 'debug';
import ReactDOM from 'react-dom';

const debug = logger('app:init');

// Executed when the browser has loaded everything.
window.onload = () => {
    debug('`onload` event fired.');
    debug('Initialize and start application.');

    const application = boot(window);

    debug('Mount React application');
    const node = document.querySelector('#mount-point');
    ReactDOM.render(application, node);

    debug('Application started.');
};

// Helper that people can use to enable logging from the console.
window.debug = (pattern = 'app:*') => {
    console.info(`Reload the page to see logs that match pattern ${pattern}`); // eslint-disable-line no-console, max-len
    localStorage.setItem('debug', pattern);
};
