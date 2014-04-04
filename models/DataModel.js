module.exports=DataModel;
//implementation
var mongoDb=require("../db/mongodb.js");
var events=require("../events");
var async = require('async');
var log=require("../logger").getLogger();
var ObjectID=require("mongodb").ObjectID;
var util=require("util");
var EventEmitter=require('events').EventEmitter;
function DataModel(collectionName){
    EventEmitter.call(this);
    this.collectionName=collectionName;
    this.init();
};
util.inherits(DataModel, EventEmitter);

DataModel.prototype.create=create;
DataModel.prototype.read=read;
DataModel.prototype.remove=remove;
DataModel.prototype.truncate=truncate;
DataModel.prototype.update=update;

DataModel.prototype.init=function(){
    var that=this;
    this.db=mongoDb.getDb();
    if (this.db==null){
        events.once("dbReady",function(){
            that.init();
        });
    }else{
        this.collection=this.db.collection(this.collectionName);
        // console.log(this.collection);
        log.silly("DataModel: "+this.collectionName+" is ready.");    
    }
    
}
DataModel.prototype.objectId=function(idStr){
    return new ObjectID(idStr);
}
DataModel.prototype.findAll=function(cb){//not recommended.slow expensive. use cursor instead if possible
    this.collection.find().toArray(cb);
}
DataModel.prototype.findBy=function(field,val,cb){
    var arg={};
    arg[field]=val;
    this.collection.findOne(arg,cb);
}
//some legacy functions
function create(data,cb){
    data.lastUpdate=new Date().getTime();
    data.createDate=new Date();
    if (typeof data._id != "undefined"){
        delete data._id;
    }
    this.collection.insert(data,function(err,res){
        var item=null;
        
        if (res && res[0]){
            item=res[0];
        }else if (res){
            item=res;
        }
        cb(err,item);
    });
}

function read(id,cb){
    var idObj=typeof id ==="object"?id:new ObjectID(id.toString());
    this.collection.findOne({
        "_id":idObj
    },cb);
}
function update(id,data,cb){ //low efficiency..but usable
    var self = this;

    if (arguments.length==3){
        data._id=new ObjectID(id.toString());
    }else{
        cb=data;
        data=id;
        data._id=new ObjectID(data._id.toString());
    }
    data.lastUpdate=new Date().getTime();
    if (typeof data.version != "undefined"){
        data.version++;
    }

    // Ensure old fields aren't lost by reading them in
    read.call(self, data._id, function(err, oldData) {
        if(err) {
            return cb(err, null);
        }
        if (oldData==null){ //data not existing
            oldData={};
        }
        // Loop over new data keys and add to/overwrite old values
        async.each(Object.keys(data), function(key, callback) {
            if(key === ' _id') {
                return callback();
            }

            oldData[key] = data[key];
            return callback();
        }, function(){
            self.collection.save(oldData, cb);     
        });
    });
}

function remove(id,cb){
    var idObj=typeof id ==="object"?id:new ObjectID(id.toString());
    this.collection.findAndRemove({
        "_id":idObj
    },cb);
}

function truncate(cb){
    this.collection.remove(cb);
}
