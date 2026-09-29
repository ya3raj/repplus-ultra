import { describe,it,expect } from "vitest";
import { convertValue, renderBody, copyRequestAs } from "../src/tools/transforms.js";

const exchange:any={request:{id:"1",timestamp:"",method:"POST",url:"https://example.test/api?q=1",host:"example.test",path:"/api",headers:{"content-type":"application/json"},body:'{"a":1}'},response:{requestId:"1",status:200,headers:{"content-type":"application/json"},body:'{"ok":true}'}};

describe("rep+ pure transforms",()=>{
  it("converts values",()=>{
    expect(convertValue("base64-encode","rep+")).toBe("cmVwKw==");
    expect(convertValue("url-decode","a%20b")).toBe("a b");
    expect(convertValue("hex-decode","7265702b")).toBe("rep+");
  });
  it("renders pretty and hex",()=>{
    expect(String(renderBody(exchange,"pretty"))).toContain('"ok": true');
    expect(String(renderBody(exchange,"hex"))).toContain("7b226f6b");
  });
  it("copies requests",()=>{
    expect(copyRequestAs(exchange,"curl")).toContain("curl -X POST");
    expect(copyRequestAs(exchange,"python")).toContain("requests.request");
    expect(copyRequestAs(exchange,"fetch")).toContain("fetch(");
  });
});
