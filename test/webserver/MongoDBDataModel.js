var assert = require("assert");
var DataModel = require("../../models/DataModel.js");

var dbReady = false;
var async=require("async");


describe("Apps Controller module", function() {
    var testDataM=new DataModel("_testCol");
    before(require("../dbChecker.js"));
    after(function(done){
        testDataM.truncate(done);
    });

    it ("should get collection from db",function(){
        assert(testDataM.collection);
    });

    it ("should create a data with createdData and lastUpdate date",function(done){
        testDataM.create({"hello":"world"},function(err,res){
            assert(!err);
            assert(res);
            assert(res.hello=="world");
            assert(res.lastUpdate);
            assert(res.createDate);
            done();
        });
    });

    it ("should read by id",function(done){
        testDataM.create({"hello":"world"},function(err,res){
            assert(!err);
            assert(res);
            assert(res.hello=="world");
            assert(res.lastUpdate);
            assert(res.createDate);
            var id=res._id;
            testDataM.read(id,function(err,res1){
                assert(!err);
                assert(res1);
                assert(res1.hello=="world");
                assert(res1.lastUpdate ==res.lastUpdate);
                assert(res1.createDate.getTime()==res.createDate.getTime());
                done();
            });
        });
    });
    it ("should remove by id",function(done){
        testDataM.create({"hello":"world"},function(err,res){
            assert(!err);
            assert(res);
            assert(res.hello=="world");
            assert(res.lastUpdate);
            assert(res.createDate);
            var id=res._id;
            testDataM.remove(id,function(err,res1){
                assert(!err);
                assert(res1);
                assert(res1.hello=="world");
                assert(res1.lastUpdate ==res.lastUpdate);
                assert(res1.createDate.getTime()==res.createDate.getTime());
                done();
            });
        });
    });

    it ("should truncate collection from db",function(done){
        testDataM.truncate(function(err){
            assert(!err);
            testDataM.collection.count(function(err,c){
                assert(!err);
                assert(c==0);
                done();
            });
        });
    });
     it ("should update collection from db",function(done){
        testDataM.create({"hello":"world"},function(err,res){
            assert(!err);
            assert(res);
            assert(res.hello=="world");
            assert(res.lastUpdate);
            assert(res.createDate);
            var id=res._id;
            testDataM.update(id,{"aaa":"bbb"},function(err,res1){
                assert(!err);
                assert(res1);
                testDataM.read(id,function(err,res1){
                    assert(res1.aaa=="bbb");
                    assert(res1.lastUpdate !=res.lastUpdate);
                    done();
                });
                
            });
        });
    });
     it ("should update collection with 2 parameters",function(done){
        testDataM.create({"hello":"world"},function(err,res){
            assert(!err);
            assert(res);
            assert(res.hello=="world");
            assert(res.lastUpdate);
            var lm1=res.lastUpdate;
            assert(res.createDate);
            var id=res._id;
            res.aaa="bbb";
            setTimeout(function(){
                testDataM.update(res,function(err,res1){
                    assert(!err);
                    assert(res1);
                    testDataM.read(id,function(err,res1){
                        assert(res1.aaa=="bbb");
                        assert(res1.hello=="world");
                        assert(res1.lastUpdate !=lm1);
                        assert(res1.createDate.getTime() ==res.createDate.getTime());
                        done();
                    });
                    
                });
            },100);
            
        });
    });
});