var through = require('through');
var os = require('os');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var SourceMapGenerator = require('source-map').SourceMapGenerator;
var SourceMapConsumer = require('source-map').SourceMapConsumer;

module.exports = function(fileName, opt){
  if (!fileName) throw new PluginError('gulp-concat',  'Missing fileName option for gulp-concat');
  if (!opt) opt = {};
  if (!opt.newLine) opt.newLine = gutil.linefeed;

  var buffer = [];
  var firstFile = null;
  var sourceMap = new SourceMapGenerator({ file: fileName });
  var offset = 0;

  function bufferContents(file){
    if (file.isNull()) return; // ignore
    if (file.isStream()) return this.emit('error', new PluginError('gulp-concat',  'Streaming not supported'));

    if (!firstFile) firstFile = file;

    var fileContents = file.contents.toString('utf8');
    buffer.push(fileContents);

    if (file.sourceMap) {
      var lines = fileContents.split('\n').length;
      if (file.sourceMap && file.sourceMap.mappings.length > 0) {
        var upstreamSM = new SourceMapConsumer(file.sourceMap);
        upstreamSM.eachMapping(function(mapping) {
          sourceMap.addMapping({
            generated: {
                line: offset + mapping.generatedLine,
                column: mapping.generatedColumn
            },
            original: {
                line: mapping.originalLine,
                column: mapping.originalColumn
            },
            source: file.relative,
            name: mapping.name
          });
        });
      } else {
        for (var i = 1; i <= lines; i++) {
          sourceMap.addMapping({
            generated: {
                line: offset + i,
                column: 0
            },
            original: {
                line: i,
                column: 0
            },
            source: file.relative
          });
        }
      }
      sourceMap.setSourceContent(file.relative, file.sourceMap.sourcesContent[0]);
      offset += lines;
    }
  }

  function endStream(){
    if (buffer.length === 0) return this.emit('end');

    var joinedContents = buffer.join(opt.newLine);

    var joinedPath = path.join(firstFile.base, fileName);

    var joinedFile = new File({
      cwd: firstFile.cwd,
      base: firstFile.base,
      path: joinedPath,
      contents: new Buffer(joinedContents)
    });
    if (firstFile.sourceMap) {
      joinedFile.sourceMap = JSON.parse(sourceMap.toString());
      joinedFile.applySourceMap = firstFile.applySourceMap;
    }

    this.emit('data', joinedFile);
    this.emit('end');
  }

  return through(bufferContents, endStream);
};
