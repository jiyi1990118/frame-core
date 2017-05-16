/**
 * Created by xiyuan on 17-5-10.
 */
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
//美化代码
var prettify = require('gulp-jsbeautifier');
//压缩js代码
var uglify = require('gulp-uglify');

//压缩任务
gulp.task('min', function () {
    return browserify('./src/vf.js')
        .bundle()
        .pipe(source('vf.min.js'))
        .pipe(buffer())
        .pipe(uglify({
            mangle: {except: ['require', 'exports', 'module', '$']},//排除混淆关键字类型：Boolean 默认：true 是否修改变量名
            compress: true,//类型：Boolean 默认：true 是否完全压缩
            preserveComments:false, //'all' 保留所有注释
            fromString: true,
        }))
        .pipe(gulp.dest('./dist/'));
});

//代码美化任务
gulp.task('normal', function () {
    return browserify('./src/vf.js')
        .bundle()
        .pipe(source('vf.js'))
        .pipe(buffer())
        .pipe(prettify())
        .pipe(gulp.dest('./dist/'));
});

//任务监听
/*var watcher = gulp.watch('./src/!**!/!*.js', ['min','normal']);
watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
});*/

gulp.task('default', ['min','normal']);