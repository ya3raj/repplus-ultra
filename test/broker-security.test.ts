import {afterEach,describe,expect,it} from "vitest";
import {ExtensionBroker} from "../src/bridge/extensionBroker.js";

const servers:any[]=[];
afterEach(()=>{for(const s of servers.splice(0))s.close();});

describe("extension broker security",()=>{
  it("binds to loopback and rejects a wrong bearer token",async()=>{
    const old=process.env.REPPLUS_BRIDGE_TOKEN;process.env.REPPLUS_BRIDGE_TOKEN="test-secret";
    const broker=new ExtensionBroker();const server=broker.listen(18766);servers.push(server);
    await new Promise<void>(r=>server.once("listening",()=>r()));
    const address=server.address();expect(typeof address==="object"&&address?.address).toBe("127.0.0.1");
    const res=await fetch("http://127.0.0.1:18766/v1/extension/next",{headers:{authorization:"Bearer wrong"}});
    expect(res.status).toBe(401);
    if(old===undefined)delete process.env.REPPLUS_BRIDGE_TOKEN;else process.env.REPPLUS_BRIDGE_TOKEN=old;
  });
});
