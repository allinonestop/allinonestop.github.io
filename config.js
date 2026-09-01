window.ALLINONESTOP_CONFIG = {
  SUPABASE_URL: "https://dixsmucrgnyuvudhymdj.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_Z5T2Fbbr0RPMZds67p7-9Q_Yw2-jMVn"
};

/* Retailer safety patch: robust Election service detection and file fields. */
(function(){
  if(!/retailer\.html$/i.test(location.pathname)) return;
  window.addEventListener("DOMContentLoaded", function(){
    try{
      if(typeof window.getServiceType === "function"){
        const originalGetServiceType=window.getServiceType;
        window.getServiceType=function(name){
          const n=String(name||"").toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ").trim();
          if(n.includes("election")&&(n.includes("correction")||n.includes("update"))) return "election_correction";
          if(n.includes("election")&&n.includes("card")) return "election_new";
          return originalGetServiceType(name);
        };
      }
      const electionFiles=[
        ["mother_election_card_pdf","Mother Election Card PDF",true],
        ["father_election_card_pdf","Father Election Card PDF",true],
        ["election_card_pdf","Election Card PDF",true],
        ["customer_signature","Customer Signature",true],
        ["aadhaar_pdf","Aadhaar Card PDF",true],
        ["lc_pdf","LC PDF",true],
        ["customer_photo","Customer Photo",true]
      ];
      const originalRenderFiles=window.renderFiles;
      window.renderFiles=function(list){
        const selectedName=String(window.selected?.name||"").toLowerCase();
        if(selectedName.includes("election")&&typeof originalRenderFiles==="function"){
          originalRenderFiles(electionFiles);
          return;
        }
        if(typeof originalRenderFiles==="function") originalRenderFiles(list||[]);
      };
    }catch(e){console.warn("Retailer safety patch skipped:",e);}
  });
})();
