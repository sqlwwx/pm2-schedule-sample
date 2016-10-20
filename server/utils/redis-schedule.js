'use strict';
var redis = require('redis');

var client = redis.createClient();
var sub = redis.createClient();

sub.subscribe('__keyevent@0__:expired');
sub.on('message', function(channel, key) {
  if (channel === '__keyevent@0__:expired' && key.startsWith('task')) {
    client.incr(key, function(err, count) {
      if (count === 1) {
        var result = eval(key.substr(5));
        new Promise(function(resolve) {
          if (result && result.then) {
            result.then(resolve);
          } else {
            resolve();
          }
        }).then(function(result) {
          setTimeout(function() {
            client.del(key);
          }, 500);
        });
      }
    });
  }
});

module.exports = function regTask(methodStr, second) {
  return new Promise(function(resolve, reject) {
    client.multi([
      ['incr', 'task:' + methodStr],
      ['expire', 'task:' + methodStr, second],
    ]).exec(function(err, replies) {
      if (err) { return reject(err); }
      if (replies[0] === 1) {
        resolve();
      }
      if (replies[0] > 1) {
        resolve('alreadyRegTask');
      }
    });
  });
};

