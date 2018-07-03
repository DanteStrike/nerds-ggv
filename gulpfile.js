'use strict';

let gulp = require('gulp');
let watch = require('gulp-watch');
let browserSync = require('browser-sync');
let reload = browserSync.reload;
let cssMin = require('gulp-clean-css');
let jsMin = require('gulp-uglify');
let autoPrefixer = require('gulp-autoprefixer');
let rimraf = require('rimraf');

let path = {
    build: {
        html: 'build/',
        img: 'build/img/',
        css: 'build/css/',
        js: 'build/js/'
    },
    src: {
        html: 'src/*.html',
        img: 'src/img/*.*',
        css: 'src/blocks/**/*.css',
        js: 'src/blocks/**/*.js'
    },
    clean: './build'
};

let config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Devil"
};

gulp.task('html:build', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(jsMin()) //Сожмем наш js
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

gulp.task('css:build', function () {
    gulp.src(path.src.css) //Выберем наш css
        .pipe(autoPrefixer()) //Добавим вендорные префиксы
        .pipe(cssMin()) //Сожмем
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));
});

gulp.task('build', [
    'html:build',
    'js:build',
    'css:build',
    'image:build'
]);

gulp.task('watch', function(){
    watch([path.src.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.src.css], function(event, cb) {
        gulp.start('css:build');
    });
    watch([path.src.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.src.img], function(event, cb) {
        gulp.start('image:build');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);

