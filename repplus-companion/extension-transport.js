// Runs in the rep+ DevTools panel. Uses the extension service worker as the
// localhost transport, matching rep+'s existing Ollama proxy architecture.
export function createExtensionTransport(dispatcher, options={}) {
  const url=options.url||"http://127.0.0.1:8765/v1/extension";
  const token=options.token||localStorage.getItem("repPlusCodexToken")||"";
  const port=chrome.runtime.connect({name:"rep-codex"});
  let stopped=false, timer;

  const post=(message)=>{try{port.postMessage(message)}catch{}};
  port.onMessage.addListener(async msg=>{
    if(msg.type!=="rep-codex-command") return;
    const {id,kind,name,payload}=msg;
    try{
      let result;
      if(kind==="info") result=dispatcher.info();
      else if(kind==="history") result=dispatcher.history(payload||{});
      else if(kind==="action") result=await dispatcher.action(name,payload||{});
      else throw new Error("Unsupported command kind");
      post({type:"rep-codex-result",id,result});
    }catch(e){post({type:"rep-codex-result",id,error:String(e?.message||e)});}
  });
  port.onDisconnect.addListener(()=>{stopped=true;if(timer)clearInterval(timer)});

  post({type:"rep-codex-register",url,token});
  timer=setInterval(()=>{if(!stopped)post({type:"rep-codex-heartbeat"})},20000);
  return {close(){stopped=true;if(timer)clearInterval(timer);port.disconnect();}};
}
