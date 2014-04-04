/**
 * /db/fhdb.js
 * Wrapper for fh.db
 */

module.exports = {
  create: create,
  read: read,
  update: update,
  remove: remove,
  find: find
};

var DbObject = require('./dbobject.js');
var async = require('async');

/**
 * Create entries in the database. If multiple entries created callback recieves null as result
 * @param {Mixed}     data        Object Array/Object to insert
 * @param {String}    collection  Collection to insert into.
 * @param {Function}  callback
 */

function create(data, collection, callback) {
  $fh.db({
    act: 'create',
    type: collection,
    fields: data,
  }, function(err, res) {
    if (err) {
      return callback(err, null);
    }

    // We created a single entry, return it as db object
    if (res && typeof data === 'object' && res.fields) {
      return callback(null, new DbObject(res.fields, res.guid));
    }

    // Return generic status
    return callback(null, true);
  });
}


/**
 * Retrieve an item from the specified collection with the ID provided
 * @param {String}    collection
 * @param {String}    guid
 * @param {Function}  callback
 */

function read(collection, guid, callback) {
  $fh.db({
    act: 'read',
    type: collection,
    guid: id
  }, function(err, data) {
    if (err) {
      return callback(err, null);
    }

    // We retrieved data, return it as DB object
    if (data && data.fields) {
      return callback(null, new DbObject(data.fields, data.guid));
    }

    return callback(null, null);
  });
}


/**
 * Update the item with specified id in collection. Callback result is the updated item if existing
 * @param {String}    collection
 * @param {String}    guid
 * @param {Object}    fields
 * @param {Function}  callback
 */

function update(collection, guid, fields, callback) {
  read(collection, guid, function(err, res) {
    if (err) {
      return callback(err, null);
    }

    // No entry found, don't update
    if (res === null) {
      return callback({
        msg: 'Not entry found for guid ' + guid + '. Update failed.'
      }, null);
    }

    // Apply new field values & update entity in DB
    for (var key in fields) {
      res.fields[key] = fields[key];
    }

    $fh.db({
      act: 'update',
      type: collection,
      guid: guid,
      fields: res.fields,
    }, function(err, data) {
      if (err) {
        return callback(err, null);
      } else if (data && data.fields) {
        return callback(null, new DbObject(data.fields, data.guid));
      } else {
        return callback(null, null);
      }
    });
  });
}


/**
 * Delete an entry in the database. Callback result is the deleted item.
 * @param {String}    collection
 * @param {String}    guid
 * @param {Function}  callback
 */

function remove(collection, guid, callback) {
  $fh.db({
    act: 'delete',
    type: collection,
    guid: guid
  }, function(err, data) {
    if (err) {
      return callback(err, null);
    }

    // Return fields if they exist
    if (data && data.fields) {
      return callback(null, new DbObject(data.fields, data.guid));
    }

    return callback(null, null);
  });
}


/**
 * Find items in the DB matching args. Returns resulting items to the callback as an array.
 * @param {String}    collection
 * @param {Object}    opts
 * @param {Function}  callback
 */

function find(collection, opts, callback) {
  opts.act = 'list';
  opts.type = collection;

  $fh.db(opts, function(err, data) {
    if (err) {
      return callback(err, null);
    }

    // Convert items to DB Objects
    var res = [];
    async.forEach(data.list, function(item, cb) {
      res.push(new DbObject(item.fields, item.guid));
      cb();
    }, function(err) {
      if (err) {
        return callback(err, null);
      }

      return callback(null, res);
    });
  });
}