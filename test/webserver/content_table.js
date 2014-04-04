var assert = require("assert");
var TableContent=require("../../webserver/lib/contentTypes/core/table.js");
var tableContent = new TableContent();
var events = require("../../events");
var dbReady = false;
var async=require("async");
var ids=[];
var ArticleModel=require("../../webserver/../models/articles.js");
describe("TableContent",function(){
    before(require("../dbChecker.js"));
    after(function(done){
        async.each(ids,function(item,done){
            ArticleModel.remove(item,done);
        },function(){
            done();
        });
    });
    it ("should create a new instance content if _id is not there ",function(done){
        var data={
          "cat": "core",
          "type": "table",
          "template": "table",
          "_id": "",
          "alias": "__fdsa",
          "name": "fdsa",
          "publish": "true",
          "version": "",
          "field_name": ""
        }
        tableContent.upsert(data,function(err,url,obj){
            assert(!err);
            assert(obj);
            assert(obj._id);
            ids.push(obj._id);
            assert(obj.alias=="__fdsa");
            done();
        });
    });

    it ("should add table meta data if new field existed",function(done){
        var data={
          "cat": "core",
          "type": "table",
          "template": "table",
          "_id": "",
          "alias": "__fdsa",
          "name": "fdsa",
          "publish": "true",
          "version": "",
          "field_name": "hello",
          "field_type":"text"
        }
        tableContent.upsert(data,function(err,url,obj){
            assert(!err);
            assert(obj);
            assert(obj._id);
            ids.push(obj._id);
            assert(obj.alias=="__fdsa");
            assert(obj.tableMeta);
            for (var key in obj.tableMeta){
              assert(obj.tableMeta[key].fieldName=="hello");
              assert(obj.tableMeta[key].fieldType=="text");
            }
            done();
        });
    });

    it ("should add table meta data if new field is added",function(done){
        var data={
          "cat": "core",
          "type": "table",
          "template": "table",
          "_id": "",
          "alias": "__fdsa",
          "name": "fdsa",
          "publish": "true",
          "version": "",
          "field_name": "hello",
          "field_type":"text"
        };
        var data1={
          "cat": "core",
          "type": "table",
          "template": "table",
          "_id": "",
          "alias": "__fdsa",
          "name": "fdsa",
          "publish": "true",
          "version": "",
          "field_name": "hello1",
          "field_type":"text"
        }
        tableContent.upsert(data,function(err,url,obj){
            assert(!err);
            assert(obj);
            assert(obj._id);
            ids.push(obj._id);
            assert(obj.alias=="__fdsa");
            assert(obj.tableMeta);
            data1._id=obj._id;
            tableContent.upsert(data1,function(err,url,obj){
              assert(!err);
              assert(obj);
              var count=0;

              
              for (var key in obj.tableMeta){
                count++;
              }
              assert(count==2);
              done();  
            });
            
        });
    });
   it ("should remove table meta data ",function(done){
        var data={
          "cat": "core",
          "type": "table",
          "template": "table",
          "_id": "",
          "alias": "__fdsa",
          "name": "fdsa",
          "publish": "true",
          "version": "",
          "field_name": "hello",
          "field_type":"text"
        }
        var data1={
          "cat": "core",
          "type": "table",
          "template": "table",
          "_id": "",
          "alias": "__fdsa",
          "name": "fdsa",
          "publish": "true",
          "version": "",
          "remove_field_timestamp":""
        }
        tableContent.upsert(data,function(err,url,obj){
            assert(!err);
            assert(obj);
            assert(obj._id);
            ids.push(obj._id);
            assert(obj.alias=="__fdsa");
            assert(obj.tableMeta);
            for (var key in obj.tableMeta){
              assert(obj.tableMeta[key].fieldName=="hello");
              assert(obj.tableMeta[key].fieldType=="text");
              data1.remove_field_timestamp=key;
            }
            data1._id=obj._id;
            tableContent.upsert(data1,function(err,url,obj){
              assert(!err);
              assert(obj);
              var count=0;
              for (var key in obj.tableMeta){
                count++;
              }
              assert(count==0);
              done();  
            });
            
        });
    });

    it ("should add table content ",function(done){
        var data={
          "cat": "core",
          "type": "table",
          "template": "table",
          "_id": "",
          "alias": "__fdsa",
          "name": "fdsa",
          "publish": "true",
          "version": "",
          "field_name": "hello",
          "field_type":"text",
          "add_content":"true",
          "_content": { hello: 'fdsa'}
        }
        tableContent.upsert(data,function(err,url,obj){
            assert(!err);
            assert(obj);
            assert(obj._id);
            ids.push(obj._id);
            assert(obj.alias=="__fdsa");
            assert(obj.tableMeta);
            for (var key in obj.content){
              assert(obj.content[key].hello=="fdsa");
            }
            done();
        });
    });

    it ("should convert image content",function(done){
        var data={
          "cat": "core",
          "type": "table",
          "template": "table",
          "_id": "",
          "alias": "__fdsa",
          "name": "fdsa",
          "publish": "true",
          "version": "",
          "field_name": "hello",
          "field_type":"image",
          "add_content":"true",
          "_content": { hello: 'http://keyangxiang.com/images/logo.png'}
        }
        tableContent.upsert(data,function(err,url,obj){
            assert(!err);
            assert(obj);
            assert(obj._id);
            ids.push(obj._id);
            assert(obj.alias=="__fdsa");
            assert(obj.tableMeta);
            for (var key in obj.content){
              assert(obj.content[key].hello!="http://keyangxiang.com/images/logo.png");
              console.log(obj.content[key].hello);
            }

            done();
        });
    });
});