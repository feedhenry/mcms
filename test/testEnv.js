var assert=require("assert");
var env=require("../env");

describe("Env module",function(){
    it(" can init",function(){
         env.init();
         assert(env.get("DB_HOST"));
    });
});