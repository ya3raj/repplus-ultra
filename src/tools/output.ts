import type { HttpExchange } from "../bridge/types.js";

export const DEFAULT_BODY_PREVIEW=Number(process.env.REPPLUS_BODY_PREVIEW_BYTES||4096);
export function historySummary(rows:HttpExchange[],bodyPreview=0){
  return rows.map(x=>({request:{...x.request,body:bodyPreview&&x.request.body?x.request.body.slice(0,bodyPreview):undefined},
    response:x.response?{...x.response,body:bodyPreview&&x.response.body?x.response.body.slice(0,bodyPreview):undefined}:undefined}));
}
export function bodyChunk(body:string|undefined,offset=0,length=DEFAULT_BODY_PREVIEW){
  const value=body||"",start=Math.max(0,offset),size=Math.max(1,Math.min(length,65536)),end=Math.min(value.length,start+size);
  return {offset:start,length:end-start,totalLength:value.length,nextOffset:end<value.length?end:null,content:value.slice(start,end)};
}
