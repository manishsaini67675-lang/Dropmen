



// Firebase configuration: replace these placeholders with your Firebase Web App config.
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
let cloudDb = null;
let cloudStorage = null;
try {
  if (FIREBASE_CONFIG.projectId !== "YOUR_PROJECT_ID") {
    firebase.initializeApp(FIREBASE_CONFIG);
    cloudDb = firebase.firestore();
    cloudStorage = firebase.storage();
  }
} catch(e) { console.log("Firebase not configured", e); }
function cloudEnabled(){ return !!cloudDb; }
async function cloudSaveOrder(order){
  if(!cloudDb) return false;
  try { await cloudDb.collection('orders').add(order); return true; } catch(e){ console.log('Cloud save failed',e); alert('Order save नहीं हुआ। Firebase/Firestore setup और rules check करें।'); return false; }
}
async function cloudSaveProduct(product){
  if(!cloudDb) return false;
  try { await cloudDb.collection('products').add(product); return true; } catch(e){ console.log('Product save failed',e); alert('Product save नहीं हुआ। Firebase/Firestore rules check करें।'); return false; }
}
async function cloudLoadProducts(){
  if(!cloudDb) return [];
  try { const snap=await cloudDb.collection('products').orderBy('createdAt','desc').get(); return snap.docs.map(d=>({id:d.id,...d.data()})); }
  catch(e){ console.log('Product load failed',e); return []; }
}
async function cloudDeleteProduct(id){
  if(!cloudDb || !id) return false;
  try { await cloudDb.collection('products').doc(id).delete(); return true; } catch(e){ console.log('Product delete failed',e); return false; }
}
async function cloudLoadOrders(){
  if(!cloudDb) return null;
  try {
    const snap=await cloudDb.collection('orders').orderBy('createdAt','desc').get();
    return snap.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){ console.log('Cloud load failed',e); return null; }
}
async function cloudUpdateOrder(id,status){
  if(!cloudDb || !id) return;
  try { await cloudDb.collection('orders').doc(id).update({status}); } catch(e){ console.log('Cloud update failed',e); }
}


