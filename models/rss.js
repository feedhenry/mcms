module.exports={
    "getAllLiveRssFeed":getAllLiveRssFeed
    
}

var articleModel=require("./articles.js");
var util=require("util");

//return all live rss feed from content collection
function getAllLiveRssFeed(cb){
    articleModel.collection.find({
        "cat":"import",
        "type":"json",
        "template":"rss",
        "ispoll":true
    }).toArray(cb);
}
// //update Rss Content with updated feeds.
// function updateRssFeed(_id,feedsRef,cb){
//     articleModel.findById(_id,function(err,res){
//         res.feedItems=feedsRef;
//         articleModel.update(_id,res,cb);
//     });
// }

