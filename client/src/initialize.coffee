window.onload = ->
    # Required by current Flux implementaiton.
    window.__DEV__ = true

    # Retrieve locale data from window.
    @locale = window.locale

    Polyglot = require 'node-polyglot'
    @polyglot = new Polyglot locale: @locale

    # Trick to include all supported localization files with browserify.
    localesLoader =
        en: require './locales/en'
        fr: require './locales/fr'

    # Select current locale based on user information.
    locales = localesLoader[@locale]

    # Fallback to english if it can't for some reason.
    locales = localesLoader['en'] unless locales?

    # Initialize polyglot object with locales.
    @polyglot.extend locales

    # Handy shortcut.
    window.t = @polyglot.t.bind @polyglot

    # Initialize stores.
    TaskStore = require './stores/TaskStore'
    TagStore = require './stores/TagStore'

    # Initialize the routing and start the app.
    require './router'

    # Makes this object immuable.
    Object.freeze this if typeof Object.freeze is 'function'
