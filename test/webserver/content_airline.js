var assert = require("assert");
var AirlineContent=require("../../webserver/lib/contentTypes/template/airline.js");
var airlineContent = new AirlineContent();
var events = require("../../events");
var dbReady = false;
var async=require("async");
describe("Airline Content Type module", function() {
    before(require("../dbChecker.js"));
    var inserted=[];
    after(function(done){
        function _removeFunc(timeStamp){
            return function(cb){
                airlineContent.remove(timeStamp,cb);
            }
        }
        var funcs=[];
        inserted.forEach(function(item){
            funcs.push(_removeFunc(item));
        });
        async.series(funcs,done);
    });
    it("can getAllAirlines and will initi a new one if not exist", function(done) {
        airlineContent.listItems(function(err, res) {
            assert(!err);
            assert(res);
            assert(res.alias == "_airlines");
            assert(res.name == "Airlines");
            done();
        });
    });

    it("can add airline and convert icon to base64 img", function(done) {
        var airLineData = {
            "airline_name": "Aerlingus",
            "fis_code": "ALE",
            "aos_code": "AAE",
            "icon_url": "http://www.itoa-ireland.com/wp-content/uploads/Aer-Lingus-Logo.jpg"
        };
        airlineContent.add(airLineData, function(err, url,data, timeStamp) {
            assert(!err);
            assert(data);
            assert(url);
            assert(timeStamp);
            assert(data.fis_code=="ALE");
            assert(data.aos_code=="AAE");
            assert(data.iconData.indexOf("http")==-1);
            inserted.push(timeStamp);
            done();
        });
    });

    it("can remove airline",function(done){
        var airLineData = {
            "airline_name": "Aerlingus",
            "fis_code": "ALE",
            "aos_code": "AAE",
            "icon_url": "http://www.itoa-ireland.com/wp-content/uploads/Aer-Lingus-Logo.jpg"
        };
        airlineContent.add(airLineData, function(err, url,data, timeStamp) {
            assert(!err);
            assert(data);
            assert(timeStamp);
            assert(data.fis_code=="ALE");
            assert(data.aos_code=="AAE");
            assert(data.iconData.indexOf("http")==-1);
            airlineContent.remove(timeStamp,function(err){
                assert(!err);
                airlineContent.listItems(function(err,res){
                    assert(!err);
                    assert(!res.content[timeStamp]);
                    done();
                });
            });
        });
    });

    it("can read an airline", function(done) {
        var airLineData = {
            "airline_name": "Aerlingus",
            "fis_code": "ALE",
            "aos_code": "AAE",
            "icon_url": "http://www.itoa-ireland.com/wp-content/uploads/Aer-Lingus-Logo.jpg"
        };
        airlineContent.add(airLineData, function(err, url,data, timeStamp) {
            assert(!err);
            assert(data);
            assert(timeStamp);
            assert(data.fis_code=="ALE");
            assert(data.aos_code=="AAE");
            assert(data.iconData.indexOf("http")==-1);
            inserted.push(timeStamp);
            airlineContent.read(timeStamp,function (err,data){
                assert(!err);
                assert(data);
                assert(timeStamp);
                assert(data.fis_code=="ALE");
                assert(data.aos_code=="AAE");
                assert(data.iconData.indexOf("http")==-1);
                done();
            });
        });
    });
});