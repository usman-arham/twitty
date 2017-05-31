var assert = require('assert'),
    Twitty = require('../lib/twitter'),
    config1 = require('../config1');

describe('twitty', function() {
  describe('instantiation', function() {
    it('works with var twitty = new Twitty()', function() {
      var twitty = new Twitty({
        consumer_key: 'a',
        consumer_secret: 'b',
        access_token: 'c',
        access_token_secret: 'd'
      });
      assert(twitty.config);
      assert.equal(typeof twitty.get, 'function');
      assert.equal(typeof twitty.post, 'function');
      assert.equal(typeof twitty.stream, 'function');
    });
    it('works with var twitty = Twitty()', function() {
      var twitty = Twitty({
        consumer_key: 'a',
        consumer_secret: 'b',
        access_token: 'c',
        access_token_secret: 'd'
      });
      assert(twitty.config);
      assert.equal(typeof twitty.get, 'function');
      assert.equal(typeof twitty.post, 'function');
      assert.equal(typeof twitty.stream, 'function');
    });
  });

  describe('config', function() {
    it('throws when passing empty config', function(done) {
      assert.throws(function() {
        var twitty = new Twitty({});
      }, Error);

      done();
    });

    it('throws when config is missing a required key', function(done) {
      assert.throws(function() {
        var twitty = new Twitty({
          consumer_key: 'a',
          consumer_secret: 'a',
          access_token: 'a'
        });
      }, Error);

      done();
    });

    it('throws when config provides all keys but they\'re empty strings', function(done) {
      assert.throws(function() {
        var twitty = new Twitty({
          consumer_key: '',
          consumer_secret: '',
          access_token: '',
          access_token_secret: ''
        });
      }, Error);

      done();
    });
  });

  describe('setAuth()', function() {
    var twitty;

    beforeEach(function() {
      twitty = new Twitty({
        consumer_key: 'a',
        consumer_secret: 'b',
        access_token: 'c',
        access_token_secret: 'd'
      });
    });

    it('should update the client\'s auth config', function(done) {
      // partial update
      twitty.setAuth({
        consumer_key: 'x',
        consumer_secret: 'y'
      });

      assert(twitty.config.consumer_key === 'x');
      assert(twitty.config.consumer_secret === 'y');

      // full update
      twitty.setAuth(config1);

      assert(twitty.config.consumer_key === config1.consumer_key);
      assert(twitty.config.consumer_secret === config1.consumer_secret);
      assert(twitty.config.access_token === config1.access_token);
      assert(twitty.config.access_token_secret === config1.access_token_secret);

      twitty.get('account/verify_credentials', { twitty_options: { retry: true } }, function(err, reply, response) {
        assert(!err, err);
        assert(response.headers['x-rate-limit-limit']);
        done();
      });
    });
  });
});