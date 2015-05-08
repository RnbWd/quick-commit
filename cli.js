#!/usr/bin/env node
'use strict';
var spawn = require('child_process').spawn;
var input = process.argv.slice(2);
var cmd = require('./').concat(input);
console.log(cmd);
spawn('bash', cmd, {stdio: 'inherit'})
  .on('exit', process.exit);
