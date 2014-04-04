module.exports={
    "getAllAirlines":getAllAirlines,
    "addAirline":addAirline,
    "removeAirline":removeAirline,
    "read":read
}


//implementation
var Articles=require("../../models/articles.js");
var log=require("../../logger").getLogger();
var parser=require("../lib/articleprocess");
function getAllAirlines(cb){
    Articles.findByAlias("_airlines",function(err,result){
        if (err){
            log.err(err);
            return cb(err);
        }else{
            if (!result){
                initAirline(function(err){
                    if (err){
                        log.err(err);
                    }
                    getAllAirlines(cb);
                });
            }else{
                cb(null,result);
            }
        }
    });
}

function initAirline(cb){
    var airline={
        "alias":"_airlines",
        "apps":[],
        "categories":[],
        "content":{},
        "name":"Airlines",
        "publish":true,
        "type":"json",
        "cat":"template",
        "template":"airline",
        "version":1,
        "uniqueAlias":true
    };
    Articles.create(airline,cb);
}
function addAirline(data,cb){
    var timeStamp=new Date().getTime();
    getAllAirlines(function(err,res){
        if (err){
            log.err(err);
            return cb(err);
        }else{
            parser.airlineItem(data,function(err,parsedData){
                res.content[timeStamp]=parsedData;
                Articles.update(res._id,res,function(err){
                    if (err){
                        return cb(err);
                    }else{
                        cb(null,parsedData,timeStamp);
                    }
                });
            });
        }
    });
}

function removeAirline(timeStamp,cb){
    getAllAirlines(function(err,res){
        if (err){
            log.err(err);
            return cb(err);
        }else{
            delete res.content[timeStamp];
            Articles.update(res._id,res,cb);
        }
    });
}
function read(timeStamp,cb){
    getAllAirlines(function(err,res){
        if (err){
            log.err(err);
            return cb(err);
        }else{
            cb(null,res.content[timeStamp]);
        }
    });
}