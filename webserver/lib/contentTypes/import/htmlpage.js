var DefaultType=require("../default.js");
var util=require("util");
var log=require("../../../../logger").getLogger();
var utils=require("../../../util");
var htmlProcessor=require("../../articleprocess").core.html;
function HtmlPageType(){
    DefaultType.call(this,"import","html","htmlpage");
}
util.inherits(HtmlPageType,DefaultType);
HtmlPageType.prototype.parent=DefaultType.prototype;

HtmlPageType.prototype.processor=function(params,cb){
    var url=params.url;
    utils.remoteContent(url,function(err,htmlData){
        // console.log(htmlData);
        params.content=htmlData;
        //cb(null,params);
        htmlProcessor(params,cb);
    });
}

module.exports=HtmlPageType;