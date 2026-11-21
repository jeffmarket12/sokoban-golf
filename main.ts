const{readdirSync:R,readFileSync:r,existsSync:e,mkdirSync:m,writeFileSync:w}=require('fs'),
I=process.env.MAKEFUN_INPUT_DIR||'/input',
O=process.env.MAKEFUN_OUTPUT_DIR||'/output';
for(let d of R(I)){
let L=r(`${I}/${d}/level.txt`,'utf8').trim().split('\n'),
W=L[0].length,G=L.join(''),
py=L.findIndex(l=>l.includes('@')),
px=L[py].indexOf('@'),
ds=[],RC=new Set(),
O_S=[-W,W,-1,1],U='udlr',UU='UDLR';
for(let i=0;i<G.length;i++)if(G[i]!='#'&&Math.floor(i/W)!=py)RC.add(i);
for(let c=0;c<W;c++)if((G[(py-1)*W+c]&&G[(py-1)*W+c]!='#')||(G[(py+1)*W+c]&&G[(py+1)*W+c]!='#'))ds.push(py*W+c);
let B=(s,bl,al)=>{let Q=[s],v=new Map([[s,'']]);
while(Q.length){let c=Q.shift(),p=v.get(c);
for(let i=0;i<4;i++){let n=c+O_S[i];if(al.has(n)&&!bl.has(n)&&!v.has(n))v.set(n,p+U[i]),Q.push(n);}}
return v;},
sol='',curCol=px;
for(let dc of ds){
let doorCol=dc%W;
while(curCol<doorCol){sol+='r';curCol++;}
while(curCol>doorCol){sol+='l';curCol--;}
let rc=new Set(),Q=[dc],vis=new Set([dc]);
while(Q.length){let c=Q.shift();rc.add(c);
for(let i=0;i<4;i++){let n=c+O_S[i];if(RC.has(n)&&!vis.has(n))vis.add(n),Q.push(n);}}
let boxes=[],goals=[];
for(let i of rc){if(G[i]=='$'||G[i]=='*')boxes.push(i);if(G[i]=='.'||G[i]=='*')goals.push(i);}
boxes.sort((a,b)=>a-b);goals.sort((a,b)=>a-b);
let reg=[...B(dc,new Set(),rc).keys()].sort((a,b)=>a-b),
Q2=[{b:boxes,p:dc,path:''}],
seen=new Set([`${boxes.join()}:${reg.join()}`]),
finalPath='';
while(Q2.length){
let cur=Q2.shift();
if(cur.b.every(b=>goals.includes(b))){finalPath=cur.path+(B(cur.p,new Set(cur.b),rc).get(dc)||'');break;}
let bm=new Set(cur.b),rm=B(cur.p,bm,rc);
for(let bi=0;bi<cur.b.length;bi++){
let box=cur.b[bi];
for(let di2=0;di2<4;di2++){
let dir=O_S[di2],from=box-dir,dest=box+dir;
if(rm.has(from)&&rc.has(dest)&&!bm.has(dest)){
if(((!rc.has(dest-W)&&!rc.has(dest-1))||(!rc.has(dest-W)&&!rc.has(dest+1))||(!rc.has(dest+W)&&!rc.has(dest-1))||(!rc.has(dest+W)&&!rc.has(dest+1)))&&!goals.includes(dest))continue;
let nb=[...cur.b];nb[bi]=dest;nb.sort((a,b)=>a-b);
let nreg=[...B(box,new Set(nb),rc).keys()].sort((a,b)=>a-b),
nsk=`${nb.join()}:${nreg.join()}`;
if(!seen.has(nsk))seen.add(nsk),Q2.push({b:nb,p:box,path:cur.path+rm.get(from)+UU[di2]});
}
}
}
}
sol+=finalPath;curCol=doorCol;
}
m(`${O}/${d}`,{recursive:true});w(`${O}/${d}/solution.txt`,sol);
}
