var gulp         = require('gulp'),
    browserSync  = require('browser-sync'),
    sass         = require('gulp-ruby-sass'),
    // libsass      = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    jade         = require('gulp-jade'),
    notify       = require('gulp-notify'),
    plumber      = require('gulp-plumber'),
    changed      = require('gulp-changed'),
    imagemin     = require('gulp-imagemin'),
    spritesmith  = require('gulp.spritesmith'),
    reload       = browserSync.reload;


// start webserver with livereload
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'build',
            index: 'index.html'
        },
        files: ["build/css/*.css", "build/**.*.html", "build/js/**/*.js"],
        port: 3000,
        open: false,
        ghostMode: false,
        notify: false
    });
});

// generate sprite
gulp.task('sprite', function () {
    var spriteData = gulp.src('source/img/icons/*.png')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(spritesmith({
        imgName: 'icons.png',
        cssName: '_sprite.sass',
        imgPath: '../img/icons.png',
        cssFormat: 'sass',
        padding: 10,
        cssTemplate: 'sprite.template.mustache'
    }));
    spriteData.img
        .pipe(gulp.dest('build/img'));
    spriteData.css
        .pipe(gulp.dest('source/sass'));
});

// compile sass
gulp.task('sass', function() {
    return gulp.src('source/sass/**/*.sass')
        .pipe(plumber({errorHandler: notify.onError(function(error){return error.message;})}))
        .pipe(sass({
            style: 'compact',
            'sourcemap=none': true
        }))
        .pipe(autoprefixer({
            browsers: ['last 5 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('build/css'));
});

// compile jade
gulp.task('jade', function() {
    return gulp.src('source/jade/**/*.jade')
        .pipe(plumber({errorHandler: notify.onError(function(error){return error.message;})}))
        .pipe(changed('build', {extension: '.html'}))
        .pipe(jade({pretty: true}))
        .pipe(gulp.dest('build'));
});

// optimize images
gulp.task('imagemin', function() {
    gulp.src(['source/img/**/*', '!source/img/icons/**'])
        .pipe(imagemin())
        .pipe(gulp.dest('build/img'));
});

// watch files and run tasks
gulp.task('watch', function() {
    // gulp.watch('source/sass/**/*.sass', ['compass']);
    gulp.watch('source/sass/**/*.sass', ['sass']);
    // gulp.watch('build/css', ['prefix']);
    // gulp.watch('source/js/**/.js', ['tasks']);
    // gulp.watch('source/img/*', ['imagemin']);
    gulp.watch('source/img/icons/*', ['sprite']);
    gulp.watch('source/jade/**/*.jade', ['jade']);
});

gulp.task('default',['browser-sync','watch'], function() {});