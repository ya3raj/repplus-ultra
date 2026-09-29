import type { BridgeInfo,HistoryFilter,HttpExchange,ReplayOptions,RepPlusBridge } from "./types.js";
import { ExtensionBroker } from "./extensionBroker.js";

export class RepPlusDirectBridge implements RepPlusBridge {
  readonly broker=new ExtensionBroker();
  constructor(){this.broker.listen();}
  info(){return this.broker.command<BridgeInfo>("info");}
  listHistory(filter:HistoryFilter={}){return this.broker.command<HttpExchange[]>("history",undefined,filter);}
  async getExchange(id:string){const rows=await this.listHistory({limit:5000});return rows.find(x=>x.request.id===id)||null;}
  searchHistory(query:string,filter:HistoryFilter={}){return this.listHistory({...filter,text:query});}
  replay(id:string,overrides:ReplayOptions){this.active();return this.action<HttpExchange>("replay",{id,...overrides});}
  action<T=unknown>(name:string,payload:unknown={}):Promise<T>{
    const mutating=new Set(["replay","bulk-replay","bulk-control","blocking","forward","clear-workspace","import-workspace","undo","redo","tag","star","multi-tab"]);
    if(mutating.has(name))this.active();
    return this.broker.command<T>("action",name,payload);
  }
  private active(){if(process.env.REPPLUS_ALLOW_ACTIVE!=="1"&&process.env.REPPLUS_ALLOW_REPLAY!=="1")throw new Error("Active rep+ operations are disabled.");}
}
