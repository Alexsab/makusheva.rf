// VARIABLES & PATHS
let preprocessor = 'sass', // Preprocessor (sass, scss, less, styl)
    fileswatch   = 'html,htm,txt,json,md,woff2,php', // List of files extensions for watching & hard reload (comma separated)
    pageversion  = 'html,htm,php', // List of files extensions for watching change version files (comma separated)
    imageswatch  = 'jpg,jpeg,png,webp,svg', // List of images extensions for watching & compression (comma separated)
    online       = true, // If «false» - Browsersync will work offline without internet connection
    basename     = require('path').basename(__dirname),
    forProd      = [
					'/**',
					' * @author Alexsab.ru',
					' */',
					''].join('\n');

const { src, dest, parallel, series, watch, task } = require('gulp'),
	sass           = require('gulp-sass')(require('sass')),
	cleancss       = require('gulp-clean-css'),
	concat         = require('gulp-concat'),
	browserSync    = require('browser-sync').create(),
	uglify         = require('gulp-uglify-es').default,
	autoprefixer   = require('gulp-autoprefixer'),
	newer          = require('gulp-newer'),
	rsync          = require('gulp-rsync'),
	del            = require('del'),
	connect        = require('gulp-connect-php'),
	header         = require('gulp-header'),
	notify         = require('gulp-notify'),
	rename         = require('gulp-rename'),
	merge          = require('merge-stream'),
	// version        = require('gulp-version-number'),
	// revAll         = require('gulp-rev-all'),
	replace        = require('gulp-replace');

if(typeof projects == 'undefined') 
	global.projects = {};
if(typeof port == 'undefined') 
	global.port = 8100;


projects.makusheva = {

	port: ++port,

	base: basename,
	dest: basename,

	styles: {
		src:	basename + '/' + preprocessor + '/style.'+preprocessor,
		watch:    basename + '/' + preprocessor + '/**/*.'+preprocessor,
		dest:   basename + '/css',
		output: 'styles.min.css',
	},

	scripts: {
		src: [
			basename + '/js/scripts.js', // Custom scripts. Always at the end
		],
		dest:       basename + '/js',
		output:     'scripts.min.js',
	},

	code: {
		src: [
			basename  + '/**/*.{' + fileswatch + '}',
		],
	},

	forProd: [
		'/**',
		' * @author https://github.com/alexsab',
		' */',
		''].join('\n'),
}



/* makusheva BEGIN */

// Local Server
function makusheva_browsersync() {
	connect.server({
		port: projects.makusheva.port,
		base: projects.makusheva.base,
	}, function (){
		browserSync.init({
			// server: { baseDir: projects.makusheva.base + '/' },
			proxy: '127.0.0.1:' + projects.makusheva.port,
			notify: false,
			online: online
		});
	});
};

// Custom Styles
function makusheva_styles() {
	return src(projects.makusheva.styles.src)
	.pipe(eval(preprocessor)({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(concat(projects.makusheva.styles.output))
	.pipe(autoprefixer({ grid: true, overrideBrowserslist: ['last 10 versions'] }))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Optional. Comment out when debugging
	.pipe(dest(projects.makusheva.styles.dest))
	.pipe(browserSync.stream())

};

// Scripts & JS Libraries
function makusheva_scripts() {
	return src(projects.makusheva.scripts.src)
	.pipe(concat(projects.makusheva.scripts.output))
	.pipe(uglify()) // Minify js (opt.)
	.pipe(header(projects.makusheva.forProd))
	.pipe(dest(projects.makusheva.scripts.dest))
	.pipe(browserSync.stream())
};

function makusheva_watch() {
	watch(projects.makusheva.styles.watch, makusheva_styles);
	watch(projects.makusheva.scripts.src, makusheva_scripts);

	watch(projects.makusheva.code.src).on('change', browserSync.reload);
};

exports.makusheva = parallel(makusheva_styles, makusheva_scripts, makusheva_browsersync, makusheva_watch);


/* makusheva END */
