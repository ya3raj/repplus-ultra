// Merge this module's logic into rep+ background.js.
// MV3 service worker performs localhost fetches; DevTools panel owns rep+ state.
const repCodexPorts=new Set();
const pending=new Map();

chrome.runtime.onConnect.addListener(port=>{
  if(port.name!=="rep-codex") return;
  repCodexPorts.add(port);
  let endpoint="http://127.0.0.1:8765/v1/extension", token="";

  async function poll(){
    try{
      const res=await fetch(endpoint+"/next",{headers:token?{authorization:"Bearer "+token}:{}});
      if(res.status===204)return;
      if(!res.ok)throw new Error("bridge "+res.status);
      const cmd=await res.json(); pending.set(cmd.id,{endpoint,token});
      port.postMessage({type:"rep-codex-command",...cmd});
    }catch(e){}
  }

  port.onMessage.addListener(async msg=>{
    if(msg.type==="rep-codex-register"){endpoint=msg.url||endpoint;token=msg.token||"";await poll();return;}
    if(msg.type==="rep-codex-heartbeat"){await poll();return;}
    if(msg.type==="rep-codex-result"){
      const p=pending.get(msg.id)||{endpoint,token};pending.delete(msg.id);
      try{await fetch(p.endpoint+"/result",{method:"POST",headers:{"content-type":"application/json",...(p.token?{authorization:"Bearer "+p.token}:{})},body:JSON.stringify(msg)});}catch(e){}
      await poll();
    }
  });
  port.onDisconnect.addListener(()=>repCodexPorts.delete(port));
});
