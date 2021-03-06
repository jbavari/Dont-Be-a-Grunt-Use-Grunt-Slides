/* global module:false */
module.exports = function(grunt) {
	var port = grunt.option('port') || 8000;
	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner:
				'/*!\n' +
				' * reveal.js <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd, HH:MM") %>)\n' +
				' * http://lab.hakim.se/reveal-js\n' +
				' * MIT licensed\n' +
				' *\n' +
				' * Copyright (C) 2013 Hakim El Hattab, http://hakim.se\n' +
				' */'
		},

		qunit: {
			files: [ 'test/*.html' ]
		},

		uglify: {
			options: {
				banner: '<%= meta.banner %>\n'
			},
			build: {
				src: 'js/reveal.js',
				dest: 'js/reveal.min.js'
			}
		},

		cssmin: {
			compress: {
				files: {
					'css/reveal.min.css': [ 'css/reveal.css' ]
				}
			}
		},

		sass: {
			main: {
				files: {
					'css/theme/default.css': 'css/theme/source/default.scss',
					'css/theme/beige.css': 'css/theme/source/beige.scss',
					'css/theme/night.css': 'css/theme/source/night.scss',
					'css/theme/serif.css': 'css/theme/source/serif.scss',
					'css/theme/simple.css': 'css/theme/source/simple.scss',
					'css/theme/sky.css': 'css/theme/source/sky.scss',
					'css/theme/moon.css': 'css/theme/source/moon.scss',
					'css/theme/solarized.css': 'css/theme/source/solarized.scss',
					'css/theme/blood.css': 'css/theme/source/blood.scss'
				}
			}
		},

		jshint: {
			options: {
				curly: false,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				eqnull: true,
				browser: true,
				expr: true,
				globals: {
					head: false,
					module: false,
					console: false,
					unescape: false
				}
			},
			files: [ 'Gruntfile.js', 'js/reveal.js' ]
		},

		connect: {
			server: {
				options: {
					port: port,
					base: '.'
				}
			}
		},

		zip: {
			'reveal-js-presentation.zip': [
				'index.html',
				'css/**',
				'js/**',
				'lib/**',
				'images/**',
				'plugin/**'
			]
		},

		watch: {
			main: {
				files: [ 'Gruntfile.js', 'js/reveal.js', 'css/reveal.css' ],
				tasks: 'default'
			},
			edits: {
				files: [ 'css/editable.css' ],
				options: {
					livereload: 35729,
				}
			}
		}

	});

	// Dependencies
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-contrib-sass' );
	grunt.loadNpmTasks( 'grunt-contrib-connect' );
	grunt.loadNpmTasks( 'grunt-express' ); //Using this for get requests
	grunt.loadNpmTasks( 'grunt-zip' );

	// Default task
	grunt.registerTask( 'default', [ 'jshint', 'cssmin', 'uglify', 'qunit' ] );

	// Theme task
	grunt.registerTask( 'themes', [ 'sass' ] );

	// Package presentation to archive
	grunt.registerTask( 'package', [ 'default', 'zip' ] );

	// Serve presentation locally
	// grunt.registerTask( 'serve', [ 'connect', 'watch:main' ] );

	grunt.registerTask( 'server', [ 'dome', 'watch:edits' ] );


	// Run tests
	grunt.registerTask( 'test', [ 'jshint', 'qunit' ] );

	grunt.registerTask('serve', 'Set up express server to use', function(open){

		var openBrowser = false;

		if( open || grunt.option('open') ) {
			openBrowser =true;
		}

		grunt.task.run('watch:edits');
		// grunt.task.requires('watch:edits');

		var express = require('express');
		var app = express.createServer();
		

		app.configure(function(){
			var path = express.static(__dirname + '/');
		    app.use(path);
			app.use(express.bodyParser());
		    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
		});

		app.post('/edit', function(req, res) {
		    // grunt.log.writeln("Request body: " + JSON.stringify(req.body));
		    grunt.log.writeln(">> Express server ");
		    grunt.log.writeln("Received post request for editing CSS.");
			grunt.log.writeln("New CSS: " + req.body.css);
			var fs = require('fs');
			fs.writeFile("./css/editable.css", req.body.css, function(err) {
			    if(err) {
			        console.log(err);
			    } else {
			        console.log("editable.css was written correctly.");
			    }
			}); 
		});

		app.listen(8000);
		grunt.log.writeln("Starting up Express server at port 8000");

		//Open the browser;
		if(openBrowser){
			var open = require('open');
			open('http://localhost:8000');
		}
	});

};
