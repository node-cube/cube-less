var path = require('path');
var less = require('less');
var fs = require('fs');

function LessProcessor(cube) {
  this.cube = cube;
}
LessProcessor.info = {
  type: 'style',
  ext: '.less'
};

LessProcessor.prototype = {
  process: function (file, options, callback) {
    var root = options.root;
    var absFile = path.join(root, file);
    var code = fs.readFileSync(absFile).toString();
    var codeRes;
    /*
    var lessParser = new(less.Parser)({
      paths: [path.dirname(absFile), root]
    });
    */
    var self = this;
    less.render(
      code,
      {
        paths: [path.dirname(absFile), root],
        compress: options.compress
      },
      function (err, data) {
        if (err) {
          err.code = 'Css_Parse_Error';
          err.message = 'File:' + file + ', Line:' + err.line + ', Column:' + err.column + ' ' + err.message + ' extract:\n' + err.extract.join('\n');
          return callback(err);
        }
        var res = {
          source: code,
          code: data.css
        };
        if (self.cube.fixupResPath) {
          res.code = self.cube.fixupResPath(path.dirname(options.qpath), res.code);
        }
        if (options.moduleWrap) {
          res.wraped = self.cube.wrapStyle(options.qpath, res.code);
        }
        callback(null, res);
      }
    );
    /*
    lessParser.parse(code, function (err, tree) {
      if (err) {
        err.code = 'Css_Parse_Error';
        err.message = 'File:' + file + ', Line:' + err.line + ', Column:' + err.column + ' ' + err.message + ' extract:\n' + err.extract.join('\n');
        return callback(err);
      }
      codeRes = tree.toCSS({
        compress: options.compress
      });

      var res = {
        source: code,
        code: codeRes
      };
      if (self.cube.fixupResPath) {
        res.code = self.cube.fixupResPath(path.dirname(options.qpath), res.code);
      }
      if (options.moduleWrap) {
        res.wraped = self.cube.wrapStyle(options.qpath, codeRes);
      }
      callback(null, res);
    });
    */
  }
};


module.exports = LessProcessor;