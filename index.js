var path = require('path');
var less = require('less');

class CustomFileManager extends less.FileManager {
  constructor(cube, data) {
    super();
    this.cube = cube;
    this.data = data;
  }
  loadFile(filename, currentDirectory, options, environment) {
    if (this.cube && typeof this.cube.readFile === 'function' && typeof this.cube.resolveModulePath === 'function') {
      return new Promise((resolve, reject) => {
        this.cube.resolveModulePath(this.data, filename, (err, { path, code } = {}) => {
          if (err || code === 1) {
            // 错误的话还是走默认 less 的逻辑
            super.loadFile(filename, currentDirectory, options, environment).then(resolve, reject);
          } else {
            const data = {
              queryPath: path,
              realPath: filename
            };
            this.cube.readFile(data, (err, fileData) => {
              if (err || !fileData || !fileData.code) {
                super.loadFile(filename, currentDirectory, options, environment).then(resolve, reject);
              } else {
                this.data = data;
                resolve({
                  filename: fileData.realPath || filename,
                  contents: fileData.code
                });
              }
            });
          }
        });
      });
    }
    return super.loadFile(filename, currentDirectory, options, environment);
  }
}
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

  const customFileManager = new CustomFileManager(this.cube, data);
  less.render(
    code,
    {
      filename: data.queryPath,
      strictMath: true,
      paths: [path.dirname(file), config.root, path.join(config.root, 'node_modules')],
      modifyVars: {}, // less中的变量表
      compress: data.compress || config.compress,
      plugins: [{
        install: function (lessInstance, pluginManager) {
          pluginManager.addFileManager(customFileManager);
        }
      }]
    },
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