var gulp = require('gulp');
var del = require('del');
var plugins = require('gulp-load-plugins')({ pattern: '*' });
var paths = {
    images: {
        dev: "dev/images/**/*.{png,svg,jpg,gif,jpeg}",
        prod: "production/images"
    },
    styles: {
        dev: "dev/sass/**/*.{css,scss}",
        prod: "production/css"
    },
    html: {
        dev: "dev/**/*.html",
        prod: "production"
    },
    js: {
        dev: "dev/js/**/*.js",
        prod: "production/js"
    },
    dev: "dev",
    prod: "production"
};
// images
gulp.task('images', function() {
    return gulp.src(paths.images.dev)
        .pipe(plugins.cache(plugins.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(gulp.dest(paths.images.prod))
        .pipe(plugins.notify({ message: 'Images Complete' }));
});
// styles
gulp.task('styles', function() {
    return gulp.src(paths.styles.dev)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer({ browsers: ['ie >= 10', 'android >= 4.1'] }))
        .pipe(plugins.rename({ suffix: '.min' }))
        .pipe(plugins.csso())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(paths.styles.prod))
        .pipe(plugins.browserSync.stream())
        .pipe(plugins.notify({ message: 'Styles Complete' }));
});
// html
gulp.task('html', function() {
    return gulp.src(paths.html.dev)
        .pipe(plugins.minifyHtml())
        .pipe(gulp.dest(paths.html.prod))
        .pipe(plugins.browserSync.stream())
        .pipe(plugins.notify({ message: 'HTML Complete'  }));
});
// scripts
gulp.task('scripts', function(cb) {
    return gulp.src(paths.js.dev)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.uglify())
        .pipe(plugins.rename({ suffix: '.min' }))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(paths.js.prod))
        .pipe(plugins.browserSync.stream())
        .pipe(plugins.notify({ message: 'Scripts Complete ' }));
});
// lint
gulp.task('lint', function() {
    return gulp.src([paths.js.dev, '!node_modules/**'])
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format())
        //.pipe(plugins.eslint.failAfterError())
        .pipe(plugins.notify({ message: 'Lint task complete' }));
});
// clean
gulp.task('clean', plugins.del.bind(null, [paths.prod], { dot: true }));
// watch
gulp.task('watch', ['lint', 'images', 'styles', 'html', 'scripts'], function() {
    plugins.browserSync({ notify: false, server: paths.prod });
    gulp.watch("dev/sass/**/*.{css,scss}", ['styles', plugins.browserSync.reload]);
    gulp.watch("dev/images/**/*.{png,jpg,jpeg,gif,svg}", ['images', plugins.browserSync.reload]);
    gulp.watch("dev/**/*.html", ['html', plugins.browserSync.reload]);
    gulp.watch("dev/js/**/*.js", ['lint', 'scripts', plugins.browserSync.reload]);
});
// build
gulp.task('build', ['clean'], function(callback) {
    plugins.runSequence(['lint', 'images', 'styles', 'html', 'scripts'], callback);
});
// serve
gulp.task('serve', ['watch']);