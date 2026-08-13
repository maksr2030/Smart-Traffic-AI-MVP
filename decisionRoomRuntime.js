import { buildCoverage, coverageSummary } from './coverage/coverageModel.js';

const REPO='https://github.com/maksr2030/Smart-Traffic-AI-MVP';
const CONTACT={nameAr:'م. محمد عبدالكريم سليمان ريحان',nameEn:'Eng. Mohamed Abdulkarim Sulaiman Rihan',email:'maksr2030@proton.me',phone:'+966544004440'};
const state={features:[],coverage:[],summary:null};

function ar(){return document.documentElement.lang!=='en'}
function t(a,e){return ar()?a:e}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function byId(id){return document.getElementById(id)}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function waitFor(id,timeout=12000){const start=Date.now();while(Date.now()-start<timeout){const el=byId(id);if(el)return el;await sleep(100)}throw new Error(`Decision Room anchor not ready: ${id}`)}

async function loadPortfolio(){
  const manifest=await fetch('data/features.json').then(r=>{if(!r.ok)throw new Error('features manifest unavailable');return r.json()});
  const parts=await Promise.all(manifest.files.map(file=>fetch(`data/${file}`).then(r=>{if(!r.ok)throw new Error(`feature dataset unavailable: ${file}`);return r.json()})));
  state.features=parts.flat();
  if(state.features.length!==manifest.total)throw new Error(`portfolio mismatch ${state.features.length}/${manifest.total}`);
  state.coverage=buildCoverage(state.features);
  state.summary=coverageSummary(state.coverage);
}

function countGroups(){
  const out={};
  for(const f of state.features){const key=f.source_group||f.group||'other';out[key]=(out[key]||0)+1}
  return Object.entries(out).sort((a,b)=>b[1]-a[1]);
}
function topImplemented(){
  const byIdMap=new Map(state.features.map(f=>[f.id,f]));
  return state.coverage.filter(r=>r.status==='implemented_demo').slice(0,8).map(r=>({coverage:r,feature:byIdMap.get(r.id)||{}}));
}

function sectionTitle(kicker,arTitle,enTitle,arBody,enBody){return `<div class="dr-section-head"><div><div class="dr-kicker">${kicker}</div><h3 data-dr-ar="${esc(arTitle)}" data-dr-en="${esc(enTitle)}">${esc(arTitle)}</h3><p data-dr-ar="${esc(arBody)}" data-dr-en="${esc(enBody)}">${esc(arBody)}</p></div></div>`}

function addNavButton(){
  const host=document.querySelector('#acqNav .acq-nav-inner>div');
  if(!host||byId('decisionRoomNav'))return;
  const b=document.createElement('button');b.id='decisionRoomNav';b.className='acq-nav-btn dr-nav-btn';b.dataset.drAr='غرفة القرار';b.dataset.drEn='Decision Room';b.textContent='غرفة القرار';b.onclick=()=>byId('acquisitionDecisionRoom')?.scrollIntoView({behavior:'smooth',block:'start'});host.appendChild(b);
}

function addDashboardEntry(){
  const head=document.querySelector('#acquisitionDashboard .acq-dashboard-head');
  if(!head||byId('decisionRoomOpen'))return;
  const b=document.createElement('button');b.id='decisionRoomOpen';b.className='btn dr-open';b.dataset.drAr='فتح غرفة قرار الاستحواذ';b.dataset.drEn='Open Acquisition Decision Room';b.textContent='فتح غرفة قرار الاستحواذ';b.onclick=()=>byId('acquisitionDecisionRoom')?.scrollIntoView({behavior:'smooth',block:'start'});head.appendChild(b);
}

function architectureCards(){
  const layers=[
    ['01','السجل ومصادر الأدلة','Registry & evidence sources','سجل موحد للقدرات مع فصل المصدر عن حالة التنفيذ.','Unified capability registry with source provenance separated from implementation status.'],
    ['02','حالة شبكة المرور','Traffic network state','نموذج شبكة محاكاة يمثل العقد والروابط والأحمال والحوادث.','Simulated network model representing nodes, links, load and incidents.'],
    ['03','محرك العمليات','Operations engine','سيناريوهات وحوادث وقياسات وتدخلات محاكاة قابلة للمقارنة.','Comparable simulated scenarios, incidents, metrics and interventions.'],
    ['04','التوأم الرقمي للمخاطر','Dynamic Risk Digital Twin','حالة مخاطر مشتركة تدمج الحمل والحوادث والإغلاق ومؤشرات QCS التجريبية.','Shared risk state fusing load, incidents, closures and demo QCS indicators.'],
    ['05','التنبؤ متعدد الآفاق','Multi-horizon prediction','إسقاط حتمي شفاف للمخاطر عند 5 و15 و30 و60 دقيقة.','Transparent deterministic risk projection at 5, 15, 30 and 60 minutes.'],
    ['06','التنظيم الاستباقي','Predictive orchestration','توليد ومقارنة خطط تدخل متعددة دون تطبيق ميداني تلقائي.','Generates and ranks multiple intervention plans without automatic field application.'],
    ['07','التفسير والسياسات','Explainability & policy','تفكيك حسابي للقرار وبوابة سياسات مع موافقة بشرية إلزامية.','Arithmetic decision explanation and policy guardrails with mandatory human approval.'],
    ['08','التحقق والحوكمة','Evidence & assurance','اختبارات آلية وحدود إثبات صريحة؛ لا ادعاء تحقق إنتاجي.','Automated testing and explicit evidence boundaries; no production-verification claim.']
  ];
  return layers.map(([n,a,e,ab,eb])=>`<article class="dr-arch-card"><span>${n}</span><h4 data-dr-ar="${esc(a)}" data-dr-en="${esc(e)}">${esc(a)}</h4><p data-dr-ar="${esc(ab)}" data-dr-en="${esc(eb)}">${esc(ab)}</p></article>`).join('');
}

function roadmapCards(){
  const rows=[
    ['1','تقوية النسخة التنفيذية','Executable hardening','اختبارات متصفح وهاتف، حالة تشغيل موحدة، سجل قرارات وإعادة تشغيل دقيقة.','Browser/mobile E2E, unified live state, decision ledger and exact replay.'],
    ['2','تكامل تجريبي للبيانات','Pilot data integration','عقود بيانات وموصلات قراءة فقط مع مصادر مرور معتمدة لدى الجهة.','Data contracts and read-only connectors to buyer-approved traffic sources.'],
    ['3','تشغيل تجريبي مضبوط','Controlled operational pilot','بيئة محدودة بصلاحيات واضحة، موافقة بشرية وعدم تطبيق تلقائي للقرارات.','Bounded environment with explicit authority, human approval and no automatic field execution.'],
    ['4','السلامة والاعتماد','Safety & assurance','اختبارات أداء وسلامة وأمن وسياسات تشغيل وتحقق مستقل حسب نطاق الجهة.','Performance, safety, security and operating-policy validation with independent assurance as required.'],
    ['5','الإنتاج والتوسع','Production & scale','نشر مؤسسي مراقب، تكاملات فعلية، مراقبة تشغيلية وخطة توسع تدريجية.','Governed enterprise deployment, real integrations, observability and staged scaling.']
  ];
  return rows.map(([n,a,e,ab,eb])=>`<article class="dr-roadmap-card"><b>${n}</b><div><h4 data-dr-ar="${esc(a)}" data-dr-en="${esc(e)}">${esc(a)}</h4><p data-dr-ar="${esc(ab)}" data-dr-en="${esc(eb)}">${esc(ab)}</p></div></article>`).join('');
}

function deploymentCards(){
  const rows=[
    ['منصة سيادية/حكومية','Sovereign / Government','نشر داخل بيئة الجهة مع سياسات وصول وبيانات وتكاملات تحددها الجهة.','Deployment inside the authority environment with buyer-defined access, data and integration policies.'],
    ['مدينة ذكية','Smart City','طبقة ذكاء مروري فوق مصادر المدينة وأنظمتها الحالية ضمن نطاق تكامل متفق عليه.','Traffic-intelligence layer over existing city systems within an agreed integration scope.'],
    ['مشغل نقل أو بنية تحتية','Transport / Infrastructure Operator','تخصيص المحركات والتحليلات لمسارات أو أساطيل أو مرافق تشغيلية محددة.','Tailored engines and analytics for selected corridors, fleets or operating assets.'],
    ['استحواذ كامل','Full Acquisition','نقل الأصول والحقوق المتفق عليها بعد الفحص الفني والقانوني وتحديد نطاق الملكية الفكرية.','Transfer of agreed assets and rights after technical/legal diligence and an explicit IP scope.']
  ];
  return rows.map(([a,e,ab,eb])=>`<article class="dr-model-card"><h4 data-dr-ar="${esc(a)}" data-dr-en="${esc(e)}">${esc(a)}</h4><p data-dr-ar="${esc(ab)}" data-dr-en="${esc(eb)}">${esc(ab)}</p></article>`).join('');
}

function evidenceRows(s){
  const rows=[
    ['implemented_demo',s.implemented_demo,'عرض تنفيذي يعمل داخل المحاكاة','Executable logic available in the simulation'],
    ['represented_demo',s.represented_demo,'ممثلة في الواجهة أو التصميم التجريبي دون تنفيذ كامل','Represented in demo/design without full executable implementation'],
    ['catalogued_only',s.catalogued_only,'موثقة في السجل ولم تُنفذ بعد داخل هذا الـMVP','Recorded in the registry but not yet implemented in this MVP'],
    ['production_verified',s.production_verified,'يتطلب دليل تشغيل مستقل؛ القيمة الحالية صفر','Requires independent production evidence; current count is zero']
  ];
  return rows.map(([k,n,a,e])=>`<div class="dr-evidence-row"><span class="dr-status ${k}">${k}</span><strong>${n}</strong><p data-dr-ar="${esc(a)}" data-dr-en="${esc(e)}">${esc(a)}</p></div>`).join('');
}

function dueDiligenceLinks(){
  const links=[
    [`${REPO}/blob/feature/unified-traffic-mvp-v1/README.md`,'README','نطاق الـMVP وحدود الإثبات','MVP scope and evidence boundary'],
    [`${REPO}/blob/feature/unified-traffic-mvp-v1/ARCHITECTURE.md`,'ARCHITECTURE','الهيكل المعماري المنطقي','Logical architecture'],
    [`${REPO}/blob/feature/unified-traffic-mvp-v1/evidence/EVIDENCE_REGISTER.json`,'EVIDENCE REGISTER','سجل الأدلة والمصادر','Evidence and source register'],
    [`${REPO}/blob/feature/unified-traffic-mvp-v1/data/features.json`,'FEATURE MANIFEST','الفهرس الموحد لمصادر القدرات','Unified feature-source manifest'],
    [`${REPO}/actions`,'CI / ACTIONS','سجل الاختبارات والنشر','Test and deployment history']
  ];
  return links.map(([href,title,a,e])=>`<a class="dr-dd-link" href="${href}" target="_blank" rel="noopener"><strong>${title}</strong><span data-dr-ar="${esc(a)}" data-dr-en="${esc(e)}">${esc(a)}</span><i>↗</i></a>`).join('');
}

