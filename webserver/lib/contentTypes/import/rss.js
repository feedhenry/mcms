var DefaultType = require("../default.js");
var util = require("util");
var log = require("../../../../logger").getLogger();
var utils = require("../../../util");
var htmlProcessor = require("../../articleprocess").core.html;
var async = require("async");
var rssItemModel = require("../../../../models/rssitem.js");
var myUlti = require("../../../util");

function RssType() {
    DefaultType.call(this, "import", "json", "rss");
    this.renderUrl = "articles/navListRenderer";
    this.redirecUrl=null;
}
util.inherits(RssType, DefaultType);
RssType.prototype.parent.DefaultType = DefaultType.prototype;

RssType.prototype.processor = function(params, cb) {
    var self = this;
    self.pullRss(params, cb);
}
RssType.prototype.pullRss = function(params, cb) {
    if (params.pullRss && params.pullRss == "true") {
        log.info("Process RSS:" + JSON.stringify(params));
        var url = params.url;
        var alias = params.alias;
        utils.rss(url, function(err, feeds) {
            log.info("Feed size:" + feeds.length);
            if (err) {
                log.error("RSS process failed.");
                log.error(err);
                return cb(null, params);
            }
            rssItemModel.replace(alias, feeds, function(err, res) {
                if (err) {
                    log.error(err);
                    return cb(null, params);
                }
                var ids = [];
                res.forEach(function(item) {
                    ids.push({
                        _id: item._id,
                        title: item.title,
                        pubdate: item.pubdate,
                        author: item.author
                    });
                });
                params.content = ids;
                log.info("RSS processing finished.");
                cb(null, params);
            });
        });
    } else {
        cb(null, params);
    }
}
RssType.prototype.getExtra = function(extraId, cb) {
    rssItemModel.read(extraId, cb);
}
RssType.prototype.render = function(res, props) {
    if (props.article) {
        props.navList = [{
            "name": "Feed Config",
            "id": "rss_feedconfig"
        }, {
            "name": "Feeds & Preview",
            "id": "rss_feedspreview"
        }, {
            "name": "Preview Template",
            "id": "rss_preview_template"
        }]
    }

    this.parent.DefaultType.render.call(this, res, props);
}
module.exports = RssType;