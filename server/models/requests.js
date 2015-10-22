import americano from 'americano';

export default {
    tasky: {
        all: americano.defaultRequests.all,
        byArchiveState: americano.defaultRequests.by('isArchived'),
        byOrder: (doc) => {
            if (!doc.isArchived) {
                emit(doc.order, doc);
            }
        },
    },

    favorite_tag: {
        allByApp: americano.defaultRequests.by('application'),
        byAppByLabel: (doc) => emit([doc.application, doc.label], doc),
    },
};
