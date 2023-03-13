module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks("grunt-ts");

  grunt.initConfig({
    ts: {
      compile_lib: {
        tsconfig: false,
        options: {
          module: 'amd',
          sourceMap: false,
          strict: false,
          target: 'es6'
        },
        src: [
          "src/api/ScriptContext.ts",
          "src/core/utils/Utils.ts",
          "src/core/utils/EventDispatcher.ts",
          "src/core/Resource.ts",
          "src/core/ResourceResolver.ts",
          "src/core/ResourceRenderer.ts",
          "src/core/ResourceRequestContext.ts",
          "src/core/ResourceRequestHandler.ts",
          "src/core/Tools.ts",
          "src/core/writers/ContentWriter.ts",
          "src/core/writers/OrderedContentWriter.ts",
          "src/core/writers/BufferedContentWriter.ts",
          "src/core/resources/ObjectResource.ts",
          "src/core/resources/RootResource.ts",
          "src/core/factories/InterFuncRendererFactory.ts",
          "src/core/factories/TemplateRendererFactory.ts",
          "src/core/factories/JSRendererFactory.ts",
          "src/core/resources/ErrorResource.ts",
          "src/core/resources/NotFoundResource.ts",
          "src/core/resources/MultiResourceResolver.ts",
          "src/core/resources/IndexResource.ts",
          "src/extra/factories/HBSRendererFactory.ts",
          "src/extra/resources/StoredResource.ts",
          "src/extra/resources/StoredObjectResource.ts",
          "src/extra/resources/client/RemoteResource.ts",
          "src/extra/resources/client/LocalStorageResource.ts",
          "src/extra/resources/client/ClientRequestHandler.ts",
          "src/extra/resources/client/SPARequestHandler.ts",
          "src/extra/resources/server/ServerRequestHandler.ts",
          "src/extra/resources/server/FileResource.ts",
          "src/extra/resources/PouchDBResource.ts",
          "src/extra/resources/DropBoxResource.ts",
          "src/extra/resources/GitHubResource.ts",
          "src/extra/resources/LunrIndexResource.ts",
          "src/extra/utils/HTMLParser.ts",
          "src/exports.ts"

        ],
        out: 'build/r3elib.js'
      }
    },
    exec: {
      archive_templates: '/bin/echo -n "window.templates=" > ./dist/templates.js ; node ./launch/server/files2json.js templates >> ./dist/templates.js'
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: 'build/',
          src: ['**'],
          dest: 'dist'
        }]
      }
    },
    clean: {
      build: ['build/']
    }
  });

  // Default task
  grunt.task.registerTask('default', [
    'ts:compile_lib',
    'copy:dist',
    'exec:archive_templates'
  ]);

};
