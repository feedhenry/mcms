/**
 * db/index.js
 * Wrapper for mongodb. Will allow application to operate with fh platform wrapper or in native mongodb
 */

module.exports = {
  feedhenry: require('./fhdb.js'),
  mongo: require('./mongodb.js')
};
