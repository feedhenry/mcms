var RssType=require("../../webserver/lib/contentTypes/import/rss.js");
var rssItemModel=require("../../models/rssitem.js");
var articleModel=require("../../models/articles.js");
var assert=require("assert");
var contentIds=[];
var rssItemIds=[];
var async=require("async");
describe("RSSType",function(){
    before(require("../dbChecker.js"));
    after(function(done){
        async.each(rssItemIds,function(item,done1){
            rssItemModel.remove(item,done1);
        },function(){
            async.each(contentIds,function(item,done1){
                articleModel.remove(item,done1);
            },function(){
                done();
            });
        });
    });
    it("should create content as well as parsing & storing rss feeds",function(done){
        this.timeout(15000);
        var param={
            "url":"http://www.costain.com/rss/news-rss-feed.aspx",
            "name":"Costain News"
        };
        var rssType=new RssType();
        rssType.upsert(param,function(err,url,data){
            assert(!err);
            assert(data);
            assert(data.content);
            assert(data.content.length>0);
            contentIds.push(data._id);
            rssItemIds=rssItemIds.concat(data.content);
            // console.log(rssItemIds);
            done();
        });
    });
});