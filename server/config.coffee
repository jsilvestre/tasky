path = require 'path'
americano = require 'americano'

config =
    common:
        use: [
            americano.bodyParser()
            americano.methodOverride()
            americano.errorHandler
                dumpExceptions: true
                showStack: true
            americano.static path.resolve(__dirname, '../client/public'),
                maxAge: 86400000
        ]
        set:
            views: path.resolve __dirname, '../client'

        engine:
            # Allows res.render of .js files (pre-rendered jade)
            js: (path, locals, callback) ->
                callback null, require(path)(locals)

    development: [
        americano.logger 'dev'
    ]

    production: [
        americano.logger 'short'
    ]

    plugins: [
        'americano-cozy'
    ]

module.exports = config
