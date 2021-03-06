'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var bourbon = require('node-bourbon');
var neat = require('node-neat');
var del = require('del');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var transform = require('vinyl-transform');
var assign = require('lodash').assign;

var TASKS = {
    WATCH: 'watch',
    BUILD: 'build',
    CLEAN: 'clean',
    JS: {
        WATCH : 'js-watch',
        BUILD: 'js-build'
    },
    CSS : {
        DEFAULT: 'scss',
        WATCH: 'scss_watch',
        BUILD: 'scss_build'
    }
};

var DIST = {
    CSS : './www/dist/css',
    JS : './www/dist/js',
    JS_FILE : 'bundle.js',
    JS_FILE_MIN: 'bundle.js'
};

var SRC = {
    SCSS : './src/scss/**/*.scss',
    JS_START : './src/js/app.js'
};


/**
 * Creates a watchify JS build task
 *
 * @param taskName
 * @param srcFile
 * @param targetFile
 * @param targetDirectory
 */
function createWatchifyTask(taskName, srcFile, targetFile, targetDirectory)
{
    // add custom browserify options here
    var customOpts = {
        entries: [srcFile],
        paths: ['./node_modules', SRC.PATH],
        debug: true
    };

    var opts = assign({}, watchify.args, customOpts);
    var b = watchify(browserify(opts));

    function jsWatchBundle()
    {
        return b.bundle()
            // log errors if they happen
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source(targetFile))
            // optional, remove if you don't need to buffer file contents
            .pipe(buffer())
            // optional, remove if you dont want sourcemaps
            .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
            // Add transformation tasks to the pipeline here.
            .pipe(sourcemaps.write()) // writes .map file
            .pipe(gulp.dest(targetDirectory));
    }

    // add transformations here
    //  i.e. b.transform(coffeeify);
    gulp.task(taskName, jsWatchBundle); // so you can run `gulp js` to build the file
    b.on('update', jsWatchBundle); // on any dep update, runs the bundler
    b.on('log', gutil.log); // output build logs to terminal
}

/**
 * Creates a browserify build task
 *
 * @param taskName
 * @param srcEntries
 * @param bundleFile
 * @param targetDirectory
 */
function gulpBrowserifyBuild(taskName, srcEntries, bundleFile, targetDirectory)
{
    gulp.task(taskName, function () {
        // set up the browserify instance on a task basis
        var b = browserify({
            entries: srcEntries,
            paths: ['./node_modules', SRC.PATH],
            debug: true
        });

        return b.bundle()
            .pipe(source(bundleFile))
            .pipe(buffer())
            .pipe(uglify({compress: { drop_console: true }}))
            .on('error', gutil.log)
            .pipe(gulp.dest(targetDirectory));
    });
}

// Create the JS build and watch tasks:
gulpBrowserifyBuild(TASKS.JS.BUILD, SRC.JS_START, DIST.JS_FILE_MIN, DIST.JS);

createWatchifyTask(TASKS.JS.WATCH, SRC.JS_START, DIST.JS_FILE, DIST.JS);

// ================ CSS TASKS =================

gulp.task(TASKS.CSS.DEFAULT, function () {
    return gulp.src(SRC.SCSS)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: require('node-neat').with('node-bourbon')
        }).on('error', sass.logError))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(DIST.CSS));
});

gulp.task(TASKS.CSS.BUILD, function () {
    return gulp.src(SRC.SCSS)
        .pipe(sass({
            includePaths: require('node-neat').with('node-bourbon')
        }).on('error', sass.logError))
        .pipe(gulp.dest(DIST.CSS));
});

gulp.task(TASKS.CSS.WATCH, [TASKS.CSS.DEFAULT], function () {
    gulp.watch(SRC.SCSS, [TASKS.CSS.DEFAULT]);
});

// ================ CSS TASKS END =================


// ================ CLEAR TASK  =================

gulp.task(TASKS.CLEAN, function () {
    return del( [DIST.JS, DIST.CSS], {force: true} );
});

// ================  THIS ARE THE IMPORTANT TASKS !!! ================

// WATCH TASK for js and scss
gulp.task (TASKS.WATCH, [TASKS.CLEAN, TASKS.JS.WATCH, TASKS.CSS.WATCH]);

// BUILD TASK for js and scss
gulp.task (TASKS.BUILD, [TASKS.CLEAN,  TASKS.JS.BUILD, TASKS.CSS.BUILD]);

// ==================================================================== 