var Struct = require("new-struct");

var debug = require("local-debug")('task');

var format = require("format-text");
var watchFiles = require("chokidar").watch;
var rightpad = require("right-pad");
var style = require("style-format");
var through = require("through");

var Options = require("./options");
var map = require("./map");
var run = require("./run");
var exec = require("./exec");

var Task = Struct({
  New: New,
  done: done,
  run: run,
  watch: watch,
  exec: exec
});

var colors = [
  'red',
  'green',
  'cyan',
  'magenta'
];

module.exports = Task;

function New (name, options, fn) {
  if (arguments.length == 2 && typeof options == 'function') {
    fn = options;
    options = Options.New();
  }

  debug('Created new task "%s"%s', name, options && options._watch ? (' watching ' + options._watch.join(',')) : '');

  var task = map.set(name, Task({
    name: name,
    key: map.slug(name),
    options: options,
    fn: fn,
    done: done,
    color: nextColor(),
    processes: [],
    params: {},
    info: info
  }));

  stdout();
  stderr();

  return task;

  function stdout () {
    if (task.stdout) {
      task.stdout.destroy();
    }

    task.stdout = std(task, stdout);
    task.stdout.pipe(process.stdout);
  }

  function stderr () {
    if (task.stderr) {
      task.stderr.destroy();
    }

    task.stderr = std(task, stderr);
    task.stderr.pipe(process.stderr);
  }
}

function std (task, callback) {
  return through(function (line) {
    this.queue(beautify(task, line));
  }, callback);
}

function done (task) {
  var diff = Date.now() - task.startTS;

  task.info(task, 'Completed in {0}', humanize(diff));

  task.onDone.publish();
  delete task.onDone;
  delete task.startTS;
}

function humanize (ms) {
  var sec = 1000;
  var min = 60 * 1000;
  var hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';

  return ms + 'ms';
};

function watch (task) {
  if (!task.files) return;

  debug('Watching changes on %s\'s files: %s (Total: %d files)', task.key, task.files.slice(0, 5).join(', '), task.files.length);

  var watcher = watchFiles(task.files, { persistent: true });

  watcher.on('change', delay(function () {
    debug('Restarting %s after the changes', task.key);
    task.run(false, true);
  }, 250));

  return watcher;
}

function nextColor () {
  if (colors.next == undefined)
    colors.next = 0;
  else
    colors.next++;

  return colors[colors.next % colors.length];
}

function delay (fn, ms) {
  var timer;

  return function () {
    if (timer != undefined) {
      clearTimeout(timer);
      timer = undefined;
    }

    timer = setTimeout(fn, ms);
  };
}

function info (task, message, context) {
  var text = format.apply(undefined, Array.prototype.slice.call(arguments, 1));
  var key = rightpad(task.key, map.len);
  console.log(style(format('    {' + task.color + '}' + key + '{reset}  {grey}' + text + '{reset}')));
}

function beautify (task, line) {
  var key = rightpad(task.key, map.len);

  return style(format('    {color}{key}{reset} {line}', {
    color: '{' + task.color + '}',
    line: line.toString(),
    key: key
  })) + '\n';
}
