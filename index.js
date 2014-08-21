var task = require('bud');

task('default', task.once('push'));

task('add', function(t) {
  t.exec('git add .').then(t.done);
});

task('commit', task.once('add'), function(t) {
  if (!t.params.msg) t.params.msg = 'update';
  t.exec("git commit -m '{msg}'", t.params).then(t.done);
});

task('push', task.once('commit'), function(t) {
  t.exec("git push").then(t.done);
});