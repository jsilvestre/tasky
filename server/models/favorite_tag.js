"use strict";

import * as americano from "americano";

import * as hasValue from "../hasValue";

export const FavoriteTag = americano.getModel("FavoriteTag", {
    "label": String,
    "application": String
});

FavoriteTag.allForTasky = function(callback) {
    FavoriteTag.request("allByApp", {key: "tasky"}, (err, tags) => {
        err = err || tags.error;
        if(hasValue(err)) {
            callback(err);
        }
        else {
            const labels = tags.map(tag => tag.label);
            callback(null, labels);
        }
    });
};

FavoriteTag.ByLabelForTasky = function(label, callback) {
    const options = {
        key: ["tasky", label]
    };
    FavoriteTag.request("byAppByLabel", options, callback);
};
