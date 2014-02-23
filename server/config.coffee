americano = require 'americano'
config =
    common:
        use: [
            americano.bodyParser()
            americano.methodOverride()
            americano.errorHandler
                dumpExceptions: true
                showStack: true
            americano.static __dirname + '/../client/public',
                maxAge: 86400000
        ]
        set:
            views: './client'

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