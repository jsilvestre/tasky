import americano from 'americano';
import errorHandler from 'errorhandler';
import fs from 'fs';
import path from 'path';

// Detect if it should use the precompiled jade or the raw jade.
const builtViewPath = path.resolve(__dirname, '../client/index.js');
const viewEngine = fs.existsSync(builtViewPath) ? 'js' : 'jade';

module.exports = {
    common: {
        use: [
            americano.bodyParser(),
            americano.methodOverride(),
            americano.static(
                path.resolve(__dirname, '../client/public'),
                {maxAge: 86400000}
            ),
        ],

        set: {
            'view engine': viewEngine,
            'views': path.resolve(__dirname, '../client/'),
        },

        engine: {
            // Allow res.render of .js files (pre-rendered jade)
            js: (filePath, locals, callback) => {
                callback(null, require(filePath)(locals));
            },
        },

        afterStart: (app) => {
            app.use(errorHandler());
        },
    },

    development: [
        americano.logger('dev'),
    ],

    production: [
        americano.logger('short'),
    ],

    plugins: [
        'cozydb',
    ],
};
