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

/* SUPER RETAILER 2: force the dedicated panel to use ALL active services
   except the known Ration Card service records, and always use normal prices. */
(function(){
  const RATION_SERVICE_IDS=new Set([
    "03e7e0b7-bbf6-4923-a0f4-36bbdf41d4cf",
    "9a6bd3b3-b409-46d2-8620-b1f2a992213a",
    "fc2baf87-beef-4c3c-bd12-5f71961807b9",
    "c32380c8-9f2f-4e05-a2fd-db1e966fa184",
    "68c2e53c-835a-48fc-925a-e634e7451536",
    "3f26c691-9061-4f36-8ec2-b84b0d991ac9",
    "56cfcfc2-d886-4fe5-89cf-cca664dee57d",
    "0417fb20-fdc2-4337-ae22-9e68b33628a1",
    "d4d35edd-a3a8-403b-8b6e-ee6e3dd00834",
    "2e57930d-130e-4139-a45f-95b14d2703f2",
    "c086e584-d162-4ad1-aedb-4c9aacc0d2ca",
    "aae24c2a-932e-4f69-a503-d1d9e140cabe",
    "9886de28-ef1e-4b33-b5b8-853153176702"
  ]);

  function patch(){
    try{
      if(!/super-retailer-2\.html$/i.test(location.pathname)) return;
      if(typeof retailer === "undefined" || !retailer) return;
      const rt=String(retailer.retailer_type||retailer.service_access||"").toLowerCase().trim().replace(/[\s-]+/g,"_");
      if(!["super_pro_2","super_retailer_2","super_retailer_2_pro"].includes(rt)) return;

      const exactFilter=function(service){
        return RATION_SERVICE_IDS.has(String(service?.id||""));
      };
      const normalPrice=function(service){
        return Number(service?.amount||0);
      };

      window.isRationCardService=exactFilter;
      window.effectiveServiceAmount=normalPrice;

      if(typeof loadServices === "function"){
        loadServices();
        clearInterval(timer);
      }
    }catch(e){
      console.warn("Super Retailer 2 runtime patch skipped:",e);
    }
  }

  const timer=setInterval(patch,300);
  if(document.readyState!=="loading") patch();
  else document.addEventListener("DOMContentLoaded",patch);
})();