function buildRoom(){
  if(byId('acquisitionDecisionRoom'))return;
  const dash=byId('acquisitionDashboard');if(!dash)throw new Error('Acquisition dashboard unavailable');
  const s=state.summary;
  const groups=countGroups();
  const implemented=topImplemented();
  const section=document.createElement('section');section.id='acquisitionDecisionRoom';section.className='dr-room';
  section.innerHTML=`
    <div class="dr-hero">
      <div><div class="dr-kicker">ACQUISITION DECISION ROOM</div><h2 data-dr-ar="غرفة قرار الاستحواذ" data-dr-en="Acquisition Decision Room">غرفة قرار الاستحواذ</h2><p data-dr-ar="مساحة تنفيذية تجمع ما يحتاجه المستحوذ لفهم نطاق المنصة، مستوى الجاهزية، الهيكل المعماري، مسار الانتقال للإنتاج وحدود الملكية الفكرية — دون كشف الخوارزميات أو الأسرار التقنية الحساسة." data-dr-en="An executive space bringing together platform scope, readiness, architecture, production path and IP boundaries — without exposing algorithms or sensitive implementation details.">مساحة تنفيذية تجمع ما يحتاجه المستحوذ لفهم نطاق المنصة، مستوى الجاهزية، الهيكل المعماري، مسار الانتقال للإنتاج وحدود الملكية الفكرية — دون كشف الخوارزميات أو الأسرار التقنية الحساسة.</p></div>
      <div class="dr-hero-actions"><button class="btn primary" id="drExport" data-dr-ar="تصدير ملخص القرار" data-dr-en="Export decision brief">تصدير ملخص القرار</button><a class="btn" href="mailto:${CONTACT.email}?subject=Smart%20Traffic%20AI%20-%20Technical%20Due%20Diligence" data-dr-ar="طلب فحص فني" data-dr-en="Request technical diligence">طلب فحص فني</a></div>
    </div>
    <div class="dr-facts"><div><strong>${s.total}</strong><span data-dr-ar="إجمالي القدرات" data-dr-en="Total capabilities">إجمالي القدرات</span></div><div><strong>${s.implemented_demo}</strong><span data-dr-ar="منفذة تجريبياً" data-dr-en="Executable demos">منفذة تجريبياً</span></div><div><strong>${s.represented_demo}</strong><span data-dr-ar="ممثلة تجريبياً" data-dr-en="Represented demos">ممثلة تجريبياً</span></div><div><strong>${s.catalogued_only}</strong><span data-dr-ar="موثقة فقط" data-dr-en="Catalogued only">موثقة فقط</span></div><div><strong>${s.production_verified}</strong><span data-dr-ar="تحقق إنتاجي" data-dr-en="Production verified">تحقق إنتاجي</span></div></div>

    <div class="dr-two">
      <section class="dr-panel">${sectionTitle('WHY ACQUIRE','لماذا تستحق المنصة الفحص للاستحواذ؟','Why this platform merits acquisition diligence','القيمة هنا ليست ادعاء اكتمال إنتاجي؛ بل تجميع محركات تنفيذية وسجل قدرات موحد وبنية قابلة للتوسع مع حدود إثبات واضحة.','The value proposition is not a claim of production completeness; it is the combination of executable engines, a unified capability registry, extensible architecture and explicit evidence boundaries.')}<div class="dr-value-grid"><article><b>01</b><h4 data-dr-ar="نواة تنفيذية موجودة" data-dr-en="Existing executable core">نواة تنفيذية موجودة</h4><p data-dr-ar="محركات للمسارات والحوادث والتوأم والتنبؤ والتنظيم والتفسير والسياسات تعمل داخل بيئة المحاكاة." data-dr-en="Routing, incident, twin, prediction, orchestration, explainability and policy engines run inside the simulation environment.">محركات للمسارات والحوادث والتوأم والتنبؤ والتنظيم والتفسير والسياسات تعمل داخل بيئة المحاكاة.</p></article><article><b>02</b><h4 data-dr-ar="محفظة قدرات واسعة" data-dr-en="Broad capability portfolio">محفظة قدرات واسعة</h4><p data-dr-ar="السجل الموحد يحتوي ${s.total} قدرة مع حالة تنفيذ منفصلة لكل قدرة، ما يوضح نطاق التوسع الممكن دون الادعاء بأنها منفذة كلها." data-dr-en="The unified registry contains ${s.total} capabilities with a separate implementation state for each, showing expansion scope without claiming all are implemented.">السجل الموحد يحتوي ${s.total} قدرة مع حالة تنفيذ منفصلة لكل قدرة، ما يوضح نطاق التوسع الممكن دون الادعاء بأنها منفذة كلها.</p></article><article><b>03</b><h4 data-dr-ar="حوكمة قرار مدمجة" data-dr-en="Built-in decision governance">حوكمة قرار مدمجة</h4><p data-dr-ar="التوصيات التجريبية تمر عبر حدود سياسات مع autoApply=false وموافقة بشرية إلزامية." data-dr-en="Demo recommendations pass through policy boundaries with autoApply=false and mandatory human approval.">التوصيات التجريبية تمر عبر حدود سياسات مع autoApply=false وموافقة بشرية إلزامية.</p></article><article><b>04</b><h4 data-dr-ar="قابلية فحص واضحة" data-dr-en="Diligence-friendly evidence">قابلية فحص واضحة</h4><p data-dr-ar="السجل، المعمارية، الأدلة، الاختبارات وسجل النشر متاحة للفحص الفني المنظم." data-dr-en="Registry, architecture, evidence, tests and deployment history are available for structured technical diligence.">السجل، المعمارية، الأدلة، الاختبارات وسجل النشر متاحة للفحص الفني المنظم.</p></article></div></section>
      <section class="dr-panel">${sectionTitle('READINESS MATRIX','مصفوفة الجاهزية والإثبات','Readiness & evidence matrix','الحالة المعروضة مأخوذة من Coverage Model الفعلي ولا تساوي اعتماداً أو تحققاً إنتاجياً.','Displayed status comes from the actual Coverage Model and does not equal certification or production verification.')}<div class="dr-evidence">${evidenceRows(s)}</div><div class="dr-boundary">SIMULATION · autoApply=false · humanApprovalRequired=true · production_verified=${s.production_verified}</div></section>
    </div>

    <section class="dr-panel">${sectionTitle('ARCHITECTURE SNAPSHOT','لقطة معمارية آمنة للفحص','Acquisition-safe architecture snapshot','تعرض الطبقات الوظيفية وما بينها من تسلسل دون كشف المعادلات أو أسرار التنفيذ الداخلية.','Shows functional layers and flow without disclosing equations or sensitive internal implementation.')}<div class="dr-architecture">${architectureCards()}</div></section>

    <div class="dr-two">
      <section class="dr-panel">${sectionTitle('CAPABILITY SIGNAL','إشارة نطاق المحفظة','Capability portfolio signal','توزيع السجل حسب مجموعات المصدر مع عينة من القدرات المنفذة تجريبياً.','Registry distribution by source group with a sample of executable-demo capabilities.')}<div class="dr-groups">${groups.map(([g,n])=>`<div><span>${esc(g)}</span><strong>${n}</strong></div>`).join('')}</div><div class="dr-implemented"><h4 data-dr-ar="عينة من القدرات المنفذة" data-dr-en="Sample executable capabilities">عينة من القدرات المنفذة</h4>${implemented.map(x=>`<div><code>${esc(x.coverage.id)}</code><span>${esc(ar()?(x.feature.title_ar||x.feature.title||x.coverage.title_ar||x.coverage.title_en):(x.feature.title_en||x.feature.title||x.coverage.title_en||x.coverage.title_ar))}</span></div>`).join('')}</div><button class="btn" id="drOpenPortfolio" data-dr-ar="فتح محفظة القدرات الكاملة" data-dr-en="Open complete capability portfolio">فتح محفظة القدرات الكاملة</button></section>
      <section class="dr-panel">${sectionTitle('DUE DILIGENCE','مركز الفحص الفني','Technical due-diligence center','روابط مباشرة إلى المواد القابلة للفحص في المستودع.','Direct links to inspectable materials in the repository.')}<div class="dr-dd">${dueDiligenceLinks()}</div></section>
    </div>

    <section class="dr-panel">${sectionTitle('MVP → PRODUCTION','مسار الانتقال إلى الإنتاج','MVP-to-production path','خارطة مراحل وليست وعداً زمنياً أو شهادة جاهزية؛ تفاصيل كل مرحلة تعتمد على بيانات وتكاملات ومتطلبات الجهة المستحوذة.','A staged path, not a schedule or readiness certification; each stage depends on buyer data, integrations and assurance requirements.')}<div class="dr-roadmap">${roadmapCards()}</div></section>

    <section class="dr-panel">${sectionTitle('DEPLOYMENT OPTIONS','نماذج النشر أو الصفقة','Deployment / transaction models','نماذج أولية للتقييم؛ الهيكل التجاري والقانوني النهائي يحدد بالتفاوض والفحص النافي للجهالة.','Illustrative evaluation models; final commercial and legal structure is subject to negotiation and diligence.')}<div class="dr-models">${deploymentCards()}</div></section>

    <div class="dr-two">
      <section class="dr-panel dr-ip">${sectionTitle('IP BOUNDARY','حدود الملكية الفكرية في العرض','IP disclosure boundary','هذه الواجهة تعرض الوظائف والنتائج وحالة الإثبات، ولا تعرض الخوارزميات الحساسة أو مفاتيح أو بيانات إنتاجية أو أسرار تشغيلية.','This interface exposes capabilities, outputs and evidence status, not sensitive algorithms, credentials, production data or operational secrets.')}<ul><li data-dr-ar="لا أكواد مصدر حساسة أو معادلات داخلية في غرفة القرار." data-dr-en="No sensitive source algorithms or internal equations in the Decision Room.">لا أكواد مصدر حساسة أو معادلات داخلية في غرفة القرار.</li><li data-dr-ar="لا بيانات حكومية أو مرورية حية ضمن الـMVP الحالي." data-dr-en="No live government or road-network data in the current MVP.">لا بيانات حكومية أو مرورية حية ضمن الـMVP الحالي.</li><li data-dr-ar="لا عتاد كمومي أو اتصال V2X ميداني مثبت." data-dr-en="No verified quantum hardware or field V2X communication.">لا عتاد كمومي أو اتصال V2X ميداني مثبت.</li><li data-dr-ar="لا شهادة سلامة أو اعتماد إنتاجي حتى يثبت ذلك بأدلة مستقلة." data-dr-en="No safety certification or production validation unless independently evidenced.">لا شهادة سلامة أو اعتماد إنتاجي حتى يثبت ذلك بأدلة مستقلة.</li></ul></section>
      <section class="dr-panel dr-contact">${sectionTitle('NEXT ACTION','الخطوة التالية للمستحوذ','Buyer next action','بعد الجولة يمكن فتح الفحص الفني أو طلب مناقشة استحواذ وتحديد نطاق البيانات والتكامل والملكية الفكرية المطلوب فحصه.','After the guided demo, the buyer can open technical diligence or request an acquisition discussion and define the data, integration and IP scope to inspect.')}<div class="dr-contact-card"><strong data-dr-ar="${esc(CONTACT.nameAr)}" data-dr-en="${esc(CONTACT.nameEn)}">${esc(CONTACT.nameAr)}</strong><a href="mailto:${CONTACT.email}">${CONTACT.email}</a><a href="tel:${CONTACT.phone.replace(/\s/g,'')}">${CONTACT.phone}</a><div><a class="btn primary" href="mailto:${CONTACT.email}?subject=Smart%20Traffic%20AI%20-%20Acquisition%20Discussion" data-dr-ar="طلب مناقشة استحواذ" data-dr-en="Request acquisition discussion">طلب مناقشة استحواذ</a><a class="btn" href="${REPO}" target="_blank" rel="noopener" data-dr-ar="فتح المستودع" data-dr-en="Open repository">فتح المستودع</a></div></div></section>
    </div>`;
  dash.insertAdjacentElement('afterend',section);
  byId('drOpenPortfolio').onclick=()=>byId('acquisitionFeatureExplorer')?.scrollIntoView({behavior:'smooth',block:'start'});
  byId('drExport').onclick=exportDecisionBrief;
}

