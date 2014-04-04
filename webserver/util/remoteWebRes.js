module.exports=processer;


var log=require("../../logger").getLogger();
var request=require("request");

/**
 * convert remote img to base64 encoded string
 * @param  {[type]}   imgSrc [description]
 * @param  {Function} cb     [description]
 * @return {[type]}          cb(err, base64EncodedImgString);
 */
function processer(src,mobile,cb){
    if (arguments.length ==2){
        cb=mobile;
        mobile=true;
    }
    var fullUrlTest=/http.*/;
    if (!fullUrlTest.test(src)){
        var host=process.env["host"]?process.env["host"]:"http://127.0.0.1:8001";
        src=host+src;
    }
    log.info("Download "+src+" to loacal");
    var userAgent="Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8A293 Safari/6531.22.7";
    request({
        "url":src,
        "method":"GET",
        "headers":{
            "User-Agent":userAgent
        }
    },function(err,response,body){
        if (err){
            log.err(err);
            return cb(err);
        }
        log.info("Content downloaded for:"+src);
        cb(null,body);
    });
}