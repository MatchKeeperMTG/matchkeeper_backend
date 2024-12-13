// this my attempt of using cachegoose as a larger hander of caching our api responses

var mongoose = require('mongoose');
var cachegoose = require('cachegoose');
 
cachegoose(mongoose, {
  engine: 'redis',    /* If you don't specify the redis engine,      */
  port: 8080,         /* the query results will be cached in memory. */
  host: 'localhost'
});
 
Record
  .find({ some_condition: true })
  .cache(30) // The number of seconds to cache the query.  Defaults to 60 seconds.
  .exec(function(e, records) {

  });
 
Record
  .aggregate()
  .group({ total: { $sum: '$some_field' } })
  .cache(0) // Explicitly passing in 0 will cache the results indefinitely.
  .exec(function(err, aggResults) {

  });