module.exports=processer;


var log=require("../../logger").getLogger();
var request=require("request");

/**
 * convert remote img to base64 encoded string
 * @param  {[type]}   imgSrc [description]
 * @param  {Function} cb     [description]
 * @return {[type]}          cb(err, base64EncodedImgString);
 */
function processer(imgSrc,cb){
    log.info("Convert "+imgSrc+" to inline image");
    request({
        "url":imgSrc,
        "method":"GET",
        "encoding":null //force returning a buffer
    },function(err,response,body){
        if (err){
            log.err(err);
            return cb(err);
        }
        var encodedImg="data:image/png;base64,"+body.toString("base64"); //assume png type. need defect here if browser fails.
        log.info("Image conerting:"+imgSrc+" succeed");
        cb(null,encodedImg);
    });
}