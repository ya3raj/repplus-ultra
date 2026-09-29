import type { HttpExchange } from "../bridge/types.js";

export type ConvertKind = "base64-encode"|"base64-decode"|"url-encode"|"url-decode"|"jwt-decode"|"hex-encode"|"hex-decode";

export function convertValue(kind:ConvertKind,value:string):unknown {
  switch(kind){
    case "base64-encode": return Buffer.from(value,"utf8").toString("base64");
    case "base64-decode": return Buffer.from(value,"base64").toString("utf8");
    case "url-encode": return encodeURIComponent(value);
    case "url-decode": return decodeURIComponent(value);
    case "hex-encode": return Buffer.from(value,"utf8").toString("hex");
    case "hex-decode": return Buffer.from(value.replace(/\s+/g,""),"hex").toString("utf8");
    case "jwt-decode": {
      const p=value.split("."); if(p.length<2) throw new Error("Not a JWT");
      const d=(s:string)=>JSON.parse(Buffer.from(s.replace(/-/g,"+").replace(/_/g,"/"),"base64").toString("utf8"));
      return {header:d(p[0]),payload:d(p[1])};
    }
  }
}
const quote=(s:string)=>JSON.stringify(s);
export function copyRequestAs(x:HttpExchange,format:"curl"|"powershell"|"python"|"fetch"):string {
  const r=x.request, headers=r.headers??{};
  if(format==="curl") return ["curl","-X",r.method,quote(r.url),...Object.entries(headers).flatMap(([k,v])=>["-H",quote(k+": "+v)]),...(r.body?["--data-raw",quote(r.body)]:[])].join(" ");
  if(format==="powershell") return `Invoke-WebRequest -Uri ${quote(r.url)} -Method ${r.method} -Headers ${quote(JSON.stringify(headers))}`;
  if(format==="python") return `requests.request(${quote(r.method)}, ${quote(r.url)}, headers=${JSON.stringify(headers)}${r.body?", data="+quote(r.body):""})`;
  return `fetch(${quote(r.url)}, ${JSON.stringify({method:r.method,headers,...(r.body?{body:r.body}:{})},null,2)})`;
}
export function renderBody(x:HttpExchange,mode:"raw"|"pretty"|"hex") {
  const body=x.response?.body??"";
  if(mode==="raw") return body;
  if(mode==="hex") return Buffer.from(body,"utf8").toString("hex").match(/.{1,32}/g)?.join("\n")??"";
  try{return JSON.stringify(JSON.parse(body),null,2)}catch{return body}
}
