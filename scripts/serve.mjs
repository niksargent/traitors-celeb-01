import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('.'),port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.mp3':'audio/mpeg','.png':'image/png','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let path=resolve(root,'.'+pathname);
  if(!path.startsWith(root+sep)&&path!==root)throw Error('Invalid path');
  if((await stat(path)).isDirectory())path=resolve(path,'index.html');
  res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'});
  res.end(await readFile(path));
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`The Unseen Game: http://localhost:${port}`));

