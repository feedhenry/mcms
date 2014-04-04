var assert=require("assert");
var userModel=require("../../webserver/models/users.js");
var ids=[];
var async=require("async");
var events=require("../../events");
describe("User Model module",function(){
    before(require("../dbChecker.js"));
    after(function(done){
        async.each(ids,function(item,done1){
            userModel.remove(item,done1);
        },function(){
            done();
        });
    });
    it ("can create a user",function(done){
        var data={
            "name":"testName",
            "password":"test",
            "email":"tt@ttt.com"
        }
        userModel.create(data,function(err,res){
            assert(!err);
            assert(res);
            ids.push(res._id);
            assert(res.name=="testName");
            done();
        });
    });

    it ("can find user by name",function(done){
        var data={
            "username":"testName1",
            "name":"testName",
            "password":"test",
            "email":"tt1@ttt.com"
        }
        userModel.create(data,function(err,res){
            console.log(res);
            assert(!err);
            assert(res);
            ids.push(res._id);
            assert(res.name=="testName");
            userModel.findByUsername("testName1",function(err,res){
                assert(!err);
                assert(res);
                
                assert(res.username=="testName1");
                done();
            });
            
        });
    });

   
});