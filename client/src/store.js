import logger from 'debug';
import { createStore, applyMiddleware } from 'redux';
import taskReducer from './reducers/tasks';
import tagReducer from './reducers/tags';
import routeReducer from './reducers/routes';
import thunkMiddleware from 'redux-thunk';
import createLoggerMiddleware from 'redux-logger';
import { SortCriterions } from './constants/AppConstants';

const debug = logger('app:store:init');

export function configureStore(serverData = {}) {
    debug('Add redux middlewares.');
    const loggerMiddleware = createLoggerMiddleware({
        level: 'info',
        collapsed: true,
    });
    const createStoreWithMiddleware = applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
    )(createStore);

    debug('Retrieve configuration from local storage.');
    let favoriteSearch;
    try {
        const localStorageKey = 'tasky.favorite_search';
        const storedFavoriteSearch = localStorage.getItem(localStorageKey);
        favoriteSearch = JSON.parse(storedFavoriteSearch);
    } catch (err) {
        const message = `An error occured while retrieving favorite search ` +
                        `(${err.message})`;
        debug(message);
        favoriteSearch = null;
    }

    let storedSortCriterion;
    try {
        storedSortCriterion = localStorage.getItem('sort-criterion');
    } catch (err) {
        const message = `An error occured while retrieving sort criterion ` +
                        `(${err.message})`;
        debug(message);
        storedSortCriterion = null;
    }
    const sortCriterion = storedSortCriterion || SortCriterions.COUNT;

    debug('Build initial state object based on server data.');
    const initialState = {
        selectedTags: null,
        tasks: serverData.tasks,
        archivedTasks: serverData.archivedTasks,
        searchQuery: null,
        cid: serverData.cid,
        isArchivedModeEnabled: false,
        isReindexing: false,
        sortCriterion,
        favoriteTags: serverData.favoriteTags || [],
        favoriteSearch,
    };

    const rootReducer = (state, action) => {
        let newState = taskReducer(state, action);
        newState = tagReducer(newState, action);
        newState = routeReducer(newState, action);
        return newState;
    };

    return createStoreWithMiddleware(rootReducer, initialState);
}
