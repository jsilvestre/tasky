// Generated by CoffeeScript 1.9.1
var americano, application;

americano = require('americano');

application = module.exports = function(callback) {
  var options;
  options = {
    name: 'tasky',
    root: __dirname,
    port: process.env.PORT || 9250,
    host: process.env.HOST || '127.0.0.1'
  };
  return americano.start(options);
};

if (!module.parent) {
  application();
}
