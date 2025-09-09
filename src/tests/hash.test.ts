import { hashOf } from "../util/hash.js";
console.log(hashOf({b:2,a:1}) === hashOf({a:1,b:2}) ? "OK" : "FAIL");
