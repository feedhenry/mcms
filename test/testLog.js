var assert=require("assert");
var logger=require("../logger").getLogger();

describe("logger",function(){
    it("can log information",function(){
        logger.info("hello world");
    });

    it("can log warn infor",function(){
        logger.warn("warning");
    });
    it("can log error infor",function(){
        logger.err("error");
    });
});