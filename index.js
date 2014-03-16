'use strict';

var path = require('path');
var through = require('through');

var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;

var SourceMapConsumer = require('source-map').SourceMapConsumer;
var SourceMapGenerator = require('source-map').SourceMapGenerator;
var SourceNode = require('source-map').SourceNode;

module.exports = function(fileName, opts) {
  if (!fileName) {
    throw new PluginError('gulp-concat', 'Missing fileName option for gulp-concat');
  }

  opts = opts || {};
  opts.newLine = opts.newLine || gutil.linefeed;

  var firstFile = null;

  var sourceNode = new SourceNode();

  function bufferContents(file) {
    if (file.isNull()) return; // ignore
    if (file.isStream()) return this.emit('error', new PluginError('gulp-concat', 'Streaming not supported'));

    if (!firstFile) {
      firstFile = file;
    } else {
      sourceNode.add(opts.newLine);
    }

    var rel = path.relative(file.cwd, file.path).replace('\\', '/'),
        lines = file.contents.toString('utf8').split('\n');

    lines.forEach(function(line, j) {
      var lineNum = j + 1, endLine = lineNum < lines.length ? '\n' : '';
      sourceNode.add(new SourceNode(lineNum, 0, rel, line + endLine));
    });

    if (opts.sourcesContent) {
      sourceNode.setSourceContent(file.relative, file.contents.toString('utf8'));
    }
  }

  function endStream() {
    if (!firstFile) return;

    var contentPath = path.join(firstFile.base, fileName),
        mapPath = contentPath + '.map';

    if (opts.sourceMap) {
      if (/\.css$/.test(fileName)) {
        sourceNode.add('/*# sourceMappingURL=' + fileName + '.map' + ' */');
      } else {
        sourceNode.add('//# sourceMappingURL=' + fileName + '.map');
      }
    }

    var codeMap = sourceNode.toStringWithSourceMap({
        file: fileName,
        sourceRoot: opts.sourceRoot || ''
    });

    var sourceMap = SourceMapGenerator
                      .fromSourceMap( new SourceMapConsumer( codeMap.map.toJSON() ) )
                      .toJSON();
                            
    sourceMap.file = path.basename(sourceMap.file);

    var contentFile = new File({
      cwd: firstFile.cwd,
      base: firstFile.base,
      path: contentPath,
      contents: new Buffer(codeMap.code)
    });

    this.emit('data', contentFile);

    if (opts.sourceMap) {
      var mapFile = new File({
        cwd: firstFile.cwd,
        base: firstFile.base,
        path: mapPath,
        contents: new Buffer(JSON.stringify(sourceMap, null, '  '))
      });    
      this.emit('data', mapFile);
    }

    this.emit('end');
  }

  return through(bufferContents, endStream);
};
