var DataModel = require("./DataModel.js");
var util = require("util");
var async = require("async");

function RssItemModel() {
    DataModel.call(this, "rssitem");
}
util.inherits(RssItemModel, DataModel);
RssItemModel.prototype.replace = function(contentAlias, feeds, cb) {
    var that = this;
    this.removeByContentAlias(contentAlias, function(err) {
        if (feeds.length > 0) {
            for (var i = 0; i < feeds.length; i++) {
                feeds[i].contentAlias = contentAlias;
            }
            that.collection.insert(feeds, cb);
        }else{
            cb(null,feeds);
        }

    });

}
RssItemModel.prototype.removeByContentAlias = function(contentAlias, cb) {
    this.collection.remove({
        "contentAlias": contentAlias
    }, cb);
}
RssItemModel.prototype.findByContentAlias = function(contentAlias, cb) {
    this.collection.find({
        "contentAlias": contentAlias
    }).toArray(cb);
}

module.exports = new RssItemModel();