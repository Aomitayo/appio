'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var runSequence = require('run-sequence');

// Load custom tasks from the `gulp-tasks` directory
try {require('require-dir')('gulp-tasks'); } catch(err){console.log(err.stack);}

// lint and test microservice, the Default Task
gulp.task('default', [], function (cb) {
  runSequence('lint', 'test', cb);
});



