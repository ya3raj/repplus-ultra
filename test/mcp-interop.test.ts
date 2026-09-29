import {describe,it,expect} from "vitest";
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {StdioClientTransport} from "@modelcontextprotocol/sdk/client/stdio.js";

describe("MCP interoperability",()=>{
  it("negotiates stdio and advertises Rep+ tools",async()=>{
    const client=new Client({name:"repplus-interop-test",version:"1.0.0"});
    const transport=new StdioClientTransport({command:process.execPath,args:["--import","tsx","src/index.ts"],env:{...process.env,REPPLUS_EXTENSION_PORT:"18765"}});
    try{
      await client.connect(transport);
      const tools=await client.listTools();
      const names=new Set(tools.tools.map(x=>x.name));
      for(const name of ["list_http_history","get_response_body","extract_secrets","bulk_replay","repplus_info"]) expect(names.has(name)).toBe(true);
    }finally{await client.close();}
  },15000);
});
