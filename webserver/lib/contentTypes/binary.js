/** 
 * binary content
 */
module.exports=BinaryType;
var DefaultType=require("./default.js");
var util=require("util");
var myUtil=require("../../util");
var log=require("../../../logger").getLogger();
var downloadFolder="./webserver/public/download";
var fs=require("fs");
var async=require("async");
function BinaryType(name,req){
  DefaultType.call(this,"import","bin",name);
  this.req=req;

}
util.inherits(BinaryType,DefaultType);

BinaryType.prototype.processor=function(params,callback){
  var processors=[];
  var self=this;
  processors.push(function(cb){
    self.processFile(params,cb);
  });
  async.series(processors,function(){
    callback(null,params);
  });
}
BinaryType.prototype.processFile=function(params,cb){
  log.info("Process uploaded files");
  var self=this;
  if (self.req && self.req.files){
    var file=self.req.files.file;
    if (file.size===0){
      log.info("No file uploaded. Size is 0.");
      cb(null,null);
    }else{
      log.info("Start to persist file to file system."); //may use db blob 
      var oriName=file.originalFilename;  
      var hashName=myUtil.md5(oriName)+"."+oriName.split(".").pop();
      var downloadPath=downloadFolder+"/"+hashName;
      log.info("Local file path: "+downloadPath);
      var rs=fs.createReadStream(file.path);
      rs.on("end",function(){
        log.info("File uploaded");
        params.fileName=oriName;
        params.fileHashName=hashName;
        params.fileSize=file.size;
        params.fileType=file.type;
        cb(null,params);
      }).on("error",function(err){
        log.error(err);
        rs.destroy();
        cb(err);
      }).pipe(fs.createWriteStream(downloadPath));

    }
  }else{
    log.info("No file uploaded");
    cb(null,null);
  }
}