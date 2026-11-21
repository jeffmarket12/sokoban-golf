const fs=require('fs'),d=process.argv[2]||process.env.MAKEFUN_INPUT_DIR||'/input',o=process.argv[3]||process.env.MAKEFUN_OUTPUT_DIR||'/output';
fs.readdirSync(d).forEach(i=>{
const f=`${d}/${i}/level.txt`;if(!fs.existsSync(f))return;
const L=fs.readFileSync(f,'utf8').split('\n');while(L.length&&!L[L.length-1])L.pop();
let py=-1,px=-1;L.forEach((r,y)=>{const x=r.search(/[@+]/);if(x>=0){py=y;px=x;}});
const G=L.map(r=>r.split('')),R=G.length,C=G[0].length,ds=[];
for(c=0;c<C;c++){if(py>0&&G[py-1][c]!='#')ds.push({r:py-1,c,col:c});else if(py+1<R&&G[py+1][c]!='#')ds.push({r:py+1,c,col:c});}
ds.sort((x,y)=>x.col-y.col);let S='',cp={r:py,c:px},D=[{r:-1,c:0,ch:'u',U:'U'},{r:1,c:0,ch:'d',U:'D'},{r:0,c:-1,ch:'l',U:'L'},{r:0,c:1,ch:'r',U:'R'}];
function bfs(sr,sc,bs,rc){const q=[{r:sr,c:sc,p:''}],v=new Set([sr+','+sc]),pm=new Map([[sr+','+sc,'']]);let h=0;
while(h<q.length){let cur=q[h++];for(let d of D){let nr=cur.r+d.r,nc=cur.c+d.c,k=nr+','+nc;
if(rc.has(k)&&!bs.has(k)&&!v.has(k)){v.add(k);let np=cur.p+d.ch;pm.set(k,np);q.push({r:nr,c:nc,p:np});}}}
return{paths:pm,region:v};}
ds.forEach(dor=>{
const rc=new Set(),qk=[{r:dor.r,c:dor.c}],rv=new Set([dor.r+','+dor.c]);rc.add(dor.r+','+dor.c);let qh=0;
while(qh<qk.length){let cur=qk[qh++];for(let d of D){let nr=cur.r+d.r,nc=cur.c+d.c;if(nr!=py&&nr>=0&&nr<R&&nc>=0&&nc<C&&G[nr][nc]!='#'){let k=nr+','+nc;if(!rv.has(k)){rv.add(k);rc.add(k);qk.push({r:nr,c:nc});}}}}
let ek=py+','+dor.col;rc.add(ek);let bx=[],gz=[];
rc.forEach(k=>{let[r,c]=k.split(',').map(Number),ch=G[r][c];if(ch=='$'||ch=='*')bx.push(k);if(ch=='.'||ch=='*')gz.push(k);});
bx.sort();gz.sort();let gzSet=new Set(gz);
if(cp.r==py&&cp.c!=dor.col){while(cp.c<dor.col){S+='r';cp.c++;}while(cp.c>dor.col){S+='l';cp.c--;}}
if(!bx.length){cp={r:py,c:dor.col};return;}
let initB=[...bx].sort(),initF=bfs(py,dor.col,new Set(initB),rc),initRK=Array.from(initF.region).sort().join(',');
let q=[{boxes:initB,pr:py,pc:dor.col,sol:''}],vis=new Set([initB.join(',')+'|'+initRK]),solState=null,qH=0;
while(qH<q.length){let st=q[qH++];let bSet=new Set(st.boxes);
if(st.boxes.every(b=>gzSet.has(b))){solState=st;break;}
let fl=bfs(st.pr,st.pc,bSet,rc);
st.boxes.forEach(bStr=>{let[br,bc]=bStr.split(',').map(Number);
D.forEach(d=>{let fr=br-d.r,fc=bc-d.c,fk=fr+','+fc;if(!fl.paths.has(fk))return;
let dr=br+d.r,dc=bc+d.c,dk=dr+','+dc;if(!rc.has(dk)||bSet.has(dk))return;
let upW=!rc.has((dr-1)+','+dc),dnW=!rc.has((dr+1)+','+dc),lfW=!rc.has(dr+','+(dc-1)),rtW=!rc.has(dr+','+(dc+1));
if(!gzSet.has(dk)&&((upW&&lfW)||(upW&&rtW)||(dnW&&lfW)||(dnW&&rtW)))return;
let nb=st.boxes.map(b=>b==bStr?dk:b).sort(),wp=fl.paths.get(fk);
let nFl=bfs(br,bc,new Set(nb),rc),nRK=Array.from(nFl.region).sort().join(','),sk=nb.join(',')+'|'+nRK;
if(!vis.has(sk)){vis.add(sk);q.push({boxes:nb,pr:br,pc:bc,sol:st.sol+wp+d.U});}});});}
if(solState){S+=solState.sol;let finF=bfs(solState.pr,solState.pc,new Set(solState.boxes),rc),ep=finF.paths.get(ek);if(ep!==undefined)S+=ep;cp={r:py,c:dor.col};}
});
let oid=`${o}/${i}`;if(!fs.existsSync(oid))fs.mkdirSync(oid,{recursive:true});
fs.writeFileSync(`${oid}/solution.txt`,S);
});
