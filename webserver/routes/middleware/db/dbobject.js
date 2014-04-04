/**
 * db/dbobject.js
 * Wrapper for items returned from database wrappers
 */

module.exports = DbObject;

function DbObject(props, guid) {
  for (var key in props) {
    this[key] = props[key];
  }

  // This will only exist for fhdb objects
  if(guid) {
    this.guid = guid;
  }
}

DbObject.prototype = {
  getId: function() {
    return (this._id || this.guid);
  },

  get: function(key) {
    return (this[key] || null);
  },

  set: function(key, val) {
    this[key] = val;
  }
};