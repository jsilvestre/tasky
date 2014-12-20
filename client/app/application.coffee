Backbone = require 'backbone'
Polyglot = require 'node-polyglot'
Backbone.$ = require 'jquery'

module.exports =
    initialize: ->
        # Used in inter-app communication
        #SocketListener = require '../lib/socket_listener'

        @locale = window.locale
        delete window.locale

        @polyglot = new Polyglot locale: @locale
        try
            locales = require './locales/'+ @locale
        catch e
            locales = require './locales/en'

        @polyglot.extend locales
        window.t = @polyglot.t.bind @polyglot

        TaskStore = require './stores/TaskStore'
        TagStore = require './stores/TagStore'

        # Routing management
        @router = require './router'
        window.router = @router
        Backbone.history.start()

        # Makes this object immuable.
        Object.freeze this if typeof Object.freeze is 'function'
