/*!
 * cube-less: test/test.js
 * Authors  : 剪巽 <jianxun.zxl@taobao.com> (https://github.com/fishbar)
 * Create   : 2016-06-02 10:22:39
 * CopyRight 2016 (c) Alibaba Group
 */
var TestMod = require('../index');
var expect = require('expect.js');
var path = require('path');
var fs = require('fs');

describe('cube-less', function () {
  it('expect info', function () {
    expect(TestMod.type).to.be('style');
    expect(TestMod.ext).to.be('.less');
  });
  it('expect processor less file fine', function (done) {
    var file = '/test.less';
    var code = fs.readFileSync(path.join(__dirname, file)).toString();
    var data = {
      code: code,
      source: code,
      queryPath: file,
      realPath: file
    };
    var cube = {
      config: {
        release: false,
        moduleWrap: true,
        compress: true,
        root: __dirname
      },
      wrapStyle: function (qpath, code) {
        return 'Cube("' + qpath + '", [], function(m){m.exports=' + JSON.stringify(code) + ';return m.exports});';
      }
    };
    function Cube(mod, requires, cb) {
      expect(mod).to.be('/test.less');
      expect(requires).to.eql([]);
      var tpl = cb({});
      expect(tpl).to.match(/\.test_less a\s*\{/);
      done();
    }
    var processor = new TestMod(cube);
    processor.process(data, function (err, res) {
      expect(err).to.be(null);
      expect(res).have.keys(['source', 'code']);
      expect(res.source).match(/\.test_less \{\s+a\s*\{/);
      expect(res.code).to.match(/\.test_less a\s*\{/);
      var wraped = cube.wrapStyle(file, res.code);
      eval(wraped);
    });
  });

  it('expect processor error less file, return error', function (done) {
    var require = function () {
      return {};
    };
    var file = '/test_err.less';
    var code = fs.readFileSync(path.join(__dirname, file)).toString();
    var data = {
      code: code,
      source: code,
      queryPath: file,
      realPath: file
    };
    var cube = {
      config: {
        release: false,
        moduleWrap: true,
        compress: true,
        root: __dirname
      },
      wrapStyle: function (qpath, code) {
        return 'Cube("' + qpath + '", [], function(m){m.exports=' + JSON.stringify(code) + ';return m.exports});';
      }
    };
    var processor = new TestMod(cube);
    processor.process(data, function (err, res) {
      expect(err).to.be.ok();
      done();
    });
  });
});
