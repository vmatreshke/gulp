var gulp         = require('gulp'),
    browserSync  = require('browser-sync'),
    sass         = require('gulp-ruby-sass'),
    libsass      = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
    jade         = require('gulp-jade'),
    notify       = require('gulp-notify'),
    plumber      = require('gulp-plumber'),
    changed      = require('gulp-changed'),
    imagemin     = require('gulp-imagemin'),
    spritesmith  = require('gulp.spritesmith'),
    autoprefixer = require('autoprefixer-core'),
    postcss      = require('gulp-postcss');


//** paths **
var src = {
    root : 'source',
    jade : 'source/jade',
    sass : 'source/sass',
    js   : 'source/js',
    img  : 'source/img'
};

var dest = {
    root : 'build',
    html : 'build',
    css  : 'build/css',
    js   : 'build/js',
    img  : 'build/img'
};

var srcPath     = 'source',
    destPath    = 'build',

    htmlPath    = destPath,
    cssPath     = destPath + '/css',
    jsPath      = destPath + '/js',
    imgPath     = destPath + '/img',

    srcSassPath = srcPath + '/sass',
    srcJsPath   = srcPath + '/js',
    srcImgPath  = srcPath + '/img',
    srcJadePath = srcPath + '/jade',

    helpersPath = srcPath + '/helpers';


// start webserver with livereload
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: destPath
            // index: 'index.html'
        },
        files: [ cssPath + '/*.css', htmlPath + '/*.html', jsPath + '/*.js'],
        port: 3000,
        open: false,
        ghostMode: false,
        notify: false
    });
});

// generate sprite
gulp.task('sprite', function () {
    var spriteData = gulp.src(srcImgPath + '/icons/*.png')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(spritesmith({
        imgName: 'icons.png',
        cssName: '_sprite.sass',
        imgPath: '../img/icons.png',
        cssFormat: 'sass',
        padding: 10,
        cssTemplate: helpersPath + '/sprite.template.mustache'
    }));
    spriteData.img
        .pipe(gulp.dest(imgPath));
    spriteData.css
        .pipe(gulp.dest(srcSassPath));
});

// compile sass with libsass
gulp.task('libsass', function() {
    return gulp.src(src.sass + '/**/*.sass')
        .pipe(plumber({errorHandler: notify.onError(function(error){return error.message;})}))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(libsass({
            outputStyle: 'compressed',
            sourceComments: false
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(postcss([autoprefixer()]))
        .pipe(gulp.dest(dest.css));
});

// compile sass with ruby-sass
gulp.task('sass', function() {
    return gulp.src(src.sass + '/**/*.sass')
        .pipe(plumber({errorHandler: notify.onError(function(error){return error.message;})}))
        .pipe(sass({
            style: 'compact',
            'sourcemap=none': true
        }))
        .pipe(postcss([
            autoprefixer({ browsers: ['last 5 version'], cascade: true })
        ]))
        .pipe(gulp.dest(dest.css));
});

// compile jade
gulp.task('jade', function() {
    return gulp.src(srcJadePath + '/**/*.jade')
        .pipe(plumber({errorHandler: notify.onError(function(error){return error.message;})}))
        .pipe(changed(htmlPath, {extension: '.html'}))
        .pipe(jade({pretty: true}))
        .pipe(gulp.dest(htmlPath));
});

// optimize images
gulp.task('imagemin', function() {
    gulp.src([srcImgPath, !srcImgPath + '/icons/**'])
        .pipe(imagemin())
        .pipe(gulp.dest(imgPath));
});

// watch files and run tasks
gulp.task('watch', function() {
    // gulp.watch(srcSassPath + '/**/*.sass', ['compass']);
    // gulp.watch(srcSassPath + '/**/*.sass', ['sass']);
    gulp.watch(srcSassPath + '/**/*.sass', ['libsass']);
    // gulp.watch(cssPath, ['prefix']);
    // gulp.watch(srcJsPath + '//**/.js', ['tasks']);
    // gulp.watch(srcimgPath, ['imagemin']);
    gulp.watch(srcImgPath + '/icons/*', ['sprite']);
    gulp.watch(srcJadePath + '/**/*.jade', ['jade']);
});

gulp.task('default',['browser-sync','watch'], function() {});