const gulp = require("gulp"),
  sass = require("gulp-sass"),
  pug = require("gulp-pug"),
  browserSync = require("browser-sync").create(),
  concat = require("gulp-concat"),
  uglify = require("gulp-uglify-es").default,
  cleancss = require("gulp-clean-css"),
  autoprefixer = require("gulp-autoprefixer"),
  rsync = require("gulp-rsync"),
  newer = require("gulp-newer"),
  rename = require("gulp-rename"),
  responsive = require("gulp-responsive"),
  del = require("del");

// Local Server
gulp.task("browser-sync", function() {
  browserSync.init({
    server: {
      baseDir: "build"
    },
    notify: false
    // online: false, // Work offline without internet connection
    // tunnel: true, tunnel: 'projectname', // Demonstration page: http://projectname.localtunnel.me
  });
});
function bsReload(done) {
  browserSync.reload();
  done();
}

// Custom Styles
gulp.task("styles", function() {
  return gulp
    .src("src/sass/**/*.sass")
    .pipe(
      sass({
        outputStyle: "expanded",
        includePaths: [__dirname + "/node_modules"]
      })
    )
    .pipe(concat("styles.min.css"))
    .pipe(
      autoprefixer({
        grid: true,
        overrideBrowserslist: ["last 10 versions"]
      })
    )
    .pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // Optional. Comment out when debugging
    .pipe(gulp.dest("build/styles/"))
    .pipe(browserSync.stream());
});

// Scripts & JS Libraries
gulp.task("scripts", function() {
  return gulp
    .src([
      // 'node_modules/jquery/dist/jquery.min.js', // Optional jQuery plug-in (npm i --save-dev jquery)
      "src/js/_libs.js", // JS libraries (all in one)
      "src/js/_custom.js" // Custom scripts. Always at the end
    ])
    .pipe(concat("scripts.min.js"))
    .pipe(uglify()) // Minify js (opt.)
    .pipe(gulp.dest("build/scripts/"))
    .pipe(browserSync.reload({ stream: true }));
});

// Responsive Images
const quality = 95; // Responsive images quality

// Produce @1x images
gulp.task("img-responsive-1x", async function() {
  return gulp
    .src("src/img/_src/**/*.{png,jpg,jpeg,webp,raw}")
    .pipe(newer("src/img/@1x"))
    .pipe(
      responsive({
        "**/*": { width: "50%", quality: quality }
      })
    )
    .on("error", function(e) {
      console.log(e);
    })
    .pipe(
      rename(function(path) {
        path.extname = path.extname.replace("jpeg", "jpg");
      })
    )
    .pipe(gulp.dest("build/img/@1x"));
});
// Produce @2x images
gulp.task("img-responsive-2x", async function() {
  return gulp
    .src("src/img/_src/**/*.{png,jpg,jpeg,webp,raw}")
    .pipe(newer("src/img/@2x"))
    .pipe(
      responsive({
        "**/*": { width: "100%", quality: quality }
      })
    )
    .on("error", function(e) {
      console.log(e);
    })
    .pipe(
      rename(function(path) {
        path.extname = path.extname.replace("jpeg", "jpg");
      })
    )
    .pipe(gulp.dest("build/img/@2x"));
});
// gulp.task(
//   "img",
//   gulp.series("img-responsive-1x", "img-responsive-2x", bsReload)
// );

gulp.task("img", function() {
  return gulp
    .src("src/img/**/*.{png,jpg,jpeg,svg}")
    .pipe(gulp.dest("build/img/"));
});

// Clean @*x IMG's
gulp.task("cleanimg", function() {
  return del(["src/img/@*"], { force: true });
});

// Code & Reload
gulp.task("code", function() {
  return gulp.src("src/**/*.html").pipe(browserSync.reload({ stream: true }));
});

gulp.task("pug", function() {
  return gulp
    .src("./src/pug/*.pug")
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest("build"))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

gulp.task("fonts", function() {
  return gulp.src("./src/fonts/*.*").pipe(gulp.dest("build/fonts"));
});

// Deploy
gulp.task("rsync", function() {
  return gulp.src("src/").pipe(
    rsync({
      root: "src/",
      hostname: "username@yousite.com",
      destination: "yousite/public_html/",
      // include: ['*.htaccess'], // Included files
      exclude: ["**/Thumbs.db", "**/*.DS_Store"], // Excluded files
      recursive: true,
      archive: true,
      silent: false,
      compress: true
    })
  );
});

gulp.task("clean", function() {
  return del(["build"], { force: true });
});

gulp.task("watch", function() {
  gulp.watch("src/sass/**/*.sass", gulp.parallel("styles"));
  gulp.watch(
    ["src/js/_custom.js", "src/js/_libs.js"],
    gulp.parallel("scripts")
  );
  gulp.watch("src/**/*.pug", gulp.parallel("pug"));
  gulp.watch("src/img/**/*", gulp.parallel("img"));
});

gulp.task(
  "default",
  gulp.parallel(
    "img",
    "pug",
    "styles",
    "fonts",
    "scripts",
    "browser-sync",
    "watch"
  )
);
