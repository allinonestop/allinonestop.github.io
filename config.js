window.ALLINONESTOP_CONFIG = {
  SUPABASE_URL: "https://dixsmucrgnyuvudhymdj.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_Z5T2Fbbr0RPMZds67p7-9Q_Yw2-jMVn"
};

/*
  Retailer login support.
  retailer.html owns login, service filtering and pricing.
  This file wires the three login buttons, login form,
  forgot password and change password features.
*/
(function(){
  function setup(){
    try{
      if(!/retailer\.html$/i.test(location.pathname)) return;
      if(!window.__allInOneSb){
        window.__allInOneSb=window.supabase.createClient(window.ALLINONESTOP_CONFIG.SUPABASE_URL,window.ALLINONESTOP_CONFIG.SUPABASE_PUBLISHABLE_KEY);
      }
      const sb=window.__allInOneSb;
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
        form.onsubmit=function(e){e.preventDefault();if(typeof window.login==='function') window.login();return false;};
        if(!document.getElementById('forgotPasswordBtn')){
          const row=document.createElement('div');
          row.id='retailerAuthLinks';row.style.cssText='margin-top:12px;text-align:center';
          row.innerHTML='<button type="button" id="forgotPasswordBtn" style="background:none;border:0;color:#2563eb;padding:4px 0;font-weight:800;cursor:pointer;box-shadow:none">Forgot Password?</button><div style="font-size:11px;color:#64748b;margin-top:3px">Reset link registered email par bheja jayega.</div>';
          form.insertAdjacentElement('afterend',row);
          document.getElementById('forgotPasswordBtn').onclick=async function(){
            const id=prompt('Apna Retailer ID enter karein:\nRET-XXXXXX / SUP-XXXXXX / PRO-XXXXXX');
            if(!id)return;
            try{
              const clean=String(id).trim().toUpperCase();
              const {data,error}=await sb.functions.invoke('retailer-forgot-password',{body:{retailer_id:clean}});
              if(error)throw error;
              alert(data?.message||'If the account exists, a password reset email has been sent.');
            }catch(e){console.error('Forgot password:',e);alert('Password reset request process nahi ho paya.');}
          };
        }
      }
      const header=document.querySelector('.profileHeader');
      if(header && !document.getElementById('changePasswordBtn')){
        const btn=document.createElement('button');
        btn.type='button';btn.id='changePasswordBtn';btn.className='secondary';btn.textContent='🔑 Change Password';btn.onclick=async function(){
          const {data}=await sb.auth.getSession();
          if(!data?.session){alert('Please login first.');return;}
          const p1=prompt('New password enter karein (minimum 8 characters):');
          if(p1===null)return;
          if(String(p1).length<8){alert('Password minimum 8 characters hona chahiye.');return;}
          const p2=prompt('New password dobara enter karein:');
          if(p2===null)return;
          if(String(p1)!==String(p2)){alert('Passwords match nahi karte.');return;}
          try{const {error}=await sb.auth.updateUser({password:String(p1)});if(error)throw error;alert('Password successfully change ho gaya.');}catch(e){console.error(e);alert(e.message||'Password change failed.');}
        };
        const edit=document.getElementById('editProfileBtn');
        if(edit)edit.insertAdjacentElement('afterend',btn);else header.appendChild(btn);
      }
    }catch(e){console.warn('Retailer auth setup:',e)}
  }
  const boot=()=>{setup();setTimeout(setup,300);setTimeout(setup,1000)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
