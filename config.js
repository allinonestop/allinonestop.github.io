window.ALLINONESTOP_CONFIG = {
  SUPABASE_URL: "https://dixsmucrgnyuvudhymdj.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_Z5T2Fbbr0RPMZds67p7-9Q_Yw2-jMVn"
};

/* =====================================================
   RETAILER ACCESS RULES
   Keep the normal retailer dashboard/application exactly the same.
   Super Retailer Pro differs only in Election Card pricing:
   New = ₹250, Correction/Update = ₹250.
   All other service prices stay unchanged.
===================================================== */
(function(){
  function install(){
    if(!/retailer\.html$/i.test(location.pathname)) return;
    if(typeof window.supabase === "undefined") return;

    const normalize = value => String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g,"_");

    const retailerType = () => normalize(
      typeof retailer !== "undefined" ? retailer?.retailer_type : ""
    );

    const isSuperPro = () => [
      "super_pro",
      "super_retailer_pro",
      "super_retailer"
    ].includes(retailerType());

    const isElectionSpecial = service => {
      if(!service) return false;
      const n = String(service.name || "").toLowerCase();
      return n.includes("election") && (
        n.includes("correction") ||
        n.includes("update") ||
        n === "election card" ||
        n.includes("new election") ||
        n.includes("election card new")
      );
    };

    const electionPrice = 250;

    function patchAfterLoad(){
      if(!isSuperPro() || typeof services === "undefined") return;

      /* Same full service list as All Work, without changing stored data. */
      services.forEach(s => {
        if(isElectionSpecial(s)) s.__allinonestop_original_amount = s.amount;
      });

      const select = document.getElementById("service");
      if(select){
        services.forEach(s => {
          if(!isElectionSpecial(s)) return;
          const opt = select.querySelector(`option[value="${CSS.escape(String(s.id))}"]`);
          if(opt) opt.textContent = `${s.name} - ₹${electionPrice}`;
        });
      }

      if(typeof window.renderServiceFolders === "function"){
        window.renderServiceFolders();
      }
    }

    const timer = setInterval(() => {
      if(
        typeof window.loadServices === "function" &&
        typeof window.serviceChanged === "function" &&
        typeof window.renderServiceFolders === "function"
      ){
        clearInterval(timer);

        const oldLoadServices = window.loadServices;
        const oldServiceChanged = window.serviceChanged;
        const oldRenderFolders = window.renderServiceFolders;

        /* Super Pro sees the exact same service list as All Work. */
        window.loadServices = async function(){
          const r = typeof retailer !== "undefined" ? retailer : null;
          if(!isSuperPro()) return oldLoadServices.apply(this,arguments);

          const oldType = r?.retailer_type;
          if(r) r.retailer_type = "all_work";
          try{
            const result = await oldLoadServices.apply(this,arguments);
            patchAfterLoad();
            return result;
          }finally{
            if(r) r.retailer_type = oldType;
          }
        };

        /* Service cards: only Super Pro Election New/Correction shows ₹250. */
        window.renderServiceFolders = function(){
          if(!isSuperPro()) return oldRenderFolders.apply(this,arguments);

          const changed = [];
          try{
            if(typeof services !== "undefined"){
              services.forEach(s => {
                if(isElectionSpecial(s)){
                  changed.push([s,s.amount]);
                  s.amount = electionPrice;
                }
              });
            }
            return oldRenderFolders.apply(this,arguments);
          }finally{
            changed.forEach(([s,amount]) => { s.amount = amount; });
          }
        };

        /* Application/payment: only Super Pro Election New/Correction = ₹250. */
        window.serviceChanged = function(){
          if(!isSuperPro()) return oldServiceChanged.apply(this,arguments);

          const serviceId = document.getElementById("service")?.value;
          const svc = typeof services !== "undefined"
            ? services.find(s => String(s.id) === String(serviceId))
            : null;

          if(!isElectionSpecial(svc)){
            return oldServiceChanged.apply(this,arguments);
          }

          const oldAmount = svc.amount;
          svc.amount = electionPrice;
          try{
            return oldServiceChanged.apply(this,arguments);
          }finally{
            svc.amount = oldAmount;
          }
        };

        /* Re-render once after login/auto-login so Super Pro has the same UI as normal All Work. */
        window.renderServiceFolders();
        patchAfterLoad();
      }
    },50);

    setTimeout(() => clearInterval(timer),15000);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",install);
  }else{
    install();
  }
})();
