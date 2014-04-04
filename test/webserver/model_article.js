var assert=require("assert");
var articleModel=require("../../webserver/../models/articles.js");
var ids=[];
var async=require("async");
describe("Article Model module",function(){
    before(require("../dbChecker.js"));
    after(function(done){
        async.each(ids,function(item,done1){
            articleModel.remove(item,done1);
        },function(){
            done();
        });
    });
    it(" can process remote image tag to inline ones",function(done){
        var html="<!DOCTYPE html>"+
        "<html><head></head>"+
        "<body>"+
            "seperator<img src='http://keyangxiang.com/images/logo.png' />seperator"+
            "<img src='data:image/png;base64, sometestdata'/>"+
        "</body>"+
        "</html>";
         articleModel._test._processContent({type:"html" ,"cat":"core",content:html},function(err,data){
            assert(data.content.indexOf("http://keyangxiang.com/images/logo.png")==-1);
            assert(data.content.indexOf("data:image/png;base64, sometestdata")>0);
            done();
         });
    });
    it (" should process invalid html code ",function(done){
        var html='<!DOCTYPE html>\r\n<html>\r\n<head>\r\n</head>\r\n<body>\r\n<p><img src="http://keyangxiang.com/images/logo.png" alt="" width="250" height="50" /></p>\r\n</body>\r\n</html>';
        articleModel._test._processContent({type:"html" ,"cat":"core",content:html},function(err,data){
            assert(data.content.indexOf("http://keyangxiang.com/images/logo.png")==-1);
            done();
         });
    });

    it (" should process multiple images",function(done){
        var html='<head></head><body><p><img src="data:image/png;base64,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" alt="" width="250" height="50" /></p><br/><img src="http://keyangxiang.com/images/logo.png" /></body>';
        html="<!DOCTYPE html><html>"+html+"</html>";
        articleModel._test._processContent({type:"html" ,"cat":"core",content:html},function(err,data){
        
            assert(data.content!="");
            assert(data.content.indexOf("http://keyangxiang.com/images/logo.png")==-1);
            done();
         });
    });

    it (" should process head with scripts",function(done){
            var html='<head><script>alert("helloworld")</script></head><body><p><img src="data:image/png;base64,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" alt="" width="250" height="50" /></p><br/><img src="http://keyangxiang.com/images/logo.png" /></body>';
            html="<!DOCTYPE html><html>"+html+"</html>";
            articleModel._test._processContent({type:"html" ,"cat":"core",content:html},function(err,data){
                assert(data.content!="");
                assert(data.content.indexOf("alert")>0);
                assert(data.content.indexOf("http://keyangxiang.com/images/logo.png")==-1);
                done();
             });
        });
    it ("should create a data with auto generated alias",function(done){
        var data={
            "type":"html",
            "name":"Hello World 1 !@£$%%^$@£",
            "content":'<!DOCTYPE html>\r\n<html>\r\n<head>\r\n</head>\r\n<body>\r\n<p><img src="http://keyangxiang.com/images/logo.png" alt="" width="250" height="50" /></p>\r\n</body>\r\n</html>'
        };
        articleModel.create(data,function(err,res){
            assert(!err);
            assert(res);
            assert(res.alias);
            ids.push(res._id);
            assert(res.alias.split("_")[0]=="helloworld1");
            done();
        });
    });

     it (" should process head with remote scripts",function(done){
            var html='<head><script src="/js/apps.js"></script></head><body></body>';
            html="<!DOCTYPE html><html>"+html+"</html>";
            articleModel._test._processContent({type:"html" ,"cat":"core",content:html},function(err,data){
                console.log(data);
                assert(data.content!="");
                assert(data.content.indexOf("app.js")==-1);
                done();
             });
        });

     it (" should process head with remote stylesheets",function(done){
            var html='<head><link></link><link href="http://keyangxiang.com/css/basic.css" rel="stylesheet"></link></head><body></body>';
            html="<!DOCTYPE html><html>"+html+"</html>";
            articleModel._test._processContent({type:"html" ,"cat":"core",content:html},function(err,data){
                assert(data.content!="");
                assert(data.content.indexOf("basic.css")==-1);
                done();
             });
        });

});