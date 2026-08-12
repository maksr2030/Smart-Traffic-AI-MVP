const state={lang:"ar",running:true,boost:0,features:[],segments:[],tick:0};
const labels={
  ar:{run:"تشغيل",pause:"إيقاف المحاكاة",resume:"استئناف المحاكاة",optimized:"تم تشغيل التحسين الشبكي",enabled:"تم تفعيل",load:"الحمل",speed:"كم/س"},
  en:{run:"Run",pause:"Pause simulation",resume:"Resume simulation",optimized:"Network optimization activated",enabled:"Enabled",load:"Load",speed:"km/h"}
};
const zoneNames=["North Gate","King Road","University","Airport Link","CBD East","CBD West","Port Access","Industrial","Hospital","School Zone","Ring Road","Logistics"];
function rnd(seed){const x=Math.sin(seed*999.91)*43758.5453;return x-Math.floor(x)}
function initSegments(){state.segments=zoneNames.map((name,i)=>({name,load:38+Math.round(rnd(i+5)*48),speed:38+Math.round(rnd(i+21)*52)}))}
function renderNetwork(){
  const el=document.getElementById("network");el.innerHTML="";
  state.segments.forEach((s,i)=>{
    const div=document.createElement("div");div.className="segment";
    const congestion=s.load>78?"Critical":s.load>62?"Busy":"Flowing";
    div.innerHTML=`<h3>${s.name}</h3><div class="metric">${s.load}%</div><div class="sub">${labels[state.lang].load} · ${s.speed} ${labels[state.lang].speed} · ${congestion}</div><div class="bar"><i style="width:${s.load}%"></i></div>`;
    el.appendChild(div);
  });
}
function updateSim(){
  if(!state.running)return;
  state.tick++;
  state.segments.forEach((s,i)=>{
    const drift=Math.round((rnd(state.tick*7+i)-.5)*9)-state.boost;
    s.load=Math.max(18,Math.min(96,s.load+drift));
    s.speed=Math.max(12,Math.min(110,Math.round(108-s.load*.82+(rnd(state.tick+i)*12))));
  });
  state.boost=Math.max(0,state.boost-0.18);
  const avg=Math.round(state.segments.reduce((a,b)=>a+b.load,0)/state.segments.length);
  document.getElementById("networkLoad").textContent=avg+"%";
  document.getElementById("predictedDelay").textContent=(3.5+avg*.13).toFixed(1);
  document.getElementById("activeIncidents").textContent=state.segments.filter(s=>s.load>82).length;
  renderNetwork();
}
function logEvent(text){
  const line=document.createElement("div");line.className="event";
  line.innerHTML=`<time>${new Date().toLocaleTimeString()}</time><p>${text}</p>`;
  const tl=document.getElementById("timeline");tl.prepend(line);
  while(tl.children.length>10)tl.lastChild.remove();
}
function intervene(action){
  const names={
    ar:{signals:"الإشارات ذاتية التكيف",reroute:"إعادة التوجيه الشبكي",emergency:"أولوية الطوارئ",qtos:"محرك QTOS الهجين"},
    en:{signals:"Adaptive traffic signals",reroute:"Network-aware rerouting",emergency:"Emergency priority",qtos:"QTOS hybrid optimizer"}
  };
  const strength={signals:2.2,reroute:2.8,emergency:1.2,qtos:3.4}[action]||1;
  state.boost+=strength;
  state.segments.sort((a,b)=>b.load-a.load).slice(0,action==="emergency"?3:6).forEach((s,idx)=>s.load=Math.max(20,s.load-(8+idx)));
  logEvent(`${labels[state.lang].enabled}: ${names[state.lang][action]} · SIMULATION`);
  renderNetwork();
}
function groupTag(g){
  return {verified_historical:["verified","Verified"],conversation_recovered:["recovered","Recovered"],additional_history:["history","History"],qtos:["qtos","QTOS"]}[g]||["",""];
}
function renderFeatures(){
  const q=document.getElementById("search").value.trim().toLowerCase();
  const g=document.getElementById("groupFilter").value;
  const c=document.getElementById("categoryFilter").value;
  const rows=document.getElementById("featureRows");rows.innerHTML="";
  const list=state.features.filter(f=>{
    const hay=`${f.id} ${f.title_ar} ${f.title_en} ${f.category_ar} ${f.category_en} ${f.description_ar} ${f.description_en}`.toLowerCase();
    return (!q||hay.includes(q))&&(!g||f.group===g)&&(!c||(state.lang==="ar"?f.category_ar:f.category_en)===c);
  });
  list.forEach(f=>{
    const [cls,txt]=groupTag(f.group);
    const tr=document.createElement("tr");
    tr.innerHTML=`<td class="id">${f.id}</td><td class="title-ar">${f.title_ar}</td><td>${f.title_en}</td><td>${state.lang==="ar"?f.category_ar:f.category_en}</td><td class="desc">${state.lang==="ar"?f.description_ar:f.description_en}</td><td><span class="tag ${cls}">${txt}</span></td>`;
    rows.appendChild(tr);
  });
  document.getElementById("featureCount").textContent=state.features.length;
}
function rebuildCategories(){
  const sel=document.getElementById("categoryFilter");const current=sel.value;
  const cats=[...new Set(state.features.map(f=>state.lang==="ar"?f.category_ar:f.category_en))].sort((a,b)=>a.localeCompare(b));
  sel.innerHTML=`<option value="">${state.lang==="ar"?"كل الفئات":"All categories"}</option>`+cats.map(c=>`<option>${c}</option>`).join("");
  if(cats.includes(current))sel.value=current;
}
function translate(){
  const isAr=state.lang==="ar";
  document.documentElement.lang=state.lang;document.documentElement.dir=isAr?"rtl":"ltr";
  document.querySelectorAll("[data-ar][data-en]").forEach(el=>el.textContent=el.dataset[state.lang]);
  document.getElementById("langBtn").textContent=isAr?"English":"العربية";
  document.getElementById("pauseBtn").textContent=state.running?labels[state.lang].pause:labels[state.lang].resume;
  document.querySelectorAll("[data-action]").forEach(b=>b.textContent=labels[state.lang].run);
  rebuildCategories();renderFeatures();renderNetwork();
}
async function load(){
  const paths=["data/verified_1_10.json","data/verified_200_237.json","data/conversation_recovered.json","data/additional_history.json","data/qtos.json"];const datasets=await Promise.all(paths.map(async p=>{const r=await fetch(p);if(!r.ok)throw new Error(`Failed to load ${p}`);return r.json()}));state.features=datasets.flat();
  initSegments();renderNetwork();rebuildCategories();renderFeatures();
  logEvent(state.lang==="ar"?"تم تحميل سجل المصدر الموحد: 100 سجل":"Unified source registry loaded: 100 records");
  setInterval(updateSim,1600);
}
document.getElementById("langBtn").onclick=()=>{state.lang=state.lang==="ar"?"en":"ar";translate()};
document.getElementById("pauseBtn").onclick=()=>{state.running=!state.running;translate();logEvent(state.running?"Simulation resumed":"Simulation paused")};
document.getElementById("optimizeBtn").onclick=()=>{state.boost+=3.5;intervene("qtos");logEvent(labels[state.lang].optimized)};
document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>intervene(b.dataset.action));
["search","groupFilter","categoryFilter"].forEach(id=>document.getElementById(id).addEventListener(id==="search"?"input":"change",renderFeatures));
load().catch(err=>{console.error(err);document.getElementById("timeline").innerHTML=`<div class="event"><p>Failed to load feature registry. Serve this repository over HTTP/GitHub Pages.</p></div>`});
