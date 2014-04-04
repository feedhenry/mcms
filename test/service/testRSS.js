var FeedParser=require("feedparser");
var assert=require("assert");
var fs=require("fs");
var dataPath=__dirname+"/data/sampleRSS.xml";

describe("feedParser",function(){
    it("should consume a readable stream object",function(done){
        var rs=fs.createReadStream(dataPath);
        var articles=[];
        var ws=new FeedParser();
        rs.pipe(ws).on("article",function(article){
            articles.push(article);

        }).on("end",function(){
            assert(articles.length==868);
            done();
        });
    });
});

describe("rssService",function(){
    
});