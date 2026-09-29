import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";

type Command={id:string;kind:"info"|"history"|"action";name?:string;payload?:unknown};
type Pending={resolve:(v:unknown)=>void;reject:(e:Error)=>void;timer:NodeJS.Timeout};

export class ExtensionBroker {
  private queue:Command[]=[]; private pending=new Map<string,Pending>();
  constructor(private readonly token=process.env.REPPLUS_BRIDGE_TOKEN||""){}

  command<T=unknown>(kind:Command["kind"],name?:string,payload?:unknown,timeoutMs=30000):Promise<T>{
    const id=randomUUID();this.queue.push({id,kind,name,payload});
    return new Promise<T>((resolve,reject)=>{
      const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error("rep+ extension command timed out"));},timeoutMs);
      this.pending.set(id,{resolve:resolve as (v:unknown)=>void,reject,timer});
    });
  }

  listen(port=Number(process.env.REPPLUS_EXTENSION_PORT||8765),host="127.0.0.1"){
    const server=createServer((req,res)=>void this.route(req,res));server.listen(port,host);return server;
  }

  private authorized(req:IncomingMessage){return !this.token||req.headers.authorization===`Bearer ${this.token}`;}
  private send(res:ServerResponse,status:number,value?:unknown){
    res.statusCode=status;if(value===undefined){res.end();return;}res.setHeader("content-type","application/json");res.end(JSON.stringify(value));
  }
  private async body(req:IncomingMessage){let s="";for await(const c of req)s+=c;return s?JSON.parse(s):{};}

  private async route(req:IncomingMessage,res:ServerResponse){
    if(!this.authorized(req)){this.send(res,401,{error:"unauthorized"});return;}
    const u=new URL(req.url||"/","http://127.0.0.1");
    if(req.method==="GET"&&u.pathname==="/v1/extension/next"){
      const cmd=this.queue.shift();this.send(res,cmd?200:204,cmd);return;
    }
    if(req.method==="POST"&&u.pathname==="/v1/extension/result"){
      const msg=await this.body(req), p=this.pending.get(msg.id);
      if(p){clearTimeout(p.timer);this.pending.delete(msg.id);msg.error?p.reject(new Error(msg.error)):p.resolve(msg.result);}
      this.send(res,200,{ok:true});return;
    }
    this.send(res,404,{error:"not found"});
  }
}
