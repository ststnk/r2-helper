var gulp   = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');
    
gulp.task('dependencies', function() {
  return gulp.src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/ajaxq/ajaxq.js',
    'node_modules/underscore/underscore.js',
    'node_modules/backbone/backbone.js',
    'node_modules/backbone.marionette/lib/backbone.marionette.js'
  ])
  .pipe(uglify())
  .pipe(concat('dependencies.min.js'))
  .pipe(gulp.dest('r2-helper'))
});