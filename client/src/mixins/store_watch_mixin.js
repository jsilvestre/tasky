"use strict";

export const StoreWatchMixin = function(stores) {
    return {
        componentDidMount: function componentDidMount() {
            stores.forEach(store => {
                store.on("change", this._setStateFromStores);
            });
        },

        componentWillUnmount: function componentWillUnmount() {
            stores.forEach(store => {
                store.removeListener("change", this._setStateFromStores);
            });
        },

        getInitialState: function getInitialState() {
            return this.getStateFromStores();
        },

        _setStateFromStores: function _setStateFromStores() {
            this.setState(this.getStateFromStores());
        }
    };
};
