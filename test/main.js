var concat = require('../');
var should = require('should');
require('mocha');

describe('gulp-concat', function() {
  describe('concat()', function() {
    it('should concat two files', function(done) {
      var stream = concat({fileName: "test.js", splitter: ":"});
      var fakeFile = {
        path: "/home/contra/test/file.js",
        shortened: "file.js",
        contents: new Buffer("wadup")
      };

      var fakeFile2 = {
        path: "/home/contra/test/file2.js",
        shortened: "file2.js",
        contents: new Buffer("doe")
      };

      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.shortened);
        should.exist(newFile.contents);
        newFile.path.should.equal("/home/contra/test/test.js");
        newFile.shortened.should.equal("test.js");
        String(newFile.contents).should.equal("wadup:doe");
        done();
      });
      stream.write(fakeFile);
      stream.write(fakeFile2);
      stream.end();
    });
  });
});
