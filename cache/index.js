/**
 * cache/index.js
 * Simple interface to $fh.cache
 */

module.exports = {
  create: create,
  read: read,
  remove: remove
};

var log = require('../logger').getLogger();

/**
 * Cache an object using the key provided.
 * @param {String}    key   The key to store data with
 * @param {Object}    data  The Data to cache
 * @param {Number}    time  The number of seconds to cache info for
 * @param {Function}
 */

function create(key, data, time, callback) {
  log.info('Start write cache for key: ' + key);
  
  // Parse data if required
  if (typeof data === 'object') {
    try {
      data = JSON.stringify(data);
    } catch (e) {
      log.err('Failed to cache for key: "' + key + '", data parse error');
      return callback({
        msg: 'Provided data could not be cached, JSON.parse error',
        err: e
      }, null);
    }
  }

  $fh.cache({
    act: 'save',
    key: key,
    value: data,
    expire: time
  }, function(err, res) {
    if (err) {
      log.err('Failed to cache for key: "' + key + '", ' + JSON.stringify(err));
      if (callback) {
        return callback(err, null);
      }
    } else {
      log.info('Cached for key: "' + key + '"');
      if (callback) {
        return callback(null, res);
      }
    }
  });
}


/**
 * Read object from cache
 * @param {String}    key   The key to read data for
 * @param {Function}
 */

function read(key, callback) {
  $fh.cache({
    act: 'load',
    key: key,
  }, function(err, res) {
    if (err) {
      log.err('Failed to read cache for key: "' + key + '", ' + JSON.stringify(err));
      return callback(err, null);
    }

    return callback(null, res);
  });
}


/**
 * Remove cached item for given key
 * @param {String}    key   The key to remove data for
 * @param {Function}
 */

function remove(key, callback) {
  $fh.cache({
    act: 'remove',
    key: key
  }, function(err, res) {
    if (err) {
      log.err('Failed to remove cache for key: "' + key + '", ' + JSON.stringify(err));
      if (callback) {
        return callback(err, null);
      }
    }

    if (callback) {
      return callback(err, null);
    }
  });
}