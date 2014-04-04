var rssItemModel=require("../../models/rssitem.js");
var assert=require("assert");
var async=require("async");
var ids=[];
describe("RSS Item model",function(){
    before(require("../dbChecker.js"));
    after(function(done){
        async.each(ids,function(item,done1){
            rssItemModel.remove(item,done1);
        },function(){
            done();
        });
    });
    it ("should create a series of feeds with specific alias",function(done){
        var feeds=[
        {
            "title":"title1",
            "description":"description1"
        },
        {
            "title":"title2",
            "description":"description2"
        },{
            "title":"title3",
            "description":"description3"
        }
        ];
        var contentAlias="_test";
        rssItemModel.replace(contentAlias,feeds,function(err,res){
            assert(!err);
            
            for (var i=0;i<res.length;i++){
                ids.push(res[i]._id);
            }
            rssItemModel.findByContentAlias(contentAlias,function(err,res){
                assert(res.length==feeds.length);
                done();
            });
            
        });
    });
    it ("should replace existed feeds",function(done){
        var feeds=[
        {
            "title":"title1",
            "description":"description1"
        },
        {
            "title":"title2",
            "description":"description2"
        },{
            "title":"title3",
            "description":"description3"
        }
        ];
        var contentAlias="_test";
        rssItemModel.replace(contentAlias,feeds,function(err,res){
            assert(!err);
            
            for (var i=0;i<res.length;i++){
                ids.push(res[i]._id);
            }
            feeds=[{
                "title":"fff",
                "description":"ddd"
            }];
            rssItemModel.replace(contentAlias,feeds,function(err,res){
                rssItemModel.findByContentAlias(contentAlias,function(err,res){
                    assert(res.length==1);
                    assert(res[0].title=="fff");
                    ids.push(res[0]._id);
                    done();
                }); 
            });
            
            
        });
    });
    it ("should replace to empty array",function(done){
        var feeds=[];
        var contentAlias="_test";
        rssItemModel.replace(contentAlias,feeds,function(err,res){
            assert(!err);
            
            for (var i=0;i<res.length;i++){
                ids.push(res[i]._id);
            }
            rssItemModel.findByContentAlias(contentAlias,function(err,res){
                assert(res.length==feeds.length);
                done();
            });
            
        });

    });
});