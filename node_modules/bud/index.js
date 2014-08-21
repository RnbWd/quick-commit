var fs = require("fs");
var Task = require("./lib/task");
var Options = require("./lib/options");

process.nextTick(function () {
  require('./lib/cli');
});

module.exports = create;
module.exports.watch = watch;
module.exports.files = watch;
module.exports.ignore = ignore;
module.exports.once = once;
module.exports.write = write;

function create (name) {
  return Task.New.apply(undefined, arguments);
}

function watch () {
  return Options.New({
    watch: Array.prototype.slice.call(arguments)
  });
}

function ignore () {
  return Options.New({
    ignore: Array.prototype.slice.call(arguments)
  });
}

function write (filename) {
  return fs.createWriteStream(filename);
}

function once () {
  return Options.New({
    once: Array.prototype.slice.call(arguments)
  });
}
