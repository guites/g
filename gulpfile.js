'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));

function buildStyles() {
  return gulp.src('./src/assets/sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./src/assets/css'));
};

exports.buildStyles = buildStyles;
exports.watch = function () {
  gulp.watch('./src/assets/sass/*.scss', gulp.series('buildStyles'));
};
