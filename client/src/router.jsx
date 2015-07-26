"use strict";

import * as React from "react/addons";
import * as Router from "react-router";
import * as RoutesHandler from "./routes-handler";
import * as ApplicationComponent from "./components/application";

const Route = Router.Route;
const Application = React.createFactory(ApplicationComponent);

export function start() {

    const routes = (
        <Route handler={Application} name="placeholder" path="/" >
            <Route handler={Application} name="main" path="/" />
            <Route handler={Application} name="archived" path="/archived" />
            <Route handler={Application} name="search" path="/search/:query" />
            <Route handler={Application}
                name="todoByTagsWithSearch"
                path="/todoBytags/*\/;search/:query" />
            <Route handler={Application}
                name="todoUntaggedWithSearch"
                path="/todoBytags/;search/:query" />
            <Route handler={Application}
                name="todoByTags"
                path="/todoByTags/*" />
            <Route handler={Application}
                name="archivedBytags"
                path="/archivedByTags/*\/tags" />
        </Route>
    );

    Router.run(routes, Router.HashLocation, function(Root, state) {
        // Execute a handler based on the active route.
        const currentRoute = state.routes[0];

        let query, splat;
        switch(currentRoute.name) {

            case "main":
                RoutesHandler.main();
                break;

            case "archived":
                RoutesHandler.archived();
                break;

            case "search":
                query = state.params.query;
                RoutesHandler.mainSearch(query);
                break;

            case "todoByTagsWithSearch":
                query = state.params.query;
                splat = state.params.splat;
                RoutesHandler.todoByTagsWithSearch(splat, query);
                break;

            case "todoUntaggedWithSearch":
                query = state.params.query;
                splat = state.params.splat;
                RoutesHandler.todoByTagsWithSearch(splat, query);
                break;

            case "todoByTags":
                splat = state.params.splat;
                RoutesHandler.todoByTags(splat);
                break;

            case "archivedByTags":
                splat = state.params.splat;
                RoutesHandler.archivedByTags(splat);
                break;
        }
        // Start the React application.
        const node = document.querySelector("#mount-point");
        React.render(<Root />, node);
    });
}
