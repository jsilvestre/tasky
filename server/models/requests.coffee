# See documentation on https://github.com/frankrousseau/americano-cozy/#requests

americano = require 'americano'

module.exports =
    tasky:
        all: americano.defaultRequests.all
        byState: (doc) -> emit doc.state, doc
        byArchiveState: (doc) -> emit doc.isArchived, doc

    cozy_instance:
        all: americano.defaultRequests.all