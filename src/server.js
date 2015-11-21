import americano from 'americano';

// Define the function to boot the application's HTTP server.
export const boot = function boot(callback) {
    const options = {
        name: 'tasky',
        root: __dirname,
        port: process.env.PORT || 9250,
        host: process.env.HOST || '127.0.0.1',
    };

    americano.start(options, callback);
};

/*
 If it's not loaded from another module (i.e. not loaded from tests), it's
 executed so the application actually starts.
*/
if (!module.parent) {
    boot();
}
