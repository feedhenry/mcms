/**
 * env/index.js
 * Check environment vairables upon system startup.
 */

module.exports = {
  init: init,
  get: get
};

var log = require('../logger');

// Variables that should be set, and some default dev values.
var default_vars = {
  "DB_HOST": "127.0.0.1",
  "DB_PORT": "27017",
  "DB_NAME": "cms",
  "DB_USERNAME": "daa",
  "DB_PASSWORD": "daa"
};


/**
 * Check environment variables are set.
 */

function init() {
  // Check env vars
  for (var key in default_vars) {
    if (!process.env[key]) {
      log.warn(key + ' environment var not set. Using default: ' + default_vars[key]);
    }
  }
}


/**
 * Reads the environment variable or returns the default
 * @param {String} desired
 * @param {String} default
 */

function get(key) {
  return process.env[key] ? process.env[key] : this[key] ? this[key] : default_vars[key];
}

function set(key, val) {
  process.env[key] = val;
}