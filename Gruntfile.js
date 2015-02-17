module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat_sourcemap: {
            options: {
                separator: ";"
            },
            target: {
                files: {
                    'dist/<%= pkg.name %>.dist.js': [
                        'js/libs/console-stub.js',
                        'js/libs/Promise.js',
                        'js/libs/overlay.js',
                        'js/map-viewer.js',
                        'js/map-control.js',
                        'js/controls/**/*.js'
                    ]
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
                sourceMap: true,
                sourceMapIn: "dist/<%= pkg.name %>.dist.js.map",
                sourceMapName: "dist/<%= pkg.name %>.dist.js.map",
                mangle: false,
                compress: false
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.dist.min.js': ['dist/<%= pkg.name %>.dist.js']
                }
            }
        },
        copy: {
            main: {
                files: [{
                    src: "js/**/*",
                    dest: "dist/"
                }]
            }
        },
        less: {
            compile: {
                options: {
                    paths: ["css"]
                },
                files: {
                    "dist/jll-egv.dist.css": "css/jll-egv.less"
                }

            }

        },
        watch: {
            files: ["Gruntfile.js", 'js/**/*.js', 'css/*'],
            tasks: ['default']
        }


    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concat-sourcemap');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.file.setBase(".");

    grunt.registerTask('default', ['concat_sourcemap', 'less', 'uglify', 'copy']);
    grunt.registerTask('bw', ['watch']);
};