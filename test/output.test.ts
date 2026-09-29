import {describe,it,expect} from "vitest";
import {bodyChunk,historySummary} from "../src/tools/output.js";
const x:any={request:{id:"1",timestamp:"",method:"GET",url:"https://e.test/",host:"e.test",path:"/",headers:{},body:"request-secret"},response:{requestId:"1",status:200,headers:{},body:"abcdefghij"}};
describe("bounded MCP output",()=>{
 it("omits bodies from history summaries",()=>{const r=historySummary([x]);expect(r[0].request.body).toBeUndefined();expect(r[0].response.body).toBeUndefined();});
 it("chunks bodies with continuation offsets",()=>{expect(bodyChunk("abcdefghij",2,4)).toEqual({offset:2,length:4,totalLength:10,nextOffset:6,content:"cdef"});});
});
