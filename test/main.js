var concat = require('../');
var should = require('should');
var os = require('os');
var path = require('path');
var File = require('gulp-util').File;
var Buffer = require('buffer').Buffer;
require('mocha');

describe('gulp-concat', function() {
  describe('concat()', function() {

    testFiles(concat('test.js'                   ), ['wadup'], 'wadup');
    testFiles(concat('test.js', {newLine: '\r\n'}), ['wadup'], 'wadup');
    testFiles(concat('test.js', {newLine: ''    }), ['wadup'], 'wadup');

    testFiles(concat('test.js'                   ), ['wadup', 'doe'], 'wadup\ndoe');
    testFiles(concat('test.js', {newLine: '\r\n'}), ['wadup', 'doe'], 'wadup\r\ndoe');
    testFiles(concat('test.js', {newLine: ''    }), ['wadup', 'doe'], 'wadupdoe');

    testFiles(concat('test.js'                   ), ['wadup', 'doe', 'hey'], 'wadup\ndoe\nhey');
    testFiles(concat('test.js', {newLine: '\r\n'}), ['wadup', 'doe', 'hey'], 'wadup\r\ndoe\r\nhey');
    testFiles(concat('test.js', {newLine: ''    }), ['wadup', 'doe', 'hey'], 'wadupdoehey');

    function testFiles(stream, contentses, result) {
      it('should concat one or several files', function(done) {

        stream.on('data', function(newFile){
          should.exist(newFile);
          should.exist(newFile.path);
          should.exist(newFile.relative);
          should.exist(newFile.contents);

          var newFilePath = path.resolve(newFile.path);
          var expectedFilePath = path.resolve('/home/contra/test/test.js');
          newFilePath.should.equal(expectedFilePath);

          newFile.relative.should.equal('test.js');
          String(newFile.contents).should.equal(result);
          Buffer.isBuffer(newFile.contents).should.equal(true);
          done();
        });

        contentses.forEach(function(contents, i) {
          stream.write(new File({
            cwd: '/home/contra/',
            base: '/home/contra/test',
            path: '/home/contra/test/file' + i.toString() + '.js',
            contents: new Buffer(contents)
          }));
        });

        stream.end();

      });
    };

  });
});