let q=10;
function isLoggedIn(){return localStorage.getItem('dropmen_logged_in')==='1'}
function openAuth(mode){
 authModal.style.display='flex';
 loginBox.style.display=mode==='login'?'block':'none';
 registerBox.style.display=mode==='register'?'block':'none';
}
function closeAuth(){authModal.style.display='none'}
function registerUser(){
 const n=regName.value.trim(), ph=regPhone.value.replace(/\D/g,''), p=regPassword.value, c=regConfirm.value;
 if(!n){alert('Name डालें।');return}
 if(!/^\d{10}$/.test(ph)){alert('सही 10-digit mobile number डालें।');return}
 if(p.length<6){alert('Password कम से कम 6 characters का रखें।');return}
 if(p!==c){alert('Passwords match नहीं कर रहे।');return}
 localStorage.setItem('dropmen_user',JSON.stringify({name:n,phone:ph,password:p}));
 localStorage.setItem('dropmen_logged_in','1');
 alert('Registration successful!');
 closeAuth();
}
function loginUser(){
 const ph=loginPhone.value.replace(/\D/g,''), p=loginPassword.value;
 const u=JSON.parse(localStorage.getItem('dropmen_user')||'null');
 if(!u || u.phone!==ph){alert('Account नहीं मिला। पहले Register Now करें।');return}
 if(!p){alert('Password डालें।');return}
 if(u.password && u.password!==p){alert('Password गलत है।');return}
 localStorage.setItem('dropmen_logged_in','1');
 closeAuth();
 alert('Login successful!');
}
function openOrder(p){
 if(!isLoggedIn()){openAuth('login');return}
 q=10;title.textContent=p;update();show(1);modal.style.display='flex'
}
function closeOrder(){modal.style.display='none'}
function changeQty(n){q=Math.max(10,q+n);update()}
function update(){qty.textContent=q;total.textContent=q*70;payTotal.textContent=q*70}
function show(n){document.querySelectorAll('.step').forEach(x=>x.classList.remove('active'));document.getElementById('step'+n).classList.add('active')}
function getOrders(){return JSON.parse(localStorage.getItem('dropmen_orders')||'[]')}
async function saveOrder(order){let a=getOrders();a.unshift(order);localStorage.setItem('dropmen_orders',JSON.stringify(a));localStorage.setItem('dropmen_last_order',JSON.stringify(order));return await cloudSaveOrder(order)}
function statusStep(status){return status==='Order Completed'?3:(status==='Order Confirmed'?2:1)}
function renderOrders(){
 const list=document.getElementById('ordersList'), a=getOrders();
 if(!a.length){list.innerHTML='<div class="empty">अभी कोई order नहीं है।<br>Buy Now करके आपका order यहाँ दिखाई देगा।</div>';return}
 list.innerHTML=a.map((o,i)=>{const st=statusStep(o.status),d=new Date(o.createdAt);const dt=isNaN(d)?'':d.toLocaleString('en-IN');return '<div class="order-card"><div style="display:flex;justify-content:space-between;gap:8px"><b>'+o.product+'</b><span class="status-pill">'+o.status+'</span></div><div class="small" style="margin-top:6px">Order #'+(a.length-i)+' · '+dt+'</div><p style="margin:8px 0"><b>Qty:</b> '+o.quantity+' &nbsp; <b>Total:</b> ₹'+o.total+'</p><div class="status-track"><span class="done"></span><span class="'+(st>=2?'done':'')+'"></span><span class="'+(st>=3?'done':'')+'"></span></div><div class="small">Payment Pending → Order Confirmed → Order Completed</div></div>'}).join('')
}
function openOrders(){if(!isLoggedIn()){openAuth('login');return}renderOrders();ordersModal.style.display='flex'}
function closeOrders(){ordersModal.style.display='none'}
function showAdminTab(tab){
 document.getElementById('adminOrdersSection').style.display=tab==='orders'?'block':'none';
 document.getElementById('adminProductsSection').style.display=tab==='products'?'block':'none';
 if(tab==='products') renderAdminProducts();
}
function resizeImage(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const max=700,scale=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*scale);c.height=Math.round(im.height*scale);c.getContext('2d').drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',0.72));};im.onerror=reject;im.src=r.result;};r.onerror=reject;r.readAsDataURL(file);});}
async function addProduct(){
 const name=document.getElementById('productName').value.trim(), price=Number(document.getElementById('productPrice').value), offer=Number(document.getElementById('productOffer').value)||0, file=document.getElementById('productImage').files[0];
 if(!name || !price || !file){alert('Product name, price और image जरूरी हैं।');return}
 if(!cloudDb){alert('पहले Firebase config भरें, तभी product सभी customers को online दिखेगा।');return}
 try{const image=await resizeImage(file); if(image.length>900000){alert('Image छोटी करें और फिर कोशिश करें।');return} const ok=await cloudSaveProduct({name,price,offer,image,createdAt:new Date().toISOString()}); if(ok){document.getElementById('productName').value='';document.getElementById('productPrice').value='';document.getElementById('productOffer').value='';document.getElementById('productImage').value='';document.getElementById('productPreview').style.display='none';await renderAdminProducts();await renderCloudProducts();alert('Product successfully added.');}}catch(e){console.log(e);alert('Image process नहीं हो सकी।')}
}
async function renderAdminProducts(){const list=document.getElementById('adminProductsList');if(!cloudDb){list.innerHTML='<div class="empty">Firebase configured नहीं है।</div>';return}const a=await cloudLoadProducts();if(!a.length){list.innerHTML='<div class="empty">अभी कोई online product नहीं है।</div>';return}list.innerHTML=a.map(o=>'<div class="order-card"><img src="'+o.image+'" style="width:100%;height:160px;object-fit:cover;border-radius:10px"><b>'+o.name+'</b><div>₹'+o.price+(o.offer?' · Offer ₹'+o.offer:'')+'</div><button onclick="removeProduct(\''+o.id+'\')" style="background:#ffecec;margin-top:8px">Delete</button></div>').join('')}
async function removeProduct(id){if(!confirm('यह product delete करना है?'))return;if(await cloudDeleteProduct(id)){await renderAdminProducts();await renderCloudProducts();}}
async function renderCloudProducts(){const wrap=document.getElementById('productGrid');if(!wrap)return;const a=await cloudLoadProducts();if(!a.length)return;const html=a.map(o=>'<div class="card"><img src="'+o.image+'" alt="'+o.name.replace(/"/g,'&quot;')+'"><div class="body"><div class="name">'+o.name+'</div><div class="price">₹'+o.price+(o.offer?' <span class="old">₹'+o.offer+'</span>':'')+'</div><div class="offer">Buy Now — ₹70 Only</div><button class="buy" onclick="openOrder(\''+o.name.replace(/'/g,"\\'")+'\')">Buy Now</button></div></div>').join('');wrap.insertAdjacentHTML('beforeend',html)}
function openAdmin(){adminLoginModal.style.display='flex';adminPassword.value=''}
function closeAdminLogin(){adminLoginModal.style.display='none'}
function adminLogin(){const p=adminPassword.value;if(p!=='Dropmen@123'){alert('Admin password गलत है।');return}closeAdminLogin();renderAdminOrders();adminModal.style.display='flex'}
function closeAdmin(){adminModal.style.display='none'}
async function setOrderStatus(index,status){const a=getOrders();if(!a[index])return;a[index].status=status;if(a[index].id) await cloudUpdateOrder(a[index].id,status);localStorage.setItem('dropmen_orders',JSON.stringify(a));localStorage.setItem('dropmen_last_order',JSON.stringify(a[0]||{}));renderAdminOrders();renderOrders();alert('Order status updated: '+status)}
function deleteOrder(index){if(!confirm('यह order delete करना है?'))return;const a=getOrders();a.splice(index,1);localStorage.setItem('dropmen_orders',JSON.stringify(a));renderAdminOrders();renderOrders()}
async function refreshCloudOrders(){const cloud=await cloudLoadOrders();if(cloud!==null){localStorage.setItem('dropmen_orders',JSON.stringify(cloud));if(cloud[0])localStorage.setItem('dropmen_last_order',JSON.stringify(cloud[0]));}return cloud;}
async function renderAdminOrders(){const cloud=await refreshCloudOrders();const list=document.getElementById('adminList');if(!cloudDb){list.innerHTML='<div class=\"empty\">Firebase configured नहीं है। Orders सभी phones के बीच sync नहीं होंगे। FIREBASE_CONFIG में अपनी Firebase Web App details भरें।</div>';return}const a=getOrders();if(!a.length){list.innerHTML='<div class="empty">अभी कोई order नहीं है।</div>';return}list.innerHTML=a.map((o,i)=>{const d=new Date(o.createdAt),dt=isNaN(d)?'':d.toLocaleString('en-IN');return '<div class="order-card"><div style="display:flex;justify-content:space-between;gap:8px"><b>'+o.product+'</b><span class="status-pill">'+o.status+'</span></div><div class="small" style="margin-top:6px">Order #'+(a.length-i)+' · '+dt+'</div><p style="margin:8px 0"><b>Name:</b> '+(o.name||'-')+'<br><b>Mobile:</b> '+(o.phone||'-')+'<br><b>Gmail:</b> '+(o.gmail||'-')+'<br><b>UTR:</b> '+(o.utr||'-')+'<br><b>Qty:</b> '+o.quantity+' · <b>Total:</b> ₹'+o.total+'</p><button onclick="setOrderStatus('+i+',\'Order Confirmed\')" style="background:#eaf8ef;margin:3px">✅ Confirmed</button><button onclick="setOrderStatus('+i+',\'Order Completed\')" style="background:#e8f0ff;margin:3px">📦 Completed</button><button onclick="setOrderStatus('+i+',\'Payment Pending\')" style="background:#fff8df;margin:3px">⏳ Pending</button><button onclick="setOrderStatus('+i+',\'Payment Rejected\')" style="background:#ffecec;margin:3px">❌ Rejected</button><button onclick="deleteOrder('+i+')" style="background:#eee;margin:3px">Delete</button></div>'}).join('')}
function refreshAccount(){
 const u=JSON.parse(localStorage.getItem('dropmen_user')||'null');
 accountBar.innerHTML=u&&isLoggedIn()?('Logged in as <b>'+u.phone+'</b> · <a href="#" onclick="logout();return false">Logout</a>'):'Login required before ordering.';
}
function logout(){localStorage.removeItem('dropmen_logged_in');refreshAccount();alert('Logged out.')}
refreshAccount();
renderCloudProducts();
const productImageEl=document.getElementById('productImage'); if(productImageEl) productImageEl.addEventListener('change',async()=>{const f=productImageEl.files[0];if(!f)return;try{const src=await resizeImage(f);const im=document.getElementById('productPreview');im.src=src;im.style.display='block';}catch(e){}});
function submitUtr(){let u=utr.value.trim();if(!/^[A-Za-z0-9]{8,22}$/.test(u)){alert('सही UTR / Transaction ID डालें।');return}localStorage.setItem('dropmen_last_utr',u);show(4)}
async function submitOrder(){let e=email.value.trim(), u=JSON.parse(localStorage.getItem('dropmen_user')||'null');if(!/^[^\s@]+@gmail\.com$/i.test(e)){alert('सही Gmail ID डालें। उदाहरण: name@gmail.com');return}let order={name:u?.name||'',phone:u?.phone||'',gmail:e,utr:localStorage.getItem('dropmen_last_utr')||'',product:title.textContent,quantity:q,total:q*70,status:'Payment Pending',createdAt:new Date().toISOString()};if(!cloudDb){alert('Order place करने से पहले Firebase config पूरा करना जरूरी है, ताकि order Admin में आए।');return} await saveOrder(order);orderSummary.innerHTML='<b>'+order.product+'</b><br>Customer: '+order.name+'<br>Mobile: '+order.phone+'<br>Gmail: '+order.gmail+'<br>UTR: '+order.utr+'<br>Quantity: '+order.quantity+'<br>Total: ₹'+order.total+'<br><br><span class="status-pill">'+order.status+'</span><br><br>आपका order ऊपर <b>My Orders</b> में भी दिखाई देगा।';show(5)}
