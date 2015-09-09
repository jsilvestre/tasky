"use strict";
import * as path from "path";
import * as americano from "americano";

export const config = {
    common: {
        use: [
            americano.bodyParser(),
            americano.methodOverride(),
            americano.errorHandler({
                dumpExceptions: true,
                showStack: true
            }),
            americano.static(
                path.resolve(__dirname, "../client/public"),
                {maxAge: 86400000}
            )
        ],
        set: {
            views: path.resolve(__dirname, "../client")
        },

        engine: {
            // Allows res.render of .js files (pre-rendered jade)
            js: function(filePath, locals, callback) {
                callback(null, require(filePath)(locals));
            }
        }
    },

    development: [
        americano.logger("dev")
    ],

    production: [
        americano.logger("short")
    ],

    plugins: [
        "americano-cozy"
    ]
};
