var assert = require('assert'),
    Twitty = require('../lib/twitter'),
    config1 = require('../config1'),
    colors = require('colors'),
    restTest = require('./rest.js');

/*
  Don't run these tests often otherwise Twitter will rate limit you
 */

describe.skip('multiple connections', function() {
  it('results in one of the streams closing', function(done) {
    var twitty = new Twitty(config1);

    var streams = [
      twitty.stream('statuses/sample'),
      twitty.stream('statuses/sample'),
      twitty.stream('statuses/sample'),
    ];

    streams.forEach(function(stream, i) {
      stream.on('disconnect', function(disconnect) {
        console.log('Disconect for stream', i);
        assert.equal(typeof disconnect, 'object');
        done();
      });

      stream.on('error', function(errMsg) {
        console.log('error for stream', i, errMsg);
      });

      stream.on('tweet', function(t) {
        console.log(i);
      });

      stream.on('connected', function() {
        console.log('Stream', i, 'connected.');
      });
    });

  });
});

describe.skip('Managing multiple streams legally', function() {
  this.timeout(60000);
  it('updating track keywords without losing data', function(done) {
    var twitty = new Twitty(config1);
    var stream1 = twitty.stream('statuses/filter', { track: ['#no'] });

    stream1.once('tweet', function(tweet) {
      console.log('got tweet from first stream');
      restTest.checkTweet(tweet);
      restTest.assertTweetHasText(tweet, '#no');

      // update our track list and initiate a new connection
      var stream2 = twitty.stream('statuses/filter', { track: ['#fun'] });

      stream2.once('connected', function(res) {
        console.log('second stream connected');
        
        // Stop the first stream immediately
        stream1.stop();
        assert.equal(res.statusCode, 200);

        stream2.once('tweet', function(tweet) {
          restTest.checkTweet(tweet);

          restTest.assertTweetHasText(tweet, '#fun');
          return done();
        });
      });
    });
  });
});