var gulp = require('gulp');
var imageResize = require('gulp-image-resize');
const imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync');
var rename = require("gulp-rename");
var del = require('del');

gulp.task('watch', function () {
    browserSync({
        proxy: 'localhost:8080',
        port: 3000,
        open: false,
        notify: false
    });
    gulp.watch('../content/**/*.yaml', gulp.series('reload'));
    gulp.watch('../layouts/**/*.html.twig',  gulp.series('reload'));
    gulp.watch('./css/**/*.css',  gulp.series(['css','reload']));
    gulp.watch('./js/**/*.js',  gulp.series(['copy-scripts','reload']));
    gulp.watch('./img/**/*.*',  gulp.series(['resize-images','reload']));
});
gulp.task('reload', function () {
    return gulp.src('./').pipe(browserSync.reload({stream: true}))
});


const purgecss = require('@fullhuman/postcss-purgecss')({
    // Specify the paths to all of the template files in your project
    content: [
        '../layouts/**/*.html.twig',
    ],
    // Include any special characters you're using in this regular expression
    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
});
gulp.task('css', function () {
    const postcss = require('gulp-postcss');
    
    return gulp.src('css/app.css')
        .pipe(postcss([
            require('tailwindcss'),
            require('autoprefixer'),
            require('postcss-nested'),
            purgecss,
        ]))
        .pipe(gulp.dest('../public/build/css/'))
    
});

gulp.task('purifycss', function () {
    var purify = require('gulp-purify-css');
    return gulp.src('../public/build/css/app.css')
        .pipe(purify(['../layouts/**/*.html.twig']))
        .pipe(rename(function (path) { path.basename += "-min"; }))
        .pipe(gulp.dest('../public/build/css/'));
    
});

gulp.task('copy-font',function () {
    return gulp.src(['fonts/**/*'])
        .pipe(gulp.dest('../public/build/fonts/'));
});
gulp.task('copy-file',function () {
    return gulp.src(['files/**/*'])
        .pipe(gulp.dest('../public/build/files/'));
});


gulp.task('copy-scripts',function () {
    return gulp.src(['js/**/*'])
        .pipe(gulp.dest('../public/build/js/'));
});



gulp.task('resize-xl', function () {
    return gulp.src([
        'img/**/*.*',
        '!img/png/',
        '!img/png/**',
    ])
        .pipe(imageResize({
            format: "jpg",
            width: 1920,
        }))
        .pipe(imagemin())
        
        .pipe(rename(function (path) { path.basename += "_xl"; }))
        .pipe(gulp.dest('../public/build/img/'))
});
gulp.task('resize-lg', function () {
    return gulp.src([
        'img/**/*.*',
        '!img/png/',
        '!img/png/**',
    ])
        .pipe(imageResize({
            format: "jpg",
            width: 1280,
        }))
        .pipe(imagemin())
        
        .pipe(rename(function (path) { path.basename += "_lg"; }))
        .pipe(gulp.dest('../public/build/img/'))
});
gulp.task('resize-md', function () {
    return gulp.src([
        'img/**/*.*',
        '!img/png/',
        '!img/png/**',
        '!img/background/',
        '!img/background/**',
    ])
        .pipe(imageResize({
            format: "jpg",
            width: 1024,
        }))
        .pipe(imagemin())
        
        .pipe(rename(function (path) { path.basename += "_md"; }))
        .pipe(gulp.dest('../public/build/img/'))
});
gulp.task('resize-sm', function () {
    return gulp.src([
        'img/**/*.*',
        '!img/png/',
        '!img/png/**',
        '!img/background/',
        '!img/background/**',
    ])
        .pipe(imageResize({
            format: "jpg",
            width: 768,
        }))
        .pipe(imagemin())
        
        .pipe(rename(function (path) { path.basename += "_sm"; }))
        .pipe(gulp.dest('../public/build/img/'))
    
});
gulp.task('resize-background-sm', function () {
    return gulp.src([
        'img/background/**/*.*',
    
    ])
        .pipe(imageResize({
            format: "jpg",
            width: 1024,
            height: 1024,
            crop: true,
        }))
        .pipe(imagemin())
        
        .pipe(rename(function (path) { path.basename += "_sm"; }))
        .pipe(gulp.dest('../public/build/img/background/'))
    
});
gulp.task('resize-background-md', function () {
    return gulp.src([
        'img/background/**/*.*',
    
    ])
        .pipe(imageResize({
            format: "jpg",
            width: 768,
            height: 1000,
            crop: true,
        }))
        .pipe(imagemin())
        
        .pipe(rename(function (path) { path.basename += "_md"; }))
        .pipe(gulp.dest('../public/build/img/background/'))
    
});

gulp.task('resize-logo', function () {
    return gulp.src([
        'img/png/**/*.*',
    ])
        .pipe(imageResize({
            format: "png",
            height: 500,
        }))
        .pipe(imagemin())
        
        .pipe(rename(function (path) { path.basename+='' }))
        .pipe(gulp.dest('../public/build/img'))
});
gulp.task('resize-favicon', function () {
    return gulp.src([
        'img/favicon/*.*',
    ])
        .pipe(imageResize({
            format: "png",
            width: 100,
        }))
        .pipe(imagemin())
        
        .pipe(rename(function (path) { path.basename+='' }))
        .pipe(gulp.dest('../public/build/img'))
});
gulp.task('clean', function(){
    return del('../public/build/**', {force:true});
});

gulp.task('resize-images',gulp.parallel ('resize-xl','resize-lg','resize-md','resize-sm','resize-logo','resize-favicon','resize-background-sm','resize-background-md'));
gulp.task('build',gulp.series ('clean','css','copy-font','copy-file','copy-scripts','resize-images'));

