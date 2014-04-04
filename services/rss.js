var CronService=require("./cronservice.js");
var util=require("util");
var log=require("../logger");
var async=require("async");
var request=require("request");
var FeedParser=require("feedparser");
var rssModel=require("../models/rss.js");

function RSSService(){
    CronService.call(this,"rss","13 */30 * * * *");
    this.feeds={};
    this.feedsCount=0;
}
util.inherits(RSSService,CronService);
RSSService.prototype.parent.CronService=CronService.prototype;
RSSService.prototype.registerFeed=function(feed){
    if (typeof this.feeds[feed.name]=="undefined"){
        this.feedsCount++;
    }
    this.feeds[feed.name]=feed;
}
RSSService.prototype.unregisterFeed=function(feed){
    if (this.feeds[feed.name]){
        delete this.feeds[feed.name];
        this.feedsCount--;
    }
}

RSSService.prototype.run=function(){
    this.parent.CronService.run.call(this);
    log.info("RSSService: Start to process "+this.feedsCount+" feeds.");
    function _genFunc(feed){
        var lastUpdate=feed.lastUpdate;
        var url=feed.url;
        return function (cb){
            request(url).pipe(new FeedParser).on("article",function(article){

            });
        }
    }
}


module.exports=new RSSService();

