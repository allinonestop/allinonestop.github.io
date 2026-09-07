window.ALLINONESTOP_CONFIG = {
  SUPABASE_URL: "https://dixsmucrgnyuvudhymdj.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_Z5T2Fbbr0RPMZds67p7-9Q_Yw2-jMVn"
};

/* SUPER RETAILER PRO: Election New/Correction = ₹250 only for super_pro. */
(function(){
  function isSuper(){
    try{
      const t=String((typeof retailer!=="undefined"&&retailer&&(retailer.retailer_type||retailer.service_access))||"").toLowerCase().trim().replace(/[\s-]+/g,"_");
      return ["super_pro","super_retailer_pro","super_retailer"].includes(t);
    }catch(e){return false;}
  }
  function electionKind(name){
    const n=String(name||"").toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ").trim();
    if(!n.includes("election")&&!n.includes("voter"))return"";
    if(n.includes("correction")||n.includes("update"))return"correction";
    if(n.includes("new")||n==="election card")return"new";
    return"";
  }
  function apply(){try{
    if(!/retailer\.html$/i.test(location.pathname)||typeof retailer==="undefined"||!retailer||!Array.isArray(services))return;
    if(typeof effectiveServiceAmount!=="function")return;
    const superPro=isSuper(),wanted=superPro?250:500;
    services.forEach(s=>{const k=electionKind(s?.name);if(k)s.amount=wanted;});
    if(typeof selected!=="undefined"&&selected&&electionKind(selected.name)){selected.amount=wanted;const a=document.getElementById("amount"),t=document.getElementById("amountText");if(a)a.value=String(wanted);if(t)t.textContent="₹"+wanted;if(typeof generateUPIQR==="function")generateUPIQR(wanted);}
    if(typeof renderServiceFolders==="function")renderServiceFolders();
  }catch(e){console.warn("Election price patch:",e)}}
  const start=()=>{apply();setInterval(apply,500)};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();

/* SUPER RETAILER 2: all active services except known Ration Card records. */
(function(){
  const RATION_SERVICE_IDS=new Set(["03e7e0b7-bbf6-4923-a0f4-36bbdf41d4cf","9a6bd3b3-b409-46d2-8620-b1f2a992213a","fc2baf87-beef-4c3c-bd12-5f71961807b9","c32380c8-9f2f-4e05-a2fd-db1e966fa184","68c2e53c-835a-48fc-925a-e634e7451536","3f26c691-9061-4f36-8ec2-b84b0d991ac9","56cfcfc2-d886-4fe5-89cf-cca664dee57d","0417fb20-fdc2-4337-ae22-9e68b33628a1","d4d35edd-a3a8-403b-8b6e-ee6e3dd00834","2e57930d-130e-4139-a45f-95b14d2703f2","c086e584-d162-4ad1-aedb-4c9aacc0d2ca","aae24c2a-932e-4f69-a503-d1d9e140cabe","9886de28-ef1e-4b33-b5b8-853153176702"]);
  function isSR2(){try{if(!/super-retailer-2\.html$/i.test(location.pathname)||typeof retailer==="undefined"||!retailer)return false;const t=String(retailer.retailer_type||retailer.service_access||"").toLowerCase().trim().replace(/[\s-]+/g,"_");return ["super_pro_2","super_retailer_2","super_retailer_2_pro"].includes(t)}catch(e){return false}}
  async function loadSR2(){if(!isSR2()||typeof sb==="undefined")return false;const{data,error}=await sb.from("services").select("id,name,amount,without_ration_amount,fields,description,sort_order,active").eq("active",true).order("sort_order",{ascending:true});if(error)throw error;services=(data||[]).filter(s=>!RATION_SERVICE_IDS.has(String(s?.id||"")));if(typeof renderServiceFolders==="function")renderServiceFolders();return true}
  function install(){try{if(!isSR2())return;if(typeof loadServices==="function"&&!loadServices.__sr2){const old=loadServices;const f=async function(){const r=await loadSR2();return r?true:old.apply(this,arguments)};f.__sr2=true;loadServices=f}loadSR2().catch(console.warn)}catch(e){console.warn(e)}}
  const t=setInterval(install,300);setTimeout(()=>clearInterval(t),15000);if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);else install();
})();

/* RETAILER PRO: retailer.html is a dedicated portal for DL, RC, Voter Card, LMS and all PDF/Download work only. */
(function(){
  const PRO_TYPES=["super_pro_2","retailer_pro","super_retailer_2","super_retailer_2_pro"];
  const norm=v=>String(v||"").toLowerCase().trim().replace(/[\s-]+/g,"_");
  const isPro=p=>PRO_TYPES.includes(norm(p?.retailer_type||p?.service_access||""));
  const ids=v=>{let s=String(v||"").trim().toUpperCase();return s?[...new Set([s,s.startsWith("RET-")?s.slice(4):"RET-"+s])]:[]};
  const emails=v=>ids(v).map(x=>x.toLowerCase()+"@dixsmucrgnyuvudhymdj.supabase.co");
  function active(){return/retailer\.html$/i.test(location.pathname)}
  function isRationName(n){return /ration|redtion|nsfa|vibhajan|division|wrong finger|finger correction|fingerprint|name add|name delete|delete name|pita name to pati name|ration number to aadhar/i.test(String(n||""))}
  function allowed(s){const n=String(s?.name||"").toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ").trim();if(isRationName(n))return false;return /lms|(^|\s)dl(\s|$)|dl pdf|driving licen[cs]e|(^|\s)rc(\s|$)|rc pdf|registration certificate|election|voter|chutni|pdf|download/i.test(n)}
  function filter(){try{if(!active()||typeof services==="undefined"||!Array.isArray(services))return;services=services.filter(allowed);if(typeof renderServiceFolders==="function")renderServiceFolders();const n=document.getElementById("serviceAccessNote")||document.getElementById("serviceAccess");if(n)n.textContent="⭐ Retailer Pro • PAN + Election + DL + RC + Voter + LMS + PDF/Download + Second PAN • Ration Card: NONE"}catch(e){console.warn("Retailer Pro filter:",e)}}
  function brand(){if(!active())return;document.title="AllInOneStop - Retailer Pro";const h=document.querySelector("h1");if(h)h.textContent="⭐ AllInOneStop - Retailer Pro"}
  async function proLogin(){const u=document.getElementById("username")?.value?.trim()||"",p=document.getElementById("password")?.value||"",m=document.getElementById("loginMsg")||document.getElementById("loginMessage");if(!u||!p){if(m)m.textContent="Retailer ID and Password required.";return}const b=document.getElementById("loginBtn");if(b){b.disabled=true;b.textContent="Logging in..."}let last="Invalid login credentials";try{for(const em of emails(u)){const r=await supabaseClient.auth.signInWithPassword({email:em,password:p});if(r.error){last=r.error.message;continue}const q=await supabaseClient.from("profiles").select("*").eq("id",r.data.user.id).maybeSingle();if(q.error)throw q.error;if(!q.data||q.data.role!=="retailer")throw new Error("Retailer profile not found.");if(!isPro(q.data)){await supabaseClient.auth.signOut();throw new Error("This account does not have Retailer Pro access. Admin me Retailer Pro select karein.")}retailer=q.data;if(typeof showApp==="function")showApp();if(typeof loadServices==="function")await loadServices();if(typeof loadApplicationHistory==="function")await loadApplicationHistory();else if(typeof loadHistory==="function")await loadHistory();filter();brand();return}throw new Error(last)}catch(e){if(m)m.textContent=e.message||"Login failed."}finally{if(b){b.disabled=false;b.textContent="Login"}}}
  function patch(){try{if(!active())return;brand();if(typeof effectiveServiceAmount==="function")effectiveServiceAmount=s=>Number(s?.amount||0);filter();if(typeof loadServices==="function"&&!loadServices.__rp){const old=loadServices;const f=async function(){const r=await old.apply(this,arguments);filter();return r};f.__rp=true;loadServices=f}window.login=proLogin;window.submitApplication=window.submitApplication||proSubmit}catch(e){console.warn("Retailer Pro patch:",e)}}
  const t=setInterval(patch,700);setTimeout(()=>clearInterval(t),20000);if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",patch);else patch();
})();

/* LOGIN MODES: exactly three clickable choices on retailer.html. */
(function(){
  function inject(){
    if(!/retailer\.html$/i.test(location.pathname))return;
    const wrap=document.getElementById("loginModes");
    if(!wrap)return;
    wrap.setAttribute("role","radiogroup");
    wrap.setAttribute("aria-label","Login Mode");
    wrap.innerHTML=''
      +'<button type="button" class="login-mode-card active" data-mode="retailer" aria-pressed="true" onclick="setLoginMode(\'retailer\')"><strong>👤 Retailer</strong><span>Ration Card + PAN + Election + DL + RC + Voter + LMS + PDF + Second PAN</span></button>'
      +'<button type="button" class="login-mode-card" data-mode="super" aria-pressed="false" onclick="setLoginMode(\'super\')"><strong>👑 Super Retailer</strong><span>Retailer ki same services + Election New/Correction ₹250</span></button>'
      +'<button type="button" class="login-mode-card" data-mode="pro" aria-pressed="false" onclick="setLoginMode(\'pro\')"><strong>⭐ Retailer Pro</strong><span>PAN + Election + DL + RC + Voter + LMS + PDF + Second PAN • Ration Card nahi</span></button>';
    let st=document.getElementById("retailer-login-mode-css");
    if(!st){
      st=document.createElement("style");st.id="retailer-login-mode-css";
      st.textContent='.login-mode-card{display:block;width:100%;text-align:left;appearance:none;-webkit-appearance:none;cursor:pointer;margin:0;padding:13px 14px;border:1px solid rgba(148,163,184,.18);border-radius:14px;background:rgba(2,6,23,.38);color:inherit}.login-mode-card strong{display:block;color:#fff;font-size:14px;font-weight:900;margin-bottom:4px}.login-mode-card span{display:block;color:#8190a7;font-size:11px;line-height:1.45}.login-mode-card.active{border-color:#818cf8;background:linear-gradient(145deg,rgba(124,58,237,.18),rgba(37,99,235,.10));box-shadow:0 8px 22px rgba(79,70,229,.13)}';
      document.head.appendChild(st);
    }
  }
  function start(){inject();setTimeout(inject,50);setTimeout(inject,500)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
