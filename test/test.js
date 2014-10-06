var TestMod = require('../index');
var expect = require('expect.js');

describe('cube-less', function () {
  it('expect info', function () {
    expect(TestMod.info.type).to.be('style');
    expect(TestMod.info.ext).to.be('.less');
  });
  it('expect processor less file fine', function (done) {
    var options = {
      release: false,
      moduleWrap: true,
      compress: true,
      qpath: '/test.less',
      root: __dirname
    };
    var cube = {
      config: options,
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
    processor.process('/test.less', options, function (err, res) {
      expect(err).to.be(null);
      expect(res).have.keys(['source', 'code', 'wraped']);
      expect(res.source).match(/\.test_less \{\s+a\s*\{/);
      expect(res.code).to.match(/\.test_less a\s*\{/);
      eval(res.wraped);
    });
  });

  it('expect processor error less file, return error', function (done) {
    require = function () {
      return {};
    };
    var options = {
      release: false,
      moduleWrap: true,
      compress: true,
      qpath: '/test_err.less',
      root: __dirname
    };
    var cube = {
      config: options,
      wrapStyle: function (qpath, code) {
        return 'Cube("' + qpath + '", [], function(m){m.exports=' + JSON.stringify(code) + ';return m.exports});';
      }
    };
    var processor = new TestMod(cube);
    processor.process('/test_err.less', options, function (err, res) {
      expect(err).to.be.ok();
      done();
    });
  });
});