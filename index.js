var es = require('event-stream');
var path = require('path');
var gutil = require('gulp-util');

module.exports = function(fileName){
  if (!fileName) throw new Error("Missing fileName option for gulp-concat");

  var buffer = [];
  function bufferContents(file){
    // clone the file so we arent mutating stuff
    buffer.push(file);
  }

  function endStream(){
    if (buffer.length === 0) return this.emit('end');

    var joinedContents = buffer.map(function(file){
      return file.contents;
    }).join('\r\n');

    var joinedPath = path.join(buffer[0].base, fileName);

    var joinedFile = new gutil.File({
      cwd: buffer[0].cwd,
      base: buffer[0].base,
      path: joinedPath,
      contents: joinedContents
    });

    this.emit('data', joinedFile);
    this.emit('end');
  }

  return es.through(bufferContents, endStream);
};
