// rep+ side dispatcher. Bind this to a transport and inject upstream modules.
// It deliberately contains no MCP/LLM dependency.
export function createRepPlusDispatcher(d) {
  const { state, actions, extractEndpoints, extractParameters, scanForSecrets,
    generateAttackRequests, sendRawRequest, workspace, capture, attackSurface, evidence, preview } = d;
  const jobs=new Map();

  const byId=(id)=> (state.requests||[]).find((x,i)=>String(x.id??x.request?.id??i)===String(id));
  const listStarred=()=> (state.requests||[]).map((x,i)=>({x,i})).filter(({x})=>x.starred).map(({x,i})=>({id:String(x.id??x.request?.id??i),url:x.request?.url}));

  async function bulk(p) {
    const src=byId(p.requestId); if(!src) throw new Error("Request not found");
    const template=p.template??src.rawRequest??src.request?.raw;
    if(!template) throw new Error("Bulk replay requires raw request text/template");
    const configs=p.positions.map(x=>({originalValue:x.marker,type:x.type,list:(x.list||[]).join("\n"),numbers:x.numbers||{from:1,to:10,step:1}}));
    const generated=generateAttackRequests(p.attackType,configs,template);
    const id=crypto.randomUUID(), job={id,status:"running",completed:0,total:generated.length,results:[],stop:false,pause:false};
    jobs.set(id,job);
    (async()=>{for(const item of generated){while(job.pause&&!job.stop) await new Promise(r=>setTimeout(r,100));if(job.stop)break;
      try{job.results.push(await sendRawRequest(item.requestContent));}catch(e){job.results.push({error:String(e)});}job.completed++;}
      job.status=job.stop?"stopped":"complete";})();
    return {id,total:job.total,status:job.status};
  }

  return {
    info:()=>({version:"1",upstreamVersion:d.version??"unknown",capabilities:[
      "history","capture-settings","multi-tab","replay","response-history","timeline","starring","color-tags","blocking",
      "forwarding","workspace-clear","workspace-import","workspace-export","undo-redo","bulk-replay","bulk-job-control",
      "extract-secrets","extract-endpoints","extract-parameters","response-search","attack-surface","evidence-screenshot","html-preview"
    ]}),
    history:()=>state.requests||[],
    async action(name,p={}) {
      switch(name){
        case "extract-endpoints": return extractEndpoints(state.requests||[],p);
        case "extract-parameters": return extractParameters(state.requests||[],p);
        case "extract-secrets": return await scanForSecrets(state.requests||[],p.onProgress,p.onSecretFound);
        case "response-search": {const q=String(p.query||"").toLowerCase();return (state.requests||[]).filter(x=>String(x.responseBody??x.response?.content?.text??"").toLowerCase().includes(q));}
        case "timeline": return {timestamp:state.timelineFilterTimestamp,index:state.timelineFilterRequestIndex,requests:state.requests||[]};
        case "response-history": return (byId(p.requestId)?.responseHistory)||[];
        case "list-starred": return {requests:listStarred(),pages:[...(state.starredPages||[])],domains:[...(state.starredDomains||[])]};
        case "star": {const x=byId(p.requestId);if(!x)throw new Error("Request not found");x.starred=Boolean(p.starred);return {ok:true};}
        case "tag": {const x=byId(p.requestId);if(!x)throw new Error("Request not found");x.color=p.tag??null;return {ok:true};}
        case "capture-settings": return capture?.get?.()??{multiTab:false};
        case "multi-tab": return capture.setMultiTab(Boolean(p.enabled));
        case "blocking-state": return {enabled:Boolean(state.blockRequests),queue:state.blockedQueue||[]};
        case "blocking": state.blockRequests=Boolean(p.enabled);return {enabled:state.blockRequests};
        case "forward": return actions.blocking?.forward?.(p.requestId);
        case "undo": return actions.history?.undo?.();
        case "redo": return actions.history?.redo?.();
        case "bulk-replay": return bulk(p);
        case "bulk-control": {const j=jobs.get(p.jobId);if(!j)throw new Error("Job not found");if(p.command==="pause"){j.pause=true;j.status="paused";}if(p.command==="resume"){j.pause=false;j.status="running";}if(p.command==="stop"){j.stop=true;}return j;}
        case "export-workspace": return workspace.export();
        case "import-workspace": return workspace.import(p.data);
        case "clear-workspace": actions.request.clearAll();return {ok:true};
        case "attack-surface": return attackSurface(state.requests||[],p);
        case "evidence-screenshot": return evidence.capture(p.requestId);
        case "html-preview": return preview.html(p.requestId);
        default: throw new Error("Unsupported rep+ action: "+name);
      }
    }
  };
}
