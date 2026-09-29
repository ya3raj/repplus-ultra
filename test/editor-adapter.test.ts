import {describe,it,expect} from "vitest";
import {createEditorAdapter} from "../repplus-companion/editor-adapter.js";

describe("Rep+ editor adapter",()=>{
  it("edits the visible raw request and supports undo/redo without mutating captured HAR",()=>{
    const req:any={request:{method:"GET",url:"https://example.test/a?x=1",httpVersion:"HTTP/1.1",headers:[{name:"Accept",value:"*/*"}]}};
    const state:any={requests:[req],selectedRequest:req,undoStack:[],redoStack:[],requestHistory:[],historyIndex:-1};
    const input:any={innerText:"GET /a?x=1 HTTP/1.1\nHost: example.test\nAccept: */*"};
    const events:any={emit:(name:string,p:any)=>{if(name==="update"&&p?.text!==undefined)input.innerText=p.text;}};
    const actions:any={history:{add:(rawText:string,useHttps:boolean)=>state.requestHistory.push({rawText,useHttps})}};
    const a=createEditorAdapter({state,actions,events,EVENT_NAMES:{UI_UPDATE_REQUEST_CONTENT:"update",UI_UPDATE_HISTORY_BUTTONS:"buttons"},elements:{rawRequestInput:input},highlightHTTP:(x:string)=>x});
    const edited="POST /a?x=2 HTTP/1.1\nHost: example.test\nContent-Type: text/plain\n\nhello";
    expect(a.set("0",edited).content).toBe(edited);expect(input.innerText).toBe(edited);expect(req.request.method).toBe("GET");
    expect(a.undo("0").content).toContain("GET /a?x=1");expect(a.redo("0").content).toBe(edited);
  });
  it("refuses to edit a request that is not visibly selected",()=>{
    const req:any={request:{method:"GET",url:"https://example.test/",headers:[]}};
    const state:any={requests:[req],selectedRequest:null,undoStack:[],redoStack:[]};
    const a=createEditorAdapter({state,actions:{history:{add(){}}},events:{emit(){}},EVENT_NAMES:{UI_UPDATE_REQUEST_CONTENT:"u",UI_UPDATE_HISTORY_BUTTONS:"b"},elements:{rawRequestInput:{innerText:""}},highlightHTTP:(x:string)=>x});
    expect(()=>a.set("0","GET / HTTP/1.1")).toThrow(/selected/);
  });
});
