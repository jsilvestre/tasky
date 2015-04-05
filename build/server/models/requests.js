// Generated by CoffeeScript 1.9.1
var americano;

americano = require('americano');

module.exports = {
  tasky: {
    all: americano.defaultRequests.all,
    byArchiveState: function(doc) {
      return emit(doc.isArchived, doc);
    },
    byOrder: function(doc) {
      if (!doc.isArchived) {
        return emit(doc.order, doc);
      }
    }
  },
  cozy_instance: {
    all: americano.defaultRequests.all
  },
  favorite_tag: {
    allByApp: function(doc) {
      return emit(doc.application, doc);
    },
    byAppByLabel: function(doc) {
      return emit([doc.application, doc.label], doc);
    }
  }
};
