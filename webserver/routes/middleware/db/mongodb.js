/**
 * /db/mongodb.js
 * Wrapper for mongodb
 */

module.exports = {
    create : create,
    read : read,
    update : update,
    remove : remove,
    find : find,
    count : count
};

var DbObject = require('./dbobject.js');
var mongo = require('mongodb');
var async = require('async');
var db = null;
var ObjectID = mongo.ObjectID;

// Might need ENV vars for here
// var MongoClient = require('mongodb').MongoClient;
// MongoClient.connect('mongodb://127.0.0.1:27017/cms', {
//     native_parser : true,
//     safe : true
// }, function(err, instance) {
//     if (err) {
//         throw err;
//     }

//     db = instance;
// });

/**
 * Count entries in the database.
 * @param {String}    collection  Collection to count.
 * @param {Function}  callback(err, item)
 */

function count(collection, callback) {
    db.collection(collection).count(function(err, res) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, res);
    });
}

/**
 * Create entries in the database. If multiple entries created callback recieves null as result
 * @param {Mixed}     data        Object Array/Object to insert
 * @param {String}    collection  Collection to insert into.
 * @param {Function}  callback(err, item)
 */

function create(data, collection, callback) {
    db.collection(collection).insert(data, function(err, res) {
        if (err) {
            return callback(err, null);
        }

        if (res && res[0] && typeof data === 'object') {
            return callback(null, new DbObject(res[0]));
        }

        // No error and no data to return
        return callback(null, true);
    });
}

/**
 * Retrieve an item from the specified collection with the ID provided
 * @param {String}    collection
 * @param {String}    id
 * @param {Function}  callback
 */

function read(collection, id, callback) {
    db.collection(collection).findOne({
        _id : id
    }, function(err, item) {
        if (err) {
            return callback(err, null);
        }

        if (item) {
            return callback(null, new DbObject(item));
        }
        
        return callback(null, null);
    });
}

/**
 * Update the item with specified id in collection. Callback result is the updated item if existing
 * @param {String}    collection
 * @param {String}    id
 * @param {Object}    fields
 * @param {Function}  callback(err, item)
 */

function update(collection, id, fields, callback) {
    read(collection, id, function(err, item) {
        if (err) {
            return callback(err, null);
        }
        
        // Update the item with new fields
        for ( var key in fields) {
            item[key] = fields[key];
        }
        
        // Update item in the DB
        db.collection(collection).update({
            _id : id
        }, item, function(err, res) {
            if (err) {
                return callback(err, null);
            }

            // Return the updated item
            read(collection, id, function(err, item) {
                if (err) {
                    return callback(err, null);
                }

                if (item) {
                    return callback(null, new DbObject(item));
                }

                return callback(null, null);
            });
        });
    });
}

/**
 * Delete an entry in the database. Callback result is the deleted item.
 * @param {String}    collection
 * @param {String}    id
 * @param {Function}  callback
 */

function remove(collection, id, callback) {
    db.collection(collection).findAndRemove({
        _id : id
    }, function(err, item) {
        if (err) {
            return callback(err, null);
        }

        return callback(null, new DbObject(item));
    });
}

/**
 * Find items in the DB matching args. Returns resulting items to the callback as an array.
 * @param {String}    collection
 * @param {Object}    opts
 * @param {Function}  callback
 */

function find(collection, opts, callback) {
    // FHDB OPERATORS - Support these for queries
    // eq
    // type : object - A set of key/value pairs to specify the query restrictions
    // is equal to
    // mandatory : no
    // ne
    // type : object - A set of key/value pairs to specify the query restrictions
    // not equal to
    // mandatory : no
    // It
    // type : object - A set of key/value pairs to specify the query restrictions
    // less than
    // mandatory : no
    // le
    // type : object - A set of key/value pairs to specify the query restrictions
    // less than or equal
    // mandatory : no
    // gt
    // type : object - A set of key/value pairs to specify the query restrictions
    // greater than
    // mandatory : no
    // ge
    // type : object - A set of key/value pairs to specify the query restrictions
    // greater than or equal
    // mandatory : no
    // like
    // type : object - A set of key/value pairs to specify the query restrictions
    // Match some part of the field. Based on Mongo regex matching logic
    // mandatory : no
    // in
    // type : object - A set of key/value pairs to specify the query restrictions
    // The same as $in operator in MongoDB, to select documents where the field (specified by the key) equals any value in an array (specified by the value)

    var fhoperators = {
        'eq' : null,
        'ne' : '$ne',
        'lt' : '$lt',
        'le' : '$lte',
        'gt' : '$gt',
        'ge' : '$gte',
        'in' : '$in',
        'like' : null,
    };

    // Selector to use in query
    var selector = {};

    // Nasty stuff :(
    // Loop over each operator and convert to mongo style lookup
    for ( var key in fhoperators) {
        // eq is special case
        if (key === 'eq') {
            for ( var item in opts['eq']) {
                selector[item] = opts['eq'][item];
            }
        }

        // like is special case
        else if (key === 'like') {
            for ( var item in opts['like']) {
                selector[item] = {
                    '$regex' : new RegExp('.*' + opts['like'][item] + '.*')
                };
            }
        }

        // Check has opts got the key, if so add it to selector
        else if (opts.hasOwnProperty(key)) {
            // Else add in as selector type, e.g 
            // {
            //   "age": {
            //     "$gt": 22
            //   }
            // }
            for ( var item in opts[key]) {
                if (!selector[item]) {
                    selector[item] = {};
                }

                selector[item][fhoperators[key]] = opts[key][item];
            }
        }
    }

    // Run DB query with our generated selector 
    db.collection(collection).find(selector).toArray(function(err, items) {
        if (err) {
            return callback(err, null);
        }

        // Convert items to DB Objects
        var res = [];
        async.forEach(items, function(item, cb) {
            res.push(new DbObject(item));
            cb();
        }, function(err) {
            if (err) {
                return callback(err, null);
            }

            return callback(null, res);
        });
    });
}