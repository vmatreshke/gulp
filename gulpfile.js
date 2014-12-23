var gulp         = require('gulp'),
    browserSync  = require('browser-sync'),
    sass         = require('gulp-ruby-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
    jade         = require('gulp-jade'),
    notify       = require('gulp-notify'),
    plumber      = require('gulp-plumber'),
    changed      = require('gulp-changed'),
    imagemin     = require('gulp-imagemin'),
    spritesmith  = require('gulp.spritesmith'),
    autoprefixer = require('autoprefixer-core'),
    postcss      = require('gulp-postcss');


//** src paths **
var src = {
    root    : 'source',
    jade    : 'source/jade/',
    sass    : 'source/sass/',
    js      : 'source/js/',
    img     : 'source/img/',
    helpers : 'source/helpers/'
};

//** dest paths **
var dest = {
    root : 'build',
    html : 'build',
    css  : 'build/css',
    js   : 'build/js',
    img  : 'build/img'
};


// start webserver with livereload
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: dest.root
            // index: 'index.html'
        },
        files: [ dest.css + '/*.css', dest.html + '/*.html', dest.js + '/*.js'],
        port: 3000,
        open: false,
        ghostMode: false,
        notify: false
    });
});

// generate sprite
gulp.task('sprite', function() {
    var spriteData = gulp.src(src.img + 'icons/*.png')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(spritesmith({
        imgName: 'icons.png',
        cssName: '_sprite.scss',
        imgPath: '../img/icons.png',
        cssFormat: 'sass',
        padding: 10,
        cssTemplate: src.helpers + 'sprite.template.mustache'
    }));
    spriteData.img
        .pipe(gulp.dest(dest.img));
    spriteData.css
        .pipe(gulp.dest(src.sass));
});

// compile sass with ruby-sass
gulp.task('sass', function() {
    return gulp.src(src.sass + '**/*.sass')
        .pipe(plumber({errorHandler: notify.onError(function(error){return error.message;})}))
        .pipe(sass({
            style: 'compact',
            'sourcemap=none': true
        }))
        .pipe(postcss([
            autoprefixer({ browsers: ['last 2 version'], cascade: false})
        ]))
        .pipe(gulp.dest(dest.css));
});

// compile jade
gulp.task('jade', function() {
    return gulp.src(src.jade + '**/*.jade')
        .pipe(plumber({errorHandler: notify.onError(function(error){return error.message;})}))
        .pipe(changed(dest.html, {extension: '.html'}))
        .pipe(jade({pretty: true}))
        .pipe(gulp.dest(dest.html));
});

// optimize images
gulp.task('imagemin', function() {
    gulp.src([src.img, !src.img + 'icons/**'])
        .pipe(imagemin())
        .pipe(gulp.dest(dest.img));
});

// watch files and run tasks
gulp.task('watch', function() {
    // gulp.watch(src.sass + '/**/*.sass', ['compass']);
    gulp.watch(src.sass + '**/*.sass', ['sass']);
    // gulp.watch(src.sass + '/**/*.sass', ['libsass']);
    // gulp.watch(dest.css, ['prefix']);
    // gulp.watch(src.js + '//**/.js', ['tasks']);
    // gulp.watch(src.img, ['imagemin']);
    gulp.watch(src.img + 'icons/*', ['sprite']);
    gulp.watch(src.jade + '**/*.jade', ['jade']);
});

gulp.task('build', ['jade', 'sass', 'sprite'], function() {});

gulp.task('default', ['browser-sync', 'watch'], function() {});