module.exports=processor;

var utils=require("../../util");
var log=require("../../../logger").getLogger();

function processor(params,cb){
    var webUrl=params.url;
    utils.remoteContent(webUrl,function(err,data){
        if (err){
            log.err(err);
            cb(err)
        }else{
            
        }
    });
}