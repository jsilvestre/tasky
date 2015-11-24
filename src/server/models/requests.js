import americano from 'americano';

module.exports = {
    tasky: {
        all: americano.defaultRequests.all,
        byArchiveState: americano.defaultRequests.by('isArchived'),
        byOrder: (doc) => {
            if (!doc.isArchived) {
                emit(doc.order, doc); // eslint-disable-line no-undef
            }
        },
    },

    favorite_tag: {
        allByApp: americano.defaultRequests.by('application'),
        byAppByLabel: (doc) => emit([doc.application, doc.label], doc), // eslint-disable-line no-undef, max-len
    },
};
