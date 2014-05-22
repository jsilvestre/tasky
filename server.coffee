americano = require 'americano'

application = module.exports = (callback) ->
    options =
        name: 'tasky'
        root: __dirname
        port: process.env.PORT || 9250
        host: process.env.HOST || '127.0.0.1'

    americano.start options

if not module.parent
    application()