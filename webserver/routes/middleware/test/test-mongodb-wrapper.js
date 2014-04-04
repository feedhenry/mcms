var db = require('../db').mongo;
var assert = require('assert');

// Wait for DB to connect
before(function(done) {
  setTimeout(function() {
    done();
  }, 1000);
});

describe('Test the mongodb CRUD wrapper.', function() {
  describe('Test .create()', function() {
    it('Should insert an item to specified collecton and return resulting object.', function(done) {
      db.create({
        name: 'evan',
        age: 22
      }, 'users', function(err, user) {
        assert(!err);
        assert(user);
        assert(user.name === 'evan');
        assert(user.age === 22);
        assert(user._id);
        done();
      });
    });
  });


  describe('Test .read()', function() {
    it('Should insert an item and use the resulting ID to retrieve the same item.', function(done) {
      db.create({
        name: 'evan',
        age: 22
      }, 'users', function(err, res) {
        assert(!err);

        db.read('users', res.getId(), function(err, user) {
          assert(!err);
          assert(user);
          assert(user.name === 'evan');
          assert(user.age === 22);
          assert(user.getId().toString() === res.getId().toString());
          done();
        });
      });
    });
  });


  describe('Test .update()', function() {
    it('Should insert an item to specified collecton and then update it.', function(done) {
      db.create({
        name: 'evan',
        age: 22
      }, 'users', function(err, user) {
        assert(!err);

        db.update('users', user.getId(), {
          name: 'john',
          job: 'engineer'
        }, function(err, res) {
          assert(!err);
          assert(res);
          assert(res.name === 'john');
          assert(res.age === 22);
          assert(res.job === 'engineer');
          done();
        });
      });
    });
  });


  describe('Test .remove()', function() {
    it('Should insert an item to specified collecton and then remove it.', function(done) {
      db.create({
        name: 'evan',
        age: 22
      }, 'users', function(err, user) {
        assert(!err);

        db.remove('users', user.getId(), function(err, res) {
          assert(!err);
          assert(res);
          assert(res.name === user.name);
          assert(res.getId().toString() === user.getId().toString());
          done();
        })
      });
    });
  });


  describe('Test .find()', function() {
    it('Should find items using equality operator.', function(done) {
      db.create({
        name: 'alan',
        age: 23
      }, 'users', function(err, user) {
        assert(!err);
        assert(user);

        db.find('users', {
          eq: {
            name: 'alan'
          }
        }, function(err, res) {
          assert(!err);
          assert(res);
          assert(res.length >= 1);
          done();
        });
      });
    });
  });

  describe('Test .find()', function() {
    it('Should find no items using equality operator.', function(done) {
      db.find('users', {
        eq: {
          name: 'sam'
        }
      }, function(err, res) {
        assert(!err);
        assert(res);
        assert(res.length === 0);
        done();
      });
    });
  });

  describe('Test .find()', function() {
    it('Should find no items using like operator.', function(done) {
      db.find('users', {
        like: {
          name: 'al'
        }
      }, function(err, res) {
        assert(!err);
        assert(res);
        assert(res.length >= 1);
        res.forEach(function(item) {
          assert(item.name.indexOf('al') != -1);
        })
        done();
      });
    });
  });

  describe('Test .find()', function() {
    it('Should find no items using less than operator.', function(done) {
      db.find('users', {
        lt: {
          age: 23
        }
      }, function(err, res) {
        console.log(res);
        assert(!err);
        assert(res);
        assert(res.length >= 1);
        res.forEach(function(item) {
          assert(item.age < 23);
        })
        done();
      });
    });
  });
});