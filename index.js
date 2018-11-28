var path = require('path');
var less = require('less');

function LessProcessor(cube, config) {
  this.cube = cube;
  this.config = config || {};
}
LessProcessor.type = 'style';
LessProcessor.ext = '.less';

LessProcessor.prototype.process = function (data, callback) {
  var code = data.code;
  var codeRes;
  var config = this.cube.config;
  var file = path.join(config.root, data.realPath);
  var self = this;
  less.render(
    code,
    Object.assign({}, {
      paths: [path.dirname(file), root],
      compress: data.compress || config.compress,
    }, this.config),
    function (err, result) {
      if (err) {
        err.code = 'Less_Parse_Error';
        err.file = data.realPath;
        err.line = err.line;
        err.message = err.message + ' extract:\n' + err.extract.join('\n');
        return callback(err);
      }
      data.code = result.css;
      callback(null, data);
    }
  );
};

module.exports = LessProcessor;