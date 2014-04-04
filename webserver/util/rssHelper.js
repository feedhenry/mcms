var request=require("request");
var FeedParser=require("feedparser");
var logger=require("../../logger");
module.exports=function(url,cb){
    var rtn=[];
    var count=0;
    request(url).pipe(new FeedParser).on("article",function(art){
        //console.log(art);
        logger.info("get rss item. Count:"+(++count));
        rtn.push(art);
    }).on ("end",function(){
        cb(null,rtn);
    }).on("error",function(err){
        cb(err);
    });
}