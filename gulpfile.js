const gulp = require("gulp");
const jasmine = require("gulp-jasmine");

gulp.task("test", () =>gulp.src("tests/*.js").pipe(jasmine()));