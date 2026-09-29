import {mkdir,cp,rm} from "node:fs/promises";
import {execFileSync} from "node:child_process";
const out="mcpb/server";
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
execFileSync(process.execPath,["./node_modules/typescript/bin/tsc","-p","tsconfig.json"],{stdio:"inherit"});
await cp("dist",out,{recursive:true});
await cp("node_modules",out+"/node_modules",{recursive:true});
console.error("MCPB staging complete. Run: npx @anthropic-ai/mcpb pack mcpb dist/repplus.mcpb");
