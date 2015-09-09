# See documentation on https://github.com/frankrousseau/americano-cozy/#requests

americano = require 'americano'

module.exports =
    tasky:
        all: americano.defaultRequests.all
        byArchiveState: (doc) -> emit doc.isArchived, doc
        byOrder: (doc) ->
            unless doc.isArchived
                emit doc.order, doc

    cozy_instance:
        all: americano.defaultRequests.all

    favorite_tag:
        allByApp: (doc) -> emit doc.application, doc
        byAppByLabel: (doc) -> emit [doc.application, doc.label], doc
