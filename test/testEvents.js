var events=require("../events");
var assert=require("assert");

describe("Events Module",function(){
    it("can emit an event",function(done){
        events.once("test_event",function(param){
            assert(param==="hello");
            done();
        });
        events.emit("test_event","hello")
    });
});