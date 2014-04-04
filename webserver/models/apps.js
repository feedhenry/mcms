var DataModel = require("../../models/DataModel.js");
var util = require("util");
var myUtil = require("../util");
var events = require("../../events");

function AppModel() {
    DataModel.call(this, "apps");
}
util.inherits(AppModel, DataModel);

var latestTimestamp = new Date().getTime();

function updateTimestamp() {
    latestTimestamp = new Date().getTime();
}

AppModel.prototype.getLatestTimestamp = function() {
    return latestTimestamp;
};


AppModel.prototype.parent = DataModel.prototype; //level1 inheritance only.
AppModel.prototype.create = function(data, cb) {
    updateTimestamp();

    data.alias = myUtil.aliasGen(data.name || "");
    this.parent.create.call(this, data, function() {
        events.emit(events.msg.updateAppTree);
        cb.apply({}, arguments);
        updateTimestamp();
    });
}
AppModel.prototype.findById = DataModel.prototype.read;
AppModel.prototype.findByAlias = function(alias, cb) {
    this.findBy("alias", alias, cb);
}
//for app model, update will replace the old data. see datamodel.update
AppModel.prototype.update = function(id, data, cb) {
    updateTimestamp();
    var idObj = typeof id === "object" ? id : this.objectId(id.toString());
    data._id = idObj;
    this.collection.save(data, function(err, res) {
        events.emit(events.msg.updateAppTree);
        cb(err, res);
        updateTimestamp();
    });
}
AppModel.prototype.remove = function(id, cb) {
    updateTimestamp();

    this.parent.remove.call(this, id, function(err, res) {
        events.emit(events.msg.updateAppTree);
        cb(err, res);
        updateTimestamp();
    });
}
module.exports = new AppModel();