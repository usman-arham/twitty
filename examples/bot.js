//
//  Bot
//  class for performing various twitter actions
//
var Twitty = require('../lib/twitter');

var Bot = module.exports = function(config) {
  this.twitty = new Twitty(config);
};

//
//  post a tweet
//
Bot.prototype.tweet = function(status, callback) {
  if (typeof status !== 'string') {
    return callback(new Error('tweet must be of type String'));
  } else if (status.length > 140) {
    return callback(new Error('tweet is too long: ' + status.length));
  }
  this.twitty.post('statuses/update', { status: status }, callback);
};

// choose a random tweet and follow that user
Bot.prototype.searchFollow = function(params, callback) {
  var self = this;
 
  self.twitty.get('search/tweets', params, function(err, reply) {
    if (err) return callback(err);
 
    var tweets = reply.statuses;
    var rTweet = randIndex(tweets);
    if (typeof rTweet != 'undefined')	{
      var target = rTweet.user.id_str;
      self.twitty.post('friendships/create', { id: target }, callback);
    }
  });
};

//
// Retweet
//
Bot.prototype.retweet = function(params, callback) {
  var self = this;
 
  self.twitty.get('search/tweets', params, function(err, reply) {
    if (err) return callback(err);
 
    var tweets = reply.statuses;
    var randomTweet = randIndex(tweets);
    if (typeof randomTweet != 'undefined')
      self.twitty.post('statuses/retweet/:id', { id: randomTweet.id_str }, callback);
  });
};
 
//
// Favorite a tweet
//
Bot.prototype.favorite = function(params, callback) {
  var self = this;
 
  self.twitty.get('search/tweets', params, function(err, reply) {
    if (err) return callback(err);
 
    var tweets = reply.statuses;
    var randomTweet = randIndex(tweets);
    if (typeof randomTweet != 'undefined')
      self.twitty.post('favorites/create', { id: randomTweet.id_str }, callback);
  });
};

//
//  Choose a random friend of one of your followers, and follow that user
//
Bot.prototype.mingle = function(callback) {
  var self = this;
  
  this.twitty.get('followers/ids', function(err, reply) {
    if (err) return callback(err);
    
    var followers = reply.ids,
        randFollower = randIndex(followers);
      
    self.twitty.get('friends/ids', { user_id: randFollower }, function(err, reply) {
      if (err) { return callback(err); }
        
      var friends = reply.ids,
          target = randIndex(friends);
      self.twitty.post('friendships/create', { id: target }, callback);
    });
  });
};

//
//  prune your followers list; unfollow a friend that hasn't followed you back
//
Bot.prototype.prune = function(callback) {
  var self = this;
  
  this.twitty.get('followers/ids', function(err, reply) {
    if (err) return callback(err);
    
    var followers = reply.ids;
    self.twitty.get('friends/ids', function(err, reply) {
      if (err) return callback(err);
      
      var friends = reply.ids,
          pruned = false;
      
      while (!pruned) {
        var target = randIndex(friends);
        
        if (!~followers.indexOf(target)) {
          pruned = true;
          self.twitty.post('friendships/destroy', { id: target }, callback);
        }
      }
    });
  });
};

function randIndex(arr) {
  var index = Math.floor(arr.length * Math.random());
  return arr[index];
};