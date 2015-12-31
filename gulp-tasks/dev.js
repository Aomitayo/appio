'use strict';

require('colors');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence').use(gulp);
var beep = require('beepbeep');

// Lint JavaScript
gulp.task('lint', function () {
	return gulp.src('src/**/*.js')
	.pipe($.jshint('.jshintrc'))
	.pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('test', function () {
	var testProcess = $.spawnMocha({
		t: 8000,
		R: 'spec'
	})
	.once('error', function () {
		beep(2);
		$.util.log('Looks like we have a problem'.bold.red);
		this.error = true;
		this.emit('end');
	})
	.once('end', function(){
		if(!this.error){beep();}
	});

	return gulp.src('tests/specs/**/*.js')
	.pipe(testProcess);
});

function bumpVersion(versionType){
	return function(){
		gulp.src(['./bower.json', './package.json'])
			.pipe($.bump({type:versionType}))
			.pipe(gulp.dest('./'));
	};
}
gulp.task('bump:patch', bumpVersion('patch'));
gulp.task('bump:minor', bumpVersion('minor'));
gulp.task('bump:major', bumpVersion('major'));


// Watch Files For Changes & rerun tests
gulp.task('watch', function () {
  gulp.watch(['src/**/*.js'], ['lint', 'test']);
  gulp.watch(['tests/**/*.js'], ['test']);
});


// Start a coding session: 
//	- prepare the development environment
//	- run code check
//	- run tests
//	- watch for changes to source code and tests, react accordingly
//	- Cleanup/destory the development environment when the coding session is ends
gulp.task('dev', function(callback){
	return runSequence('lint', 'test', 'watch', callback);
});

