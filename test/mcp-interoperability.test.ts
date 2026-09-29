import {describe,it,expect} from "vitest";
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {StdioClientTransport} from "@modelcontextprotocol/sdk/client/stdio.js";

describe("MCP interoperability",()=>{
  it("negotiates over stdio and exposes the Rep+ tool surface",async()=>{
    const client=new Client({name:"repplus-test-client",version:"1.0.0"});
    const transport=new StdioClientTransport({
      command:process.execPath,
      args:["--import","tsx","src/index.ts"],
      env:{...process.env,REPPLUS_EXTENSION_PORT:"18765",REPPLUS_ALLOW_ACTIVE:"0"} as Record<string,string>
    });
    try{
      await client.connect(transport);
      const {tools}=await client.listTools();
      const names=new Set(tools.map(t=>t.name));
      for(const required of ["list_http_history","get_http_exchange","get_response_body","extract_endpoints","extract_secrets","bulk_replay","repplus_info"])
        expect(names.has(required),required).toBe(true);
    }finally{await client.close();}
  },15000);
});
