export async function readLookupStream(response,onEvent,signal){
 if(!response.headers.get('content-type')?.includes('application/x-ndjson'))throw Error('请更新 Cloudflare 分析服务代码后再使用联网补全。');
 const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',ended=false;
 try{while(true){if(signal.aborted)throw Error('补全已取消');const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});if(buffer.length>3000000)throw Error('补全结果过大');let end;while((end=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!line.trim())continue;const e=JSON.parse(line);if(e.type==='error')throw Error(e.message);if(e.type==='result')ended=true;await onEvent(e);}}
 if(buffer.trim())throw Error('补全响应不完整，已完成条目已保留。');if(!ended)throw Error('补全连接中断，已完成条目已保留。');
 }finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
}
