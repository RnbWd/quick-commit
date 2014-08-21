var path = require("path");
var fs = require("fs");

packagePath.sync = function (filename) {
  return sync(path.dirname(filename));
};

module.exports = packagePath;

function packagePath (filename, callback) {
  return async(path.dirname(filename), callback);
}

function async (dir, callback) {
  var pdir;

  fs.exists(path.join(dir, 'package.json'), function (exists) {
    if (exists) return callback(dir);

    pdir = path.join(dir, '../');

    if (dir == pdir) {
      return callback();
    }

    async(pdir, callback);
  });
}

function sync (dir) {
  if (fs.existsSync(path.join(dir, 'package.json'))) {
    return dir;
  }

  var pdir = path.join(dir, '../');

  if (dir == pdir) return;

  return sync(pdir);
}
