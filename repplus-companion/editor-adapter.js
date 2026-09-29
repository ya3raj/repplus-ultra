// Adapter for editing the actual rep+ request editor state.
// Keeps captured HAR evidence immutable; edits the same raw editor buffer Rep+ sends/replays.
export function createEditorAdapter({state,actions,events,EVENT_NAMES,elements,highlightHTTP}) {
  const idOf=(x,i)=>String(x?.id??x?.request?.id??i);
  const find=(id)=>{const index=(state.requests||[]).findIndex((x,i)=>idOf(x,i)===String(id));return {index,request:index>=0?state.requests[index]:null};};
  const original=(entry)=>{
    if(!entry?.request)throw new Error("Request not found");
    const r=entry.request,u=new URL(r.url),headers=Array.isArray(r.headers)?r.headers:[];
    let raw=`${r.method||"GET"} ${u.pathname}${u.search} ${r.httpVersion||"HTTP/1.1"}\n`;
    if(!headers.some(h=>String(h.name).toLowerCase()==="host"))raw+=`Host: ${u.host}\n`;
    raw+=headers.filter(h=>!String(h.name||"").startsWith(":")).map(h=>`${h.name}: ${h.value}`).join("\n");
    if(r.postData?.text)raw+="\n\n"+r.postData.text;
    return raw;
  };
  const current=()=>elements.rawRequestInput?.innerText||elements.rawRequestInput?.textContent||"";
  const show=(text)=>events.emit(EVENT_NAMES.UI_UPDATE_REQUEST_CONTENT,{text,highlighted:highlightHTTP(text)});
  const ensureSelected=(id)=>{
    const {index,request}=find(id);if(!request)throw new Error("Request not found");
    if(state.selectedRequest!==request)throw new Error("Request must be selected in rep+ before editing it");
    return {index,request};
  };
  return {
    get(id){const {request}=ensureSelected(id);return {requestId:String(id),content:current()||original(request),undoDepth:state.undoStack.length,redoDepth:state.redoStack.length};},
    set(id,text){
      const {request}=ensureSelected(id);const before=current()||original(request);const next=String(text);
      if(!state.undoStack.length)state.undoStack=[original(request)];
      if(state.undoStack[state.undoStack.length-1]!==before)state.undoStack.push(before);
      if(before!==next)state.undoStack.push(next);
      state.redoStack=[];show(next);
      actions.history.add(next,new URL(request.request.url).protocol==="https:");
      events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);
      return {requestId:String(id),content:next,changed:before!==next,undoDepth:state.undoStack.length,redoDepth:0};
    },
    undo(id){ensureSelected(id);if(state.undoStack.length<=1)return {requestId:String(id),content:current(),changed:false};
      const now=current();if(now)state.redoStack.push(now);state.undoStack.pop();const text=state.undoStack[state.undoStack.length-1];show(text);events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);return {requestId:String(id),content:text,changed:true};},
    redo(id){ensureSelected(id);if(!state.redoStack.length)return {requestId:String(id),content:current(),changed:false};
      const text=state.redoStack.pop();state.undoStack.push(text);show(text);events.emit(EVENT_NAMES.UI_UPDATE_HISTORY_BUTTONS);return {requestId:String(id),content:text,changed:true};}
  };
}
