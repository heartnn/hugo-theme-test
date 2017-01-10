var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

// 一次性编译
gulp.task('sass:build', function() {
    return gulp.src('static/scss/index.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('static/css'));
});

// 实时编译
gulp.task('sass:watch', ['sass:build'], function() {
    gulp.watch('static/scss/**/*.scss', ['sass:build']);
});