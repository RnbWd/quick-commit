var Struct = require("new-struct");
var parallel = require("parallel-loop");
var glob = require("glob");
var minimatch = require("minimatch");
var debug = require("local-debug")('options');

var Options = Struct({
  New: New,
  expand: expand,
  watch: watch,
  ignore: ignore
});

module.exports = Options;

function New (obj) {
  return Options({
    _watch: obj && obj.watch || undefined,
    _ignore: obj && obj.ignore || undefined,
    _once: obj && obj.once || undefined
  });
}

function expand (options, callback) {
  if (!options._watch || !options._watch.length) return callback();
  if (options.files) return callback();

  debug('Expanding %s', options._watch.join(','));

  resolveFilePatterns(options._watch, function (error, filenames) {
    if (error) return callback(error);

    if (!options._ignore) {
      options.files = filenames;
      return callback();
    }

    options.files = filenames.filter(function (filename) {
      return options._ignore.every(function (pattern) {
        return !minimatch(filename, pattern);
      });
    });

    callback();
  });
}

function watch (options) {
  options._watch = Array.prototype.slice.call(arguments, 1);
  return options;
}

function ignore (options) {
  options._ignore = Array.prototype.slice.call(arguments, 1);
  return options;
}

function resolveFilePatterns (patterns, callback) {
  var result = [];

  parallel(patterns.length, each, function () {
    callback(undefined, result);
  });

  function each (done, index) {
    glob(patterns[index], function (error, files) {
      if (error) return done(error);
      result = result.concat(files);
      done();
    });
  }
}
