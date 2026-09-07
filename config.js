window.ALLINONESTOP_CONFIG = {
  SUPABASE_URL: "https://dixsmucrgnyuvudhymdj.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_Z5T2Fbbr0RPMZds67p7-9Q_Yw2-jMVn"
};

(function(){
  let authClient=null;
  function getClient(){
    if(authClient)return authClient;
    authClient=window.supabase.createClient(window.ALLINONESTOP_CONFIG.SUPABASE_URL,window.ALLINONESTOP_CONFIG.SUPABASE_PUBLISHABLE_KEY);
    window.__allInOneSb=authClient;
    return authClient;
  }

  function showResetBox(){
    if(document.getElementById('resetPasswordBox'))return;
    const card=document.getElementById('loginCard');
    if(!card)return;
    const form=document.getElementById('loginForm');
    const box=document.createElement('div');
    box.id='resetPasswordBox';
    box.style.cssText='margin-top:15px;padding:16px;border:1px solid #c7d2fe;border-radius:14px;background:#eef2ff';
    box.innerHTML='<h3 style="margin:0 0 10px">🔐 Reset Retailer Password</h3><input id="resetPassword1" type="password" placeholder="New password (min 8)"><input id="resetPassword2" type="password" placeholder="Confirm new password"><button type="button" class="primary" id="resetPasswordSubmit" style="width:100%">Save New Password</button><div id="resetPasswordMsg" style="margin-top:8px;font-size:13px"></div>';
    if(form)form.insertAdjacentElement('afterend',box);else card.appendChild(box);
    document.getElementById('resetPasswordSubmit').onclick=async function(){
      const a=document.getElementById('resetPassword1').value,b=document.getElementById('resetPassword2').value,m=document.getElementById('resetPasswordMsg');
      if(a.length<8){m.textContent='Password minimum 8 characters hona chahiye.';return;}
      if(a!==b){m.textContent='Passwords match nahi karte.';return;}
      const btn=document.getElementById('resetPasswordSubmit');btn.disabled=true;
      try{const {error}=await getClient().auth.updateUser({password:a});if(error)throw error;m.textContent='Password successfully changed. Please login again.';await getClient().auth.signOut();setTimeout(()=>{window.location.href=window.location.pathname;},700);}catch(e){m.textContent=e.message||'Password reset failed.';btn.disabled=false;}
    };
  }

  async function forgotPassword(){
    const id=prompt('Apna Retailer ID enter karein:\nRET-XXXXXX / SUP-XXXXXX / PRO-XXXXXX');
    if(!id)return;
    try{
      const clean=String(id).trim().toUpperCase();
      const {data,error}=await getClient().functions.invoke('retailer-forgot-password',{body:{retailer_id:clean}});
      if(error)throw error;
      alert(data?.message||'If the account exists, a password reset email has been sent.');
    }catch(e){console.error('Forgot password:',e);alert('Password reset request process nahi ho paya.');}
  }

  async function changePassword(){
    try{
      const sb=getClient();
      const {data}=await sb.auth.getSession();
      if(!data?.session){alert('Please login first.');return;}
      const p1=prompt('New password enter karein (minimum 8 characters):');if(p1===null)return;
      if(String(p1).length<8){alert('Password minimum 8 characters hona chahiye.');return;}
      const p2=prompt('New password dobara enter karein:');if(p2===null)return;
      if(String(p1)!==String(p2)){alert('Passwords match nahi karte.');return;}
      const {error}=await sb.auth.updateUser({password:String(p1)});if(error)throw error;
      alert('Password successfully change ho gaya.');
    }catch(e){console.error('Change password:',e);alert(e.message||'Password change failed.');}
  }

  function setup(){
    if(!/retailer\.html$/i.test(location.pathname))return;
    const sb=getClient();
    document.querySelectorAll('.login-mode-card[data-mode]').forEach(card=>{
      card.onclick=function(){
        const mode=this.dataset.mode;
        if(typeof window.setLoginMode==='function')window.setLoginMode(mode);
        const input=document.getElementById('username');if(input)input.placeholder=mode==='super'?'SUP-XXXXXX':mode==='pro'?'PRO-XXXXXX':'RET-XXXXXX';
      };
    });
    const form=document.getElementById('loginForm');
    if(form){
      form.onsubmit=function(e){e.preventDefault();if(typeof window.login==='function')window.login();return false;};
      if(!document.getElementById('forgotPasswordBtn')){
        const row=document.createElement('div');row.id='retailerAuthLinks';row.style.cssText='margin-top:12px;text-align:center';
        row.innerHTML='<button type="button" id="forgotPasswordBtn" style="background:none;border:0;color:#2563eb;padding:4px 0;font-weight:800;cursor:pointer;box-shadow:none">Forgot Password?</button><div style="font-size:11px;color:#64748b;margin-top:3px">Reset link registered email par bheja jayega.</div>';
        form.insertAdjacentElement('afterend',row);document.getElementById('forgotPasswordBtn').onclick=forgotPassword;
      }
    }
    const header=document.querySelector('.profileHeader');
    if(header&&!document.getElementById('changePasswordBtn')){
      const btn=document.createElement('button');btn.type='button';btn.id='changePasswordBtn';btn.className='secondary';btn.textContent='🔑 Change Password';btn.onclick=changePassword;
      const edit=document.getElementById('editProfileBtn');if(edit)edit.insertAdjacentElement('afterend',btn);else header.appendChild(btn);
    }
    const recovery=/type=recovery|access_token=/.test(window.location.hash+window.location.search);
    if(recovery)showResetBox();
    sb.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY')showResetBox();if(event==='SIGNED_IN')setTimeout(()=>{const h=document.querySelector('.profileHeader');if(h&&!document.getElementById('changePasswordBtn'))setup();},100);});
  }
  const boot=()=>{try{setup();setTimeout(setup,300);setTimeout(setup,1000);}catch(e){console.warn('Retailer auth setup:',e)}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