function exportDecisionBrief(){
  const s=state.summary;
  const brief={schema:'smart-traffic-acquisition-decision-brief/v1',generatedFrom:'live MVP registry and coverage model',platform:'Smart Traffic AI MVP',evidenceBoundary:{simulation:true,autoApply:false,humanApprovalRequired:true,productionVerified:s.production_verified},coverage:s,sourceGroups:Object.fromEntries(countGroups()),productionPath:['executable_hardening','pilot_data_integration','controlled_operational_pilot','safety_and_assurance','production_and_scale'],contact:{name:CONTACT.nameEn,email:CONTACT.email,phone:CONTACT.phone},repository:REPO};
  const blob=new Blob([JSON.stringify(brief,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Smart_Traffic_AI_Acquisition_Decision_Brief.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function translate(){document.querySelectorAll('[data-dr-ar][data-dr-en]').forEach(el=>{el.textContent=ar()?el.dataset.drAr:el.dataset.drEn})}

async function init(){
  await loadPortfolio();await waitFor('acquisitionDashboard');buildRoom();addNavButton();addDashboardEntry();translate();
  new MutationObserver(()=>translate()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  window.smartTrafficDecisionRoomReady=true;window.dispatchEvent(new CustomEvent('smart-traffic:decision-room-ready',{detail:{summary:state.summary}}));
}
init().catch(error=>{console.error('Acquisition Decision Room failed:',error);window.smartTrafficDecisionRoomFailed=error.message});
