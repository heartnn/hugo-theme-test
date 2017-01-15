var gulp = require('gulp');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');

var paths = {
    postcss: 'static/postcss/index.css',
    postcssdest: 'static/postcss',
    css: 'static/css/index.css',
    cssdest: 'static/css',
    cssmin: 'static/css/index.min.css'
};

gulp.task('clean', function () {
    return del(['static/css', 'npm-debug.log']);
});

gulp.task('compile', function () {
    return gulp.src(paths.postcss)
        .pipe(sourcemaps.init())
        .pipe(postcss([
            require('precss')({}),
            require('autoprefixer')({})
        ]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.cssdest));
});

gulp.task('watch', function () {
    gulp.watch('static/postcss/**/*.css', ['clean', 'compile']);
});

gulp.task('build', ['clean', 'compile']);
gulp.task('dev', ['clean', 'compile', 'watch']);