var vows = require('vows');
var gulp = require('gulp');
var run = require('run-sequence');
var suite = vows.describe('Gulp-Concat');
var reporter = require('vows/lib/vows/reporters/spec');
var concat = require('../');
var fs = require('fs');
var assert = require('assert');

var files = {
  'one': 'one.js',
  'two': 'two.js',
  'three': 'three.js'
};


function getConcatenateName(file) {
  var name = 'default.js',
    path;

  for(var key in files) {
    path = file.path.split(__dirname)[1].split(key)[1];

    if(path) {
      name = files[key];
    }
  }

  return name;
}

var expected = {
  string: 86,
  fn: 84
};

gulp.task('concat-function', function() {
  return gulp.src(['./scripts/**/*.js'])
    .pipe(concat(getConcatenateName))
    .pipe(gulp.dest('./dist'));
});

gulp.task('concat-string', function() {
  return gulp.src(['./scripts/**/*.js'])
    .pipe(concat('string-dest.js'))
    .pipe(gulp.dest('./dist'));
});

suite.addBatch({
  'Given I want to have multiple files concatenated into one file': {
    topic: function() {
      var self = this;
      run('concat-string', function() {
        self.callback(null, {});
      });
    },
    'They should all be concatenated to "string-dest.js': function() {
      assert.equal(fs.readFileSync('./dist/string-dest.js', {encoding: 'UTF-8'}).length, expected.string);
    }
  },
  'Given I want to have my files concatenated into multiple destinations of my choosing': {
    topic: function() {
      var self = this;

      run('concat-function', function() {
        self.callback(null, {});
      });
    },
    'They should be in the locations as dictated in my function': function() {
      var one = fs.readFileSync('./dist/one.js', {encoding: 'UTF-8'}).length;
      var two = fs.readFileSync('./dist/two.js', {encoding: 'UTF-8'}).length;
      var three = fs.readFileSync('./dist/three.js', {encoding: 'UTF-8'}).length;

      assert.equal((one+two+three), expected.fn);
    }
  }
}).run({reporter: reporter});