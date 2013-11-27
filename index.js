var es = require('event-stream'),
  path = require('path');

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
    }).join('');

    var joinedPath = path.join(path.dirname(buffer[0].path), fileName);

    var joinedFile = {
      shortened: fileName,
      path: joinedPath,
      contents: joinedContents
    };

    this.emit('data', joinedFile);
    this.emit('end');
  }

  return es.through(bufferContents, endStream);
};
