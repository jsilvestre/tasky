'use strict';

var _americano = require('americano');

var _americano2 = _interopRequireDefault(_americano);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
    tasky: {
        all: _americano2.default.defaultRequests.all,
        byArchiveState: _americano2.default.defaultRequests.by('isArchived'),
        byOrder: function byOrder(doc) {
            if (!doc.isArchived) {
                emit(doc.order, doc); // eslint-disable-line no-undef
            }
        }
    },

    favorite_tag: {
        allByApp: _americano2.default.defaultRequests.by('application'),
        byAppByLabel: function byAppByLabel(doc) {
            return emit([doc.application, doc.label], doc);
        } }
};