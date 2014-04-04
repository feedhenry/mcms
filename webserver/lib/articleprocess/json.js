module.exports=processFunc;

var logger=require("../../../logger").getLogger();
function processFunc(data,cb){
    var content=data.content;
    if (typeof content =="string"){
        try{
            data.content=JSON.parse(content);
        }catch(e){
            logger.err(e);
            data.content={};
        }
    }else if (! typeof content =="object"){
        logger.err("Unknown type for JSON type article");
        data.content={};
    }
    cb(null,data);
}