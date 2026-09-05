window.ALLINONESTOP_CONFIG = {
  SUPABASE_URL: "https://dixsmucrgnyuvudhymdj.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_Z5T2Fbbr0RPMZds67p7-9Q_Yw2-jMVn"
};

/* SUPER RETAILER PRO: only Election New/Correction price differs.
   No private-price editor and no other service price override. */
(function(){
  function isSuper(){
    try{
      const t=String(
        (typeof retailer!=="undefined" && retailer && (retailer.retailer_type||retailer.service_access)) || ""
      ).toLowerCase().trim().replace(/[\s-]+/g,"_");
      return ["super_pro","super_retailer_pro","super_retailer"].includes(t);
    }catch(e){ return false; }
  }

  function electionKind(name){
    const n=String(name||"").toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ").trim();
    if(!n.includes("election")) return "";
    if(n.includes("correction") || n.includes("update")) return "correction";
    if(n === "election card" || n.includes("new election") || n.includes("new election card") || n.includes("election card new")) return "new";
    return "";
  }

  function applyElectionPrice(){
    try{
      if(!/retailer\.html$/i.test(location.pathname)) return;
      if(typeof retailer==="undefined" || !retailer) return;
      if(typeof services==="undefined" || !Array.isArray(services) || !services.length) return;
      if(typeof getServiceType!=="function") return;

      const wantedSuper=isSuper();
      const wanted=wantedSuper ? 250 : 500;
      let changed=false;

      services.forEach(function(s){
        const kind=electionKind(s && s.name);
        if(!kind) return;
        if(Number(s.amount||0)!==wanted){
          s.amount=wanted;
          changed=true;
        }
      });

      if(typeof selected!=="undefined" && selected){
        const kind=electionKind(selected.name);
        if(kind){
          const amount=wanted;
          if(Number(selected.amount||0)!==amount) selected.amount=amount;
          const amountEl=document.getElementById("amount");
          const amountText=document.getElementById("amountText");
          if(amountEl) amountEl.value=String(amount);
          if(amountText) amountText.textContent="₹"+amount;
          if(typeof generateUPIQR==="function") generateUPIQR(amount);
        }
      }

      if(changed && typeof renderServiceFolders==="function") renderServiceFolders();
    }catch(e){
      console.warn("Election price patch skipped:",e);
    }
  }

  function start(){
    applyElectionPrice();
    setInterval(applyElectionPrice,500);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start);
  else start();
})();
