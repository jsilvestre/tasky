'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _americano = require('americano');

var _americano2 = _interopRequireDefault(_americano);

exports['default'] = {
    tasky: {
        all: _americano2['default'].defaultRequests.all,
        byArchiveState: _americano2['default'].defaultRequests.by('isArchived'),
        byOrder: function byOrder(doc) {
            if (!doc.isArchived) {
                emit(doc.order, doc);
            }
        }
    },

    favorite_tag: {
        allByApp: _americano2['default'].defaultRequests.by('application'),
        byAppByLabel: function byAppByLabel(doc) {
            return emit([doc.application, doc.label], doc);
        }
    }
};
module.exports = exports['default'];