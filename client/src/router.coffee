React = require 'react/addons'
{Route} = Router = require 'react-router'

RoutesHandler = require './routes-handler'
Application = require './components/application'

# Define the routes.
routes = [
    React.createElement Route,
        handler: Application
        name: 'main'
        path: '/'
    React.createElement Route,
        handler: Application
        name: 'archived'
        path:  '/archived'
    React.createElement Route,
        handler: Application
        name: 'search'
        path:  '/search/:query'
    React.createElement Route,
        handler: Application
        name: 'todoByTagsWithSearch'
        path: '/todoBytags/*/;search/:query'
    React.createElement Route,
        handler: Application
        name: 'todoUntaggedWithSearch'
        path: '/todoBytags/;search/:query'
    React.createElement Route,
        handler: Application
        name: 'todoByTags'
        path:  '/todoByTags/*'
    React.createElement Route,
        handler: Application
        name: 'archivedByTags'
        path:  '/archivedByTags/*tags'
]

# When the route changes.
router = Router.run routes, Router.HashLocation, (Root, state) ->

    # Execute a handler based on the active route.
    currentRoute = state.routes[0]
    switch currentRoute.name
        when 'main'
            RoutesHandler.main()

        when 'archived'
            RoutesHandler.archived()

        when 'search'
            {query} = state.params
            RoutesHandler.mainSearch query

        when 'todoByTagsWithSearch'
            {splat, query} = state.params
            RoutesHandler.todoByTagsWithSearch splat, query

        when 'todoUntaggedWithSearch'
            {splat, query} = state.params
            RoutesHandler.todoByTagsWithSearch splat, query

        when 'todoByTags'
            {splat} = state.params
            RoutesHandler.todoByTags splat

        when 'archivedByTags'
            {splat} = state.params
            RoutesHandler.archivedByTags splat

    # Start the React application.
    node = document.querySelector '#mount-point'
    React.render React.createElement(Root, {}), node
