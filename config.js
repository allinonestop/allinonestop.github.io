window.ALLINONESTOP_CONFIG = {
  SUPABASE_URL: "https://dixsmucrgnyuvudhymdj.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_Z5T2Fbbr0RPMZds67p7-9Q_Yw2-jMVn"
};

/*
  Retailer login support.
  retailer.html owns login, service filtering and pricing.
  This file only wires the three login buttons and login form,
  plus forgot/change password features.
*/
(function(){
  function idToEmail(id){
    return String(id||"").trim().toLowerCase()+"@dixsmucrgnyuvudhymdj.supabase.co";
  }

  async function forgotPassword(){
    const id=prompt("Apna Retailer ID enter karein:\nRET-XXXXXX / SUP-XXXXXX / PRO-XXXXXX");
    if(!id) return;
    try{
      const clean=String(id).trim().toUpperCase();
      const sb=window.__allInOneSb;
      if(!sb) throw new Error("Login system ready nahi hai. Page refresh karein.");
      const {error}=await sb.auth.resetPasswordForEmail(idToEmail(clean),{redirectTo:window.location.origin+window.location.pathname});
      if(error) throw error;
      alert("Password reset link registered email par bhej diya gaya hai. Inbox/Spam check karein.");
    }catch(e){
      console.error("Forgot password:",e);
      alert(e.message||"Password reset email send nahi hua.");
    }
  }

  async function changePassword(){
    try{
      const sb=window.__allInOneSb;
      if(!sb) throw new Error("Login system ready nahi hai. Page refresh karein.");
      const {data}=await sb.auth.getSession();
      if(!data?.session) throw new Error("Please login first.");
      const p1=prompt("New password enter karein (minimum 8 characters):");
      if(p1===null) return;
      if(String(p1).length<8){alert("Password minimum 8 characters hona chahiye.");return;}
      const p2=prompt("New password dobara enter karein:");
      if(p2===null) return;
      if(String(p1)!==String(p2)){alert("Passwords match nahi karte.");return;}
      const {error}=await sb.auth.updateUser({password:String(p1)});
      if(error) throw error;
      alert("Password successfully change ho gaya.");
    }catch(e){
      console.error("Change password:",e);
      alert(e.message||"Password change failed.");
    }
  }

  function setup(){
    try{
      if(!/retailer\.html$/i.test(location.pathname)) return;
      if(!window.__allInOneSb){setTimeout(setup,250);return;}

      document.querySelectorAll('.login-mode-card[data-mode]').forEach(card=>{
        card.onclick=function(){
          const mode=this.dataset.mode;
          if(typeof window.setLoginMode==='function') window.setLoginMode(mode);
          const input=document.getElementById('username');
          if(input) input.placeholder=mode==='super'?'SUP-XXXXXX':mode==='pro'?'PRO-XXXXXX':'RET-XXXXXX';
        };
      });

      const form=document.getElementById('loginForm');
      if(form){
        form.onsubmit=function(e){
          e.preventDefault();
          if(typeof window.login==='function') window.login();
          return false;
        };
      }

      if(form && !document.getElementById('forgotPasswordBtn')){
        const row=document.createElement('div');
        row.id='retailerAuthLinks';row.style.cssText='margin-top:12px;text-align:center';
        row.innerHTML='<button type="button" id="forgotPasswordBtn" style="background:none;border:0;color:#2563eb;padding:4px 0;font-weight:800;cursor:pointer;box-shadow:none">Forgot Password?</button><div style="font-size:11px;color:#64748b;margin-top:3px">Reset link registered email par bheja jayega.</div>';
        form.insertAdjacentElement('afterend',row);
        document.getElementById('forgotPasswordBtn').onclick=forgotPassword;
      }

      const header=document.querySelector('.profileHeader');
      if(header && !document.getElementById('changePasswordBtn')){
        const btn=document.createElement('button');
        btn.type='button';btn.id='changePasswordBtn';btn.className='secondary';btn.textContent='🔑 Change Password';btn.onclick=changePassword;
        const edit=document.getElementById('editProfileBtn');
        if(edit) edit.insertAdjacentElement('afterend',btn); else header.appendChild(btn);
      }
    }catch(e){console.warn('Retailer auth setup:',e)}
  }

  function bindSb(){
    if(window.__allInOneSb) return true;
    if(window.ALLINONESTOP_CONFIG && window.supabase){
      window.__allInOneSb=window.supabase.createClient(window.ALLINONESTOP_CONFIG.SUPABASE_URL,window.ALLINONESTOP_CONFIG.SUPABASE_PUBLISHABLE_KEY);
      return true;
    }
    return false;
  }

  const boot=()=>{bindSb();setup();setTimeout(()=>{bindSb();setup()},250);setTimeout(()=>{bindSb();setup()},1000)};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
