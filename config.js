window.ALLINONESTOP_CONFIG = {
  SUPABASE_URL: "https://dixsmucrgnyuvudhymdj.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_Z5T2Fbbr0RPMZds67p7-9Q_Yw2-jMVn"
};

/*
  Retailer login support.
  retailer.html owns login, service filtering and pricing.
  This file only wires the three login buttons and login form.
*/
(function(){
  function setup(){
    try{
      if(!/retailer\.html$/i.test(location.pathname)) return;

      document.querySelectorAll('.login-mode-card[data-mode]').forEach(card=>{
        card.onclick = function(){
          const mode = this.dataset.mode;
          if(typeof window.setLoginMode === 'function') window.setLoginMode(mode);
          const input = document.getElementById('username');
          if(input) input.placeholder = mode === 'super' ? 'SUP-XXXXXX' : mode === 'pro' ? 'PRO-XXXXXX' : 'RET-XXXXXX';
        };
      });

      const form = document.getElementById('loginForm');
      if(form){
        form.onsubmit = function(e){
          e.preventDefault();
          if(typeof window.login === 'function') window.login();
          return false;
        };
      }
    }catch(e){
      console.warn('Retailer login setup:', e);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      setup();
      setTimeout(setup,100);
    });
  }else{
    setup();
    setTimeout(setup,100);
  }
})();
