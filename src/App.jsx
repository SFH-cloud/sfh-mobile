import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════
const USER_DB = [
  {id:"u2", name:"Frantisek Kabilka",        role:"management", pin:"38516", nfc:"NFC-MGT-002"},
  {id:"u3", name:"Camila Dalcin",            role:"management", pin:"92047", nfc:"NFC-MGT-003"},
  {id:"u4", name:"Munish Soni",              role:"reception",  pin:"61385", nfc:"NFC-REC-001"},
  {id:"u5", name:"Ramneek Kaur",             role:"reception",  pin:"29734", nfc:"NFC-REC-002"},
  {id:"u6", name:"Sajin Abraham",            role:"reception",  pin:"85162", nfc:"NFC-REC-003"},
  {id:"u7", name:"Simbarashe Manyati",       role:"porter",     pin:"43809", nfc:"NFC-PRT-001"},
  {id:"u8", name:"Cristiano Melo",           role:"porter",     pin:"17653", nfc:"NFC-PRT-002"},
  {id:"u9", name:"Joanna Rejak",             role:"cleaner",    pin:"56420", nfc:"NFC-CLN-001"},
  {id:"u10",name:"Hilario Ximenes",          role:"cleaner",    pin:"30978", nfc:"NFC-CLN-002"},
  {id:"u11",name:"Antonio Felisbino",        role:"cleaner",    pin:"84215", nfc:"NFC-CLN-003"},
  {id:"u12",name:"Danielli Sanches Magrini", role:"cleaner",    pin:"67043", nfc:"NFC-CLN-004"},
  {id:"u13",name:"Leandro Morilla",          role:"cleaner",    pin:"19862", nfc:"NFC-CLN-005"},
  {id:"u14",name:"Khrystyna Kolodii",        role:"cleaner",    pin:"52307", nfc:"NFC-CLN-006"},
  {id:"u15",name:"Amandeep Singh",           role:"cleaner",    pin:"73614", nfc:"NFC-CLN-007"},
];

const NFC_LOCATION_TAGS = {
  "NFC-LOC-WRK":"Workshop","NFC-LOC-FLW":"Flowers","NFC-LOC-SHM":"Soho Home",
  "NFC-LOC-GYM":"Gym","NFC-LOC-SAU":"Sauna & Steam Room","NFC-LOC-BOT":"Boathouse",
  "NFC-LOC-PEN":"Pen Yen","NFC-LOC-HAY":"Hay Barn","NFC-LOC-BAR":"Barwell",
  "NFC-LOC-CAN":"Canteen","NFC-LOC-MBN":"Main Barn","NFC-LOC-MIL":"Mill + Toilets",
  "NFC-LOC-GLS":"Glasshouse","NFC-LOC-CIN":"Cinema","NFC-LOC-CAO":"Canteen Office",
  "NFC-LOC-CHK":"Check-out House","NFC-LOC-GAT":"Gate House",
  "NFC-LOC-CLB":"Club Reception + Office","NFC-LOC-BRJ":"Berenjak","NFC-LOC-BLK":"Blake's",
};
const LOCATIONS = Object.values(NFC_LOCATION_TAGS).sort((a,b)=>a.localeCompare(b));

const PORTER_TEMPLATES = {
  "Float Check":["Is the Float charged?","Is the float clean?","Brakes & Handbrake","Mirrors","Tires","Lights","Step Function","Check For Damage","Photo uploaded"],
  "Gatehouse Duties":["Refill Log Baskets","Clean Fireplace (GH + CO)","Check Stables","Refill Water Stations","Are there Cars to be parked?","Are there any scheduled pickups?","Clear excessive bikes"],
  "Club Reception / Main Area":["Sweeping stones","Clear area of obstacles","Clear litter / Glasses","Check bike Racks","Sweep Club entry way","Refill Water Stations"],
  "Car Park Duties":["Litter Pick","Check bins not overflowing","Clearing Bikes to Club racks","Sweep stones back into bays","Check Car Wash area","Sweep Murray's Path"],
  "Bikes":["Collect Bike Truck", "Complete Truck Safety Checks", "Collect Bikes from Around Site", "Quick Visual Safety Check of Bikes", "Replenish Bikes at Location", "Clean & Sanitise Bike Truck", "Return Truck to Warehouse & Connect to Charging", "Log Any Repairs on Bulb Things & Place by Bike Shed"],
  "End of Shift":["Take Newspapers to Room Service","Floats back on charge","Ensure floats clean","New Damage Checks","Hand Over to Early Shift","Photo uploaded"],
};
const CONSUMABLES = [
  {id:"c2", name:"Multi-surface Spray",    icon:"🫧"},
  {id:"c3", name:"Bleach Spray",           icon:"🫧"},
  {id:"c4", name:"Window Cleaner Spray",   icon:"🫧"},
  {id:"c5", name:"Disinfectant Spray",     icon:"🧼"},
  {id:"c6", name:"Floor Cleaner",          icon:"🪣"},
  {id:"c7", name:"Toilet Descaler",        icon:"🚽"},
  {id:"c8", name:"Bin Bags",               icon:"🗑️"},
  {id:"c9", name:"Gloves",                 icon:"🧤"},
  {id:"c10",name:"Vacuum Cleaner Bags",    icon:"🌀"},
  {id:"c11",name:"Mop Heads",              icon:"🧹"},
  {id:"c12",name:"Micro-cloths",           icon:"🧽"},
  {id:"c13",name:"Hard Brush Head",        icon:"🪥"},
];

// ═══════════════════════════════════════════════════════════
// STORAGE — shared keys with admin
// ═══════════════════════════════════════════════════════════
const SK = {
  tasks:      "sh5_tasks",
  repairs:    "sh5_repairs",
  orders:     "sh5_orders",
  inspections:"sh5_inspections",
  cu:         "sh5_cu",
  locPrefix:  "sh5_loc:",
  profiles:   "sh5_profiles",
  checkouts:  "sh5_checkouts",
  pins:       "sh5_pins",
};


// ═══════════════════════════════════════════════════════════
// SUPABASE CONFIG — fill in your values from supabase.com
// ═══════════════════════════════════════════════════════════
const SUPABASE_URL = "https://kqfhbccydaltebpnfqzv.supabase.co";   // e.g. https://abcdef.supabase.co
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZmhiY2N5ZGFsdGVicG5mcXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MzAyOTIsImV4cCI6MjA5MzUwNjI5Mn0.uY4dwnTFqs1F43SMc9JChEta5PfQu4202LZ5owQ6Prc";       // long eyJ... token

const _h = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

const stor = {
  get: async (k) => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/sfh_data?key=eq.${encodeURIComponent(k)}&select=value`,
        { headers: _h }
      );
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return null;
      return data[0].value;
    } catch { return null; }
  },
  set: async (k, v) => {
    if (v === null || v === undefined) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/sfh_data`, {
        method: 'POST',
        headers: { ..._h, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ key: k, value: v }),
      });
    } catch {}
  },
  del: async (k) => {
    try {
      await fetch(
        `${SUPABASE_URL}/rest/v1/sfh_data?key=eq.${encodeURIComponent(k)}`,
        { method: 'DELETE', headers: _h }
      );
    } catch {}
  },
};


// ═══════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════
const TH = {
  management:{bg:"#09090f",card:"#111120",border:"#22223a",accent:"#d4a843",text:"#f5efe0",sub:"#7a7060",primary:"#0c0c18"},
  reception: {bg:"#060e18",card:"#0b1826",border:"#162a40",accent:"#38bdf8",text:"#dff2ff",sub:"#4d7fa0",primary:"#080f1e"},
  porter:    {bg:"#0e0900",card:"#191200",border:"#2e2200",accent:"#fb923c",text:"#fff4e0",sub:"#8a6a40",primary:"#120d00"},
  cleaner:   {bg:"#020d06",card:"#061209",border:"#0d2014",accent:"#4ade80",text:"#e0ffe8",sub:"#3a7a54",primary:"#040e07"},
};
const RC={management:"#d4a843",reception:"#38bdf8",porter:"#fb923c",cleaner:"#4ade80"};
const PC={urgent:"#ef4444",high:"#f97316",medium:"#eab308",low:"#6b7280"};
const SC={pending:"#6b7280",in_progress:"#3b82f6",done:"#22c55e"};
const RL={management:"Management",reception:"Reception",porter:"Porter",cleaner:"Cleaner"};

const uid=()=>"_"+Date.now()+Math.random().toString(36).slice(2,5);
const tod=()=>new Date().toISOString().slice(0,10);
const tf=()=>new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
const df=d=>d?new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"}):"—";

// ═══════════════════════════════════════════════════════════
// BASE UI
// ═══════════════════════════════════════════════════════════
const Ic=({d,s=20,c="currentColor",fill="none",sw=1.8})=>
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d={d}/></svg>;

const P={
  home:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  tasks:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  ok:"M5 13l4 4L19 7",
  plus:"M12 4v16m8-8H4",
  user:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  back:"M15 19l-7-7 7-7",
  cam:"M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8",
  nfc:"M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0",
  tool:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0",
  logout:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  cart:"M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  flip:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  x:"M6 18L18 6M6 6l12 12",
  warn:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
};

const Chip=({label,color,sm})=>
  <span style={{display:"inline-flex",alignItems:"center",padding:sm?"2px 7px":"3px 11px",borderRadius:20,fontSize:sm?9:11,fontWeight:700,letterSpacing:.6,background:`${color}20`,color,border:`1px solid ${color}45`,textTransform:"uppercase",whiteSpace:"nowrap"}}>{label}</span>;

const Av=({name,size=34,color="#d4a843"})=>
  <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,background:`${color}25`,border:`2px solid ${color}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.3,fontWeight:900,color,fontFamily:"Georgia,serif"}}>{name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>;

const Inp=({value,onChange,placeholder,type="text",style={}})=>
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{width:"100%",boxSizing:"border-box",background:"#ffffff09",border:"1px solid #ffffff18",borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",...style}}/>;

const TA=({value,onChange,placeholder,rows=3})=>
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{width:"100%",boxSizing:"border-box",background:"#ffffff09",border:"1px solid #ffffff18",borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:13,resize:"none",fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>;

const Sel=({value,onChange,children})=>
  <select value={value} onChange={onChange} style={{width:"100%",boxSizing:"border-box",background:"#ffffff09",border:"1px solid #ffffff18",borderRadius:10,padding:"11px 14px",color:"#ccc",fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none"}}>{children}</select>;

const Lbl=({children})=>
  <div style={{fontSize:10,color:"#666",textTransform:"uppercase",letterSpacing:1.2,marginBottom:6,fontWeight:700}}>{children}</div>;

const CC=({children,t,style={},onClick})=>
  <div onClick={onClick} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:"14px 16px",cursor:onClick?"pointer":"default",...style}}>{children}</div>;

function Modal({title,t,onClose,children,noClose=false}){
  return(
    <div style={{position:"fixed",inset:0,background:"#00000095",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}
      onClick={e=>!noClose&&e.target===e.currentTarget&&onClose()}>
      <div style={{background:t.primary||"#0b0b14",border:`1px solid ${t.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"94vh",overflowY:"auto",paddingBottom:8}}>
        <div style={{width:40,height:4,background:"#333",borderRadius:4,margin:"10px auto 0"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px"}}>
          <div style={{fontSize:17,fontWeight:800,color:"#fff",fontFamily:"'DM Serif Display',serif"}}>{title}</div>
          {!noClose&&<button onClick={onClose} style={{background:"transparent",border:"none",color:"#555",cursor:"pointer",fontSize:22}}>✕</button>}
        </div>
        <div style={{padding:"0 20px 36px"}}>{children}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LIVE CAMERA — uses getUserMedia (real camera, no album)
// ═══════════════════════════════════════════════════════════
function LiveCamera({t,onCapture,onClose,title="Take Photo"}){
  const videoRef=useRef(null);
  const canvasRef=useRef(null);
  const streamRef=useRef(null);
  const [ready,setReady]=useState(false);
  const [captured,setCaptured]=useState(null);
  const [facing,setFacing]=useState("environment"); // back camera
  const [err,setErr]=useState("");

  const startCamera=useCallback(async(facingMode="environment")=>{
    try{
      if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop());
      const stream=await navigator.mediaDevices.getUserMedia({
        video:{facingMode,width:{ideal:1280},height:{ideal:720}},audio:false
      });
      streamRef.current=stream;
      if(videoRef.current){videoRef.current.srcObject=stream;videoRef.current.play();}
      setReady(true);setErr("");
    }catch(e){
      setErr("Camera not available. Please allow camera access in your browser settings.");
    }
  },[]);

  useEffect(()=>{
    startCamera(facing);
    return()=>{ if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop()); };
  },[]);

  const flip=()=>{
    const next=facing==="environment"?"user":"environment";
    setFacing(next);startCamera(next);setCaptured(null);
  };

  const snap=()=>{
    const video=videoRef.current,canvas=canvasRef.current;
    if(!video||!canvas)return;
    canvas.width=video.videoWidth||640;
    canvas.height=video.videoHeight||480;
    canvas.getContext("2d").drawImage(video,0,0);
    const dataUrl=canvas.toDataURL("image/jpeg",0.85);
    setCaptured(dataUrl);
    if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop());
  };

  const retake=()=>{
    setCaptured(null);startCamera(facing);
  };

  const use=()=>{
    onCapture(captured);onClose();
  };

  return(
    <div style={{position:"fixed",inset:0,background:"#000",zIndex:300,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#000"}}>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:"#fff",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6}}>
          <Ic d={P.back} s={16} c="#fff"/> Cancel
        </button>
        <div style={{fontSize:14,fontWeight:700,color:"#fff",fontFamily:"'DM Sans',sans-serif"}}>{title}</div>
        {!captured&&<button onClick={flip} style={{background:"transparent",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>
          <Ic d={P.flip} s={16} c="#fff"/> Flip
        </button>}
        {captured&&<div style={{width:60}}/>}
      </div>

      {/* Camera / Preview */}
      <div style={{flex:1,position:"relative",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
        {err&&<div style={{color:"#ef4444",fontSize:13,textAlign:"center",padding:24,fontFamily:"'DM Sans',sans-serif"}}>{err}</div>}
        {!err&&!captured&&(
          <video ref={videoRef} autoPlay playsInline muted style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
        )}
        {captured&&(
          <img src={captured} alt="captured" style={{width:"100%",height:"100%",objectFit:"contain"}}/>
        )}
        <canvas ref={canvasRef} style={{display:"none"}}/>
      </div>

      {/* Controls */}
      <div style={{padding:"20px 24px 40px",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",gap:16}}>
        {!captured?(
          <button onClick={snap} disabled={!ready||!!err} style={{width:72,height:72,borderRadius:"50%",background:ready&&!err?"#fff":"#444",border:"4px solid #555",cursor:ready&&!err?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:54,height:54,borderRadius:"50%",background:ready&&!err?"#fff":"#333"}}/>
          </button>
        ):(
          <div style={{display:"flex",gap:12,width:"100%",maxWidth:360}}>
            <button onClick={retake} style={{flex:1,padding:"14px",background:"transparent",border:"2px solid #555",borderRadius:14,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              🔄 Take Again
            </button>
            <button onClick={use} style={{flex:1,padding:"14px",background:t.accent||"#4ade80",border:"none",borderRadius:14,color:"#000",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              ✓ Use Photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CHECKOUT PHOTO — mandatory before leaving location
// ═══════════════════════════════════════════════════════════
function CheckoutPhotoModal({location,user,t,onComplete,onCancel}){
  const [showCam,setShowCam]=useState(false);
  const [photo,setPhoto]=useState(null);
  const [note,setNote]=useState("");

  const handleCapture=dataUrl=>{
    setPhoto(dataUrl);
  };

  const confirm=()=>{
    if(!photo)return;
    onComplete({
      photo,note,location,userId:user.id,userName:user.name,
      time:tf(),date:tod(),id:uid()
    });
  };

  if(showCam) return <LiveCamera t={t} title={`Checkout: ${location}`} onCapture={handleCapture} onClose={()=>setShowCam(false)}/>;

  return(
    <div style={{position:"fixed",inset:0,background:"#000000b0",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:t.primary,border:`1px solid ${t.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,padding:"0 0 36px"}}>
        <div style={{width:40,height:4,background:"#333",borderRadius:4,margin:"10px auto 0"}}/>

        {/* Warning header */}
        <div style={{margin:"14px 20px",background:"#f9731615",border:"1px solid #f9731644",borderRadius:14,padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
          <Ic d={P.warn} s={22} c="#f97316"/>
          <div>
            <div style={{color:"#f97316",fontWeight:800,fontSize:15}}>Photo required before leaving</div>
            <div style={{color:"#f9731488",fontSize:12,marginTop:3}}>Take a live photo of <strong style={{color:"#f97316"}}>{location}</strong> to confirm cleaning is complete. You cannot change location without this.</div>
          </div>
        </div>

        <div style={{padding:"0 20px"}}>
          {/* Photo area */}
          {!photo?(
            <button onClick={()=>setShowCam(true)} style={{width:"100%",height:180,background:t.card,border:`2px dashed ${t.accent}55`,borderRadius:16,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,marginBottom:14}}>
              <Ic d={P.cam} s={36} c={t.accent}/>
              <div style={{color:t.accent,fontWeight:700,fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>Tap to open camera</div>
              <div style={{color:t.sub,fontSize:11}}>Live photo only — no gallery access</div>
            </button>
          ):(
            <div style={{position:"relative",marginBottom:14}}>
              <img src={photo} alt="checkout" style={{width:"100%",height:200,objectFit:"cover",borderRadius:14,display:"block"}}/>
              <button onClick={()=>setPhoto(null)} style={{position:"absolute",top:8,right:8,background:"#000000cc",border:"none",borderRadius:20,padding:"6px 12px",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6}}>
                <Ic d={P.flip} s={12} c="#fff"/> Retake
              </button>
              <div style={{position:"absolute",bottom:8,left:8,background:"#22c55e",borderRadius:8,padding:"3px 10px",fontSize:11,color:"#000",fontWeight:700}}>
                ✓ Photo captured · {tf()}
              </div>
            </div>
          )}

          {/* Optional note */}
          <div style={{marginBottom:14}}>
            <Lbl>Optional note</Lbl>
            <TA value={note} onChange={e=>setNote(e.target.value)} placeholder="Any notes about the cleaned area…" rows={2}/>
          </div>

          {/* Buttons */}
          <div style={{display:"flex",gap:10}}>
            <button onClick={onCancel} style={{flex:1,padding:"12px",background:"transparent",border:`1px solid ${t.border}`,borderRadius:12,color:t.sub,fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              Stay in {location}
            </button>
            <button onClick={confirm} disabled={!photo} style={{flex:2,padding:"12px",background:photo?t.accent:"#333",border:"none",borderRadius:12,color:photo?"#000":"#555",fontWeight:800,fontSize:14,cursor:photo?"pointer":"not-allowed",fontFamily:"'DM Sans',sans-serif"}}>
              {photo?"✓ Confirm & Leave Location":"Take Photo First"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// NFC LOCATION MODAL — check-in (no checkout here)
// ═══════════════════════════════════════════════════════════
function NfcCheckinModal({user,t,onCheckin,onClose}){
  const [tapped,setTapped]   = useState("");
  const [scanning,setScanning] = useState(false);
  const [nfcStatus,setNfcStatus] = useState("idle"); // idle | scanning | success | error | unsupported
  const [errorMsg,setErrorMsg] = useState("");
  const readerRef = useRef(null);

  // ── Android Web NFC ────────────────────────────────────────
  const startNfcScan = async () => {
    if(!("NDEFReader" in window)){
      setNfcStatus("unsupported"); // iPhone — show manual list
      return;
    }
    try {
      setScanning(true);
      setNfcStatus("scanning");
      const reader = new window.NDEFReader();
      readerRef.current = reader;
      await reader.scan();
      reader.onreading = ({message}) => {
        for(const record of message.records){
          if(record.recordType === "url"){
            const decoder = new TextDecoder();
            const url = decoder.decode(record.data);
            // Extract ?nfc=NFC-LOC-XXX from URL
            try {
              const params = new URL(url).searchParams;
              const code = params.get("nfc");
              if(code && NFC_LOCATION_TAGS[code]){
                const locName = NFC_LOCATION_TAGS[code];
                setNfcStatus("success");
                setTapped(locName);
                setTimeout(()=>{ onCheckin(locName); onClose(); }, 600);
                return;
              }
            } catch {}
            // Fallback: try raw code match
            const match = Object.keys(NFC_LOCATION_TAGS).find(k => url.includes(k));
            if(match){
              const locName = NFC_LOCATION_TAGS[match];
              setNfcStatus("success");
              setTapped(locName);
              setTimeout(()=>{ onCheckin(locName); onClose(); }, 600);
              return;
            }
          }
        }
        setErrorMsg("Tag not recognised. Make sure you are tapping the correct tag.");
        setNfcStatus("error");
      };
      reader.onerror = () => {
        setErrorMsg("Could not read NFC tag. Try again.");
        setNfcStatus("error");
        setScanning(false);
      };
    } catch(e) {
      if(e.name === "NotAllowedError"){
        setErrorMsg("NFC permission denied. Please allow NFC access.");
      } else {
        setErrorMsg("NFC not available: " + e.message);
      }
      setNfcStatus("error");
      setScanning(false);
    }
  };

  // Stop scan on unmount
  useEffect(()=>{
    // Auto-start NFC scan on Android, show list on iPhone
    if("NDEFReader" in window){
      startNfcScan();
    } else {
      setNfcStatus("unsupported");
    }
    return ()=>{
      // NDEFReader has no stop() — it stops when component unmounts
    };
  },[]);

  const tap = locName => {
    setTapped(locName);
    setTimeout(()=>{ onCheckin(locName); onClose(); }, 400);
  };

  // ── SCANNING STATE (Android) ──
  if(nfcStatus === "scanning") return(
    <Modal title="Hold Phone to NFC Tag" t={t} onClose={onClose}>
      <div style={{textAlign:"center",padding:"32px 0"}}>
        <div style={{fontSize:72,marginBottom:16,animation:"pulse 1.5s ease-in-out infinite"}}>📡</div>
        <div style={{fontSize:16,fontWeight:700,color:t.text,marginBottom:8}}>Ready to scan</div>
        <div style={{fontSize:13,color:t.sub,lineHeight:1.6}}>
          Hold the back of your phone<br/>against the NFC tag on the wall
        </div>
        <div style={{marginTop:24,padding:"12px 16px",background:`${t.accent}15`,border:`1px solid ${t.accent}33`,borderRadius:12}}>
          <div style={{fontSize:11,color:t.accent}}>📱 Keep your phone still until it vibrates</div>
        </div>
        <button onClick={()=>setNfcStatus("unsupported")} style={{marginTop:20,background:"transparent",border:"none",color:t.sub,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textDecoration:"underline"}}>
          Select location manually instead
        </button>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.08)}}`}</style>
    </Modal>
  );

  // ── SUCCESS STATE ──
  if(nfcStatus === "success") return(
    <Modal title="Location Set" t={t} onClose={onClose}>
      <div style={{textAlign:"center",padding:"32px 0"}}>
        <div style={{fontSize:64,marginBottom:16}}>✅</div>
        <div style={{fontSize:18,fontWeight:800,color:t.accent,fontFamily:"'DM Serif Display',serif"}}>{tapped}</div>
        <div style={{fontSize:13,color:t.sub,marginTop:8}}>Checking you in…</div>
      </div>
    </Modal>
  );

  // ── ERROR STATE ──
  if(nfcStatus === "error") return(
    <Modal title="NFC Error" t={t} onClose={onClose}>
      <div style={{textAlign:"center",padding:"16px 0 8px"}}>
        <div style={{fontSize:48,marginBottom:12}}>⚠️</div>
        <div style={{fontSize:13,color:"#ef4444",marginBottom:20,lineHeight:1.5}}>{errorMsg}</div>
        <button onClick={startNfcScan} style={{padding:"12px 24px",background:t.accent,border:"none",borderRadius:12,color:"#000",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:12}}>
          Try Again
        </button>
        <div><button onClick={()=>setNfcStatus("unsupported")} style={{background:"transparent",border:"none",color:t.sub,fontSize:12,cursor:"pointer",textDecoration:"underline",fontFamily:"'DM Sans',sans-serif"}}>Select manually</button></div>
      </div>
    </Modal>
  );

  // ── MANUAL LIST (iPhone + fallback) ──
  return(
    <Modal title="Select Your Location" t={t} onClose={onClose}>
      <div style={{marginBottom:14}}>
        {"NDEFReader" in window
          ? <div style={{padding:"8px 12px",background:`${t.accent}15`,border:`1px solid ${t.accent}33`,borderRadius:10,fontSize:11,color:t.accent,marginBottom:12,textAlign:"center"}}>
              📡 <button onClick={startNfcScan} style={{background:"transparent",border:"none",color:t.accent,cursor:"pointer",fontSize:11,fontWeight:700,textDecoration:"underline",fontFamily:"'DM Sans',sans-serif"}}>Tap to scan NFC tag</button> or select below
            </div>
          : <div style={{padding:"8px 12px",background:"#ffffff08",border:`1px solid ${t.border}`,borderRadius:10,fontSize:11,color:t.sub,marginBottom:12,textAlign:"center"}}>
              iPhone: tap your NFC tag to auto-confirm, or select below
            </div>
        }
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,maxHeight:360,overflowY:"auto"}}>
        {LOCATIONS.map(locName=>(
          <button key={locName} onClick={()=>tap(locName)} style={{padding:"10px 8px",background:tapped===locName?`${t.accent}25`:t.card,border:`1px solid ${tapped===locName?t.accent:t.border}`,borderRadius:10,cursor:"pointer",color:tapped===locName?t.accent:t.text,fontSize:12,fontWeight:tapped===locName?700:500,fontFamily:"'DM Sans',sans-serif",textAlign:"left",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:14}}>📡</span>{locName}
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
// LOCATION BAR
// ═══════════════════════════════════════════════════════════
function LocationBar({location,t,onCheckin,onCheckout}){
  return(
    <div style={{marginBottom:14}}>
      {!location?(
        <button onClick={onCheckin} style={{width:"100%",display:"flex",alignItems:"center",gap:10,background:"#ffffff08",border:`1px solid ${t.border}`,borderRadius:12,padding:"10px 14px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
          <Ic d={P.nfc} s={17} c={t.sub}/>
          <div style={{flex:1,textAlign:"left"}}>
            <div style={{fontSize:13,fontWeight:700,color:t.sub}}>No location set</div>
            <div style={{fontSize:10,color:"#444",marginTop:1}}>Tap to check in via NFC</div>
          </div>
          <span style={{color:t.sub,fontSize:18}}>›</span>
        </button>
      ):(
        <div style={{background:`${t.accent}18`,border:`1px solid ${t.accent}44`,borderRadius:12,padding:"10px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Ic d={P.nfc} s={17} c={t.accent}/>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:t.accent}}>{location.name}</div>
              <div style={{fontSize:10,color:t.sub,marginTop:1}}>Since {location.time} · tap below to leave</div>
            </div>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e"}}/>
          </div>
          <button onClick={onCheckout} style={{marginTop:10,width:"100%",padding:"8px",background:"#ef444415",border:"1px solid #ef444444",borderRadius:10,color:"#ef4444",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Ic d={P.cam} s={14} c="#ef4444"/> Leave & Take Checkout Photo
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════
function LoginScreen({onLogin,extraProfiles}){
  const [selected,setSelected]=useState(null);
  const [pin,setPin]=useState("");
  const [error,setError]=useState("");
  const [expanded,setExpanded]=useState("cleaner");
  const roles=["management","reception","porter","cleaner"];
  const cols={management:"#d4a843",reception:"#38bdf8",porter:"#fb923c",cleaner:"#4ade80"};

  // Merge USER_DB with extra profiles
  const allUsers=[...USER_DB,...(extraProfiles||[])];

  const pick=u=>{setSelected(u);setPin("");setError("");};
  const handleKey=k=>{
    if(k==="del"){setPin(p=>p.slice(0,-1));setError("");return;}
    if(pin.length>=5)return;
    const next=pin+k;setPin(next);
    if(next.length===5){
      setTimeout(async()=>{
        // Check override PIN from Supabase first, then fall back to default
        const pinsData = await stor.get("sh5_pins");
        const effectivePin = (pinsData && pinsData[selected.id]) || selected.pin;
        if(next===effectivePin)onLogin(selected);
        else{setError("Incorrect PIN. Try again.");setPin("");}
      },120);
    }
  };
  const accent=selected?cols[selected.role]:"#d4a843";

  if(selected)return(
    <div style={{minHeight:"100vh",background:"#050508",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <button onClick={()=>{setSelected(null);setPin("");setError("");}} style={{position:"absolute",top:24,left:20,background:"transparent",border:"none",color:"#555",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6}}>
        <Ic d={P.back} s={14} c="#555"/> Back
      </button>
      <Av name={selected.name} size={72} color={accent}/>
      <div style={{fontSize:20,fontWeight:800,color:"#fff",marginTop:14,fontFamily:"'DM Serif Display',serif"}}>{selected.name}</div>
      <div style={{marginTop:8}}><Chip label={RL[selected.role]} color={accent}/></div>
      <div style={{display:"flex",gap:14,marginTop:32}}>
        {[0,1,2,3,4].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:pin.length>i?accent:"transparent",border:`2px solid ${pin.length>i?accent:"#333"}`,transition:"all .15s"}}/>)}
      </div>
      <div style={{fontSize:11,color:"#555",marginTop:10,letterSpacing:.5}}>Enter 5-digit PIN</div>
      {error&&<div style={{color:"#ef4444",fontSize:12,marginTop:6,fontWeight:600}}>{error}</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:24,width:240}}>
        {["1","2","3","4","5","6","7","8","9","","0","del"].map((k,i)=>(
          <button key={i} onClick={()=>k&&handleKey(k)} style={{height:58,borderRadius:14,background:k==="del"?"transparent":k?`${accent}12`:"transparent",border:k==="del"?`1px solid #333`:k?`1px solid ${accent}30`:"none",color:k==="del"?"#888":k?accent:"transparent",fontSize:k==="del"?20:22,fontWeight:700,cursor:k?"pointer":"default",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {k==="del"?"⌫":k}
          </button>
        ))}
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"#050508",display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 20px 24px",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <div style={{marginBottom:36,textAlign:"center"}}>
        <div style={{fontSize:10,letterSpacing:6,textTransform:"uppercase",color:"#444",marginBottom:8}}>Soho House</div>
        <div style={{fontSize:34,fontFamily:"'DM Serif Display',serif",color:"#fff",lineHeight:1.1}}>Operations</div>
        <div style={{fontSize:34,fontFamily:"'DM Serif Display',serif",color:"#d4a843",lineHeight:1.1,fontStyle:"italic"}}>Platform</div>
        <div style={{width:40,height:2,background:"#d4a843",margin:"12px auto 0"}}/>
      </div>
      <div style={{width:"100%",maxWidth:400,display:"flex",flexDirection:"column",gap:10}}>
        {roles.map(role=>{
          const c=cols[role],ru=allUsers.filter(u=>u.role===role),isOpen=expanded===role;
          return(
            <div key={role} style={{borderRadius:14,overflow:"hidden",border:`1px solid ${isOpen?c+"44":"#1e1e28"}`}}>
              <button onClick={()=>setExpanded(isOpen?null:role)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:isOpen?`${c}15`:"#0d0d14",border:"none",padding:"13px 18px",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:isOpen?c:"#333"}}/>
                  <span style={{color:isOpen?c:"#666",fontWeight:700,fontSize:13,textTransform:"uppercase",letterSpacing:.5,fontFamily:"'DM Sans',sans-serif"}}>{RL[role]}</span>
                  <span style={{color:"#444",fontSize:11}}>({ru.length})</span>
                </div>
                <span style={{color:"#555",transform:isOpen?"rotate(90deg)":"none",transition:"transform .2s",display:"inline-block",fontSize:18}}>›</span>
              </button>
              {isOpen&&<div style={{background:"#07070f",padding:"8px"}}>
                {ru.map(u=>(
                  <button key={u.id} onClick={()=>pick(u)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"transparent",border:"1px solid transparent",borderRadius:10,padding:"10px 12px",marginBottom:4,cursor:"pointer",textAlign:"left"}}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${c}12`;e.currentTarget.style.borderColor=`${c}44`;}}
                    onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="transparent";}}>
                    <Av name={u.name} size={38} color={c}/>
                    <div><div style={{color:"#fff",fontSize:14,fontWeight:600}}>{u.name}</div><div style={{color:"#555",fontSize:10,marginTop:1}}>Enter PIN →</div></div>
                  </button>
                ))}
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TASK CARD & DETAIL (unchanged from before)
// ═══════════════════════════════════════════════════════════
function TaskCard({task,t,onClick}){
  const pc=PC[task.priority]||"#6b7280",sc=SC[task.status]||"#6b7280";
  const em={checklist:"✓",porter:"🚗",repair:"🔧",emergency:"⚡",order:"🛒",inspection:"⭐",general:"📋",reception:"📞"}[task.type]||"📋";
  const prog=task.checklist?.length?Math.round(task.checklist.filter(c=>c.done).length/task.checklist.length*100):null;
  const hasIssue=!!task.inspectionNote;
  return(
    <div onClick={onClick} style={{background:hasIssue?"#1a0808":t.card,border:`1px solid ${hasIssue?"#ef444466":t.border}`,borderRadius:14,padding:"13px 14px",marginBottom:8,cursor:"pointer",position:"relative",overflow:"hidden"}}>
      {/* Left accent bar — red for issues */}
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:hasIssue?5:3,background:hasIssue?"#ef4444":pc,borderRadius:"14px 0 0 14px"}}/>
      {/* Issue banner — full-width red bar */}
      {hasIssue&&(
        <div style={{margin:"0 0 10px -13px",width:"calc(100% + 26px)",background:"#ef4444",padding:"8px 16px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18,flexShrink:0}}>⚠️</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,color:"#fff",fontWeight:900,letterSpacing:.3}}>CORRECTION REQUIRED</div>
            <div style={{fontSize:10,color:"#ffffff99",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Management feedback — tap to view</div>
          </div>
          <div style={{background:"#ffffff22",borderRadius:6,padding:"3px 8px",fontSize:10,color:"#fff",fontWeight:700,flexShrink:0}}>TAP ›</div>
        </div>
      )}
      <div style={{marginLeft:8}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:prog!==null?8:4}}>
          <div style={{width:34,height:34,borderRadius:10,background:hasIssue?"#ef444422":`${pc}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{hasIssue?"⚠️":em}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:hasIssue?"#ef4444":t.text,fontSize:14,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {task.roundId&&task.location ? task.location : task.title}
            </div>
            {task.roundId&&task.location&&<div style={{color:t.sub,fontSize:10,marginTop:1}}>📍 {task.location}</div>}
            {!task.roundId&&<div style={{color:t.sub,fontSize:11,marginTop:2}}>📍 {task.location||"—"}</div>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end",flexShrink:0}}>
            {hasIssue
              ?<span style={{background:"#ef4444",color:"#fff",fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:10,textTransform:"uppercase",letterSpacing:.5}}>Return</span>
              :<Chip label={task.priority} color={pc} sm/>
            }
            <Chip label={task.status==="in_progress"?"In Prog.":task.status} color={hasIssue?"#ef4444":sc} sm/>
          </div>
        </div>
        {prog!==null&&<><div style={{height:3,background:t.border,borderRadius:3,overflow:"hidden",marginBottom:3}}><div style={{height:"100%",width:`${prog}%`,background:hasIssue?"#ef4444":t.accent,borderRadius:3}}/></div><div style={{fontSize:9,color:t.sub,textAlign:"right"}}>{prog}%</div></>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
          {task.recurring&&task.recurring!=="none"&&<span style={{fontSize:9,color:t.sub}}>🔁 {task.recurring}</span>}
          <span style={{fontSize:10,color:t.sub,marginLeft:"auto"}}>{df(task.dueDate)}</span>
        </div>
      </div>
    </div>
  );
}

function TaskDetail({task:init,user,t,onBack,onSave,location,onSetLocation,onClearLocation}){
  const [task,setTask]=useState({...init,checklist:init.checklist||[]});
  const [note,setNote]=useState("");
  // If task has inspectionNote (sent back), require a NEW photo — don't accept old ones
  const hasReturnNote=!!init.inspectionNote;
  const [photos,setPhotos]=useState(hasReturnNote?[]:init.photos||[]);
  // Evidence photos = all photos EXCEPT the start photo
  // Start photo is only for live location tracking, not task evidence
  // Compress all evidence photos to max 600px JPEG 0.7 before saving
  const [showCam,setShowCam]=useState(false);
  const [showStartCam,setShowStartCam]=useState(false);
  const [startLoc,setStartLoc]=useState(location?.name||"");
  const [startPhoto,setStartPhoto]=useState(null);
  // Track if a NEW correction photo was taken (separate from start photo)
  const [correctionPhotoDone,setCorrectionPhotoDone]=useState(false);
  // "started" = user confirmed location + pressed Start Work
  const [started,setStarted]=useState(init.status==="in_progress"||init.status==="done");

  const displayTitle = task.roundId&&task.location ? task.location : task.title;

  const save=upd=>{const u={...task,...upd};setTask(u);onSave(u);};
  // Never auto-set done — photo is required before completing
  const toggleCheck=i=>{
    const cl=task.checklist.map((c,idx)=>idx===i?{...c,done:!c.done}:c);
    save({checklist:cl,status:task.status==="done"?"done":"in_progress"});
  };
  // handleCapture preserves all existing task fields including notes
  const handleCapture=async(dataUrl)=>{
    // Compress before saving — max 600px wide, 70% quality JPEG
    const compressed=await new Promise(res=>{
      const img=new Image();
      img.onload=()=>{
        const s=Math.min(1,600/img.width);
        const c=document.createElement("canvas");
        c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);
        c.getContext("2d").drawImage(img,0,0,c.width,c.height);
        res(c.toDataURL("image/jpeg",0.7));
      };
      img.src=dataUrl;
    });
    const p=[...photos,{id:uid(),dataUrl:compressed,time:tf()}];
    setPhotos(p);
    if(hasReturnNote) setCorrectionPhotoDone(true);
    setTask(prev=>{
      const updated={...prev,photos:p};
      onSave(updated);
      return updated;
    });
  };
  const pc=PC[task.priority]||"#6b7280";
  const done=task.checklist.filter(c=>c.done).length,total=task.checklist.length;
  // Only non-start photos count as evidence
  const evidencePhotos=photos.filter(p=>p.type!=="start");

  const taskLoc = task.location||"";

  const handleStart=async()=>{
    setStarted(true);
    const startPhotos=[{id:uid(),dataUrl:startPhoto,time:tf(),type:"start"},...(hasReturnNote?[]:init.photos||[])];
    setPhotos(startPhotos);
    save({status:"in_progress",startLocation:startLoc,photos:startPhotos});
    // Update location state so dashboard reflects it immediately
    const locObj={name:startLoc,time:tf(),date:tod()};
    if(onSetLocation) onSetLocation(locObj);
    // Push to Supabase as live location (with compressed photo)
    if(user){
      const compressPhoto=async(dataUrl,maxW=480)=>new Promise(resolve=>{
        const img=new Image();
        img.onload=()=>{
          const s=Math.min(1,maxW/img.width);
          const c=document.createElement("canvas");
          c.width=img.width*s;c.height=img.height*s;
          c.getContext("2d").drawImage(img,0,0,c.width,c.height);
          resolve(c.toDataURL("image/jpeg",0.6));
        };
        img.src=dataUrl;
      });
      const thumb=await compressPhoto(startPhoto);
      const locRecord={...locObj,userId:user.id,userName:user.name,role:user.role,
        photo:thumb,taskId:init.id,
        taskTitle:init.roundId&&init.location?init.location:init.title};
      await stor.set(SK.locPrefix+user.id,locRecord);
    }
  };

  if(showStartCam)return <LiveCamera t={t} title="Start Work Photo" onCapture={p=>{setStartPhoto(p);setShowStartCam(false);}} onClose={()=>setShowStartCam(false)}/>;
  if(showCam)return <LiveCamera t={t} title="Task Evidence Photo" onCapture={handleCapture} onClose={()=>setShowCam(false)}/>;

  return(
    <div style={{paddingBottom:90}}>
      <div style={{background:t.primary,padding:"12px 16px 14px",borderBottom:`1px solid ${t.border}`,position:"sticky",top:0,zIndex:10}}>
        <button onClick={onBack} style={{background:"transparent",border:"none",color:t.accent,cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0,marginBottom:10,fontFamily:"'DM Sans',sans-serif",fontSize:13}}>
          <Ic d={P.back} s={16} c={t.accent}/> Back
        </button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:800,color:t.text,fontFamily:"'DM Serif Display',serif",lineHeight:1.2}}>{displayTitle}</div>
            <div style={{color:t.sub,fontSize:12,marginTop:3}}>📍 {task.location}</div>
          </div>
          <Chip label={task.priority} color={pc}/>
        </div>
      </div>

      {/* ── START WORK CONFIRMATION ─────────────────────────────── */}
      {!started&&(
        <div style={{padding:"24px 16px"}}>
          {/* Task summary */}
          <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:16,padding:"20px",marginBottom:20}}>
            <div style={{fontSize:22,marginBottom:8}}>📍</div>
            <div style={{fontSize:20,fontWeight:800,color:t.text,fontFamily:"'DM Serif Display',serif",marginBottom:4}}>{displayTitle}</div>
            <div style={{fontSize:13,color:t.sub,marginBottom:16}}>{task.location}</div>
            {total>0&&<div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:t.sub,marginBottom:6}}>{total} tasks in this location:</div>
              {task.checklist.slice(0,5).map((c,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:`1px solid ${t.border}`}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:t.accent,flexShrink:0}}/>
                  <span style={{fontSize:12,color:t.sub}}>{c.label}</span>
                </div>
              ))}
              {total>5&&<div style={{fontSize:11,color:t.sub,marginTop:6}}>+{total-5} more tasks…</div>}
            </div>}
          </div>

          {/* Step 1 — Select location manually */}
          <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:"16px",marginBottom:12}}>
            <div style={{fontSize:11,color:t.sub,textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:8}}>
              Step 1 — Confirm Location
            </div>
            <select
              value={startLoc}
              onChange={e=>setStartLoc(e.target.value)}
              style={{width:"100%",boxSizing:"border-box",background:"#ffffff09",border:`1px solid ${startLoc?t.accent:t.border}`,borderRadius:10,padding:"11px 14px",color:startLoc?t.text:"#888",fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none"}}>
              <option value="">Select your current location…</option>
              {LOCATIONS.map(l=><option key={l} value={l}>{l}{l===taskLoc?" ✓ (this task)":""}</option>)}
            </select>
            {startLoc&&startLoc!==taskLoc&&(
              <div style={{marginTop:8,fontSize:11,color:"#f97316"}}>
                ⚠️ This task is for <strong>{taskLoc}</strong> — are you sure you are at <strong>{startLoc}</strong>?
              </div>
            )}
            {startLoc===taskLoc&&<div style={{marginTop:6,fontSize:11,color:t.accent}}>✓ Correct location</div>}
          </div>

          {/* Step 2 — Start photo (live camera only) */}
          {startLoc&&(
            <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:"16px",marginBottom:16}}>
              <div style={{fontSize:11,color:t.sub,textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:8}}>
                Step 2 — Take Start Photo
              </div>
              {startPhoto?(
                <div style={{position:"relative",marginBottom:8}}>
                  <img src={startPhoto} alt="start" style={{width:"100%",height:160,objectFit:"cover",borderRadius:10,display:"block"}}/>
                  <div style={{position:"absolute",bottom:8,left:8,background:t.accent,borderRadius:6,padding:"3px 10px",fontSize:11,color:"#000",fontWeight:700}}>✓ {tf()}</div>
                  <button onClick={()=>setStartPhoto(null)} style={{position:"absolute",top:8,right:8,background:"#000000cc",border:"none",borderRadius:20,padding:"4px 10px",color:"#fff",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Retake</button>
                </div>
              ):(
                <button onClick={()=>setShowStartCam(true)} style={{width:"100%",height:120,background:"transparent",border:`2px dashed ${t.accent}66`,borderRadius:10,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
                  <Ic d={P.cam} s={28} c={t.accent}/>
                  <span style={{fontSize:13,color:t.accent,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>📷 Take Start Photo</span>
                  <span style={{fontSize:10,color:t.sub}}>Live camera only — no gallery</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={!startLoc||!startPhoto}
            style={{width:"100%",padding:"16px",background:(!startLoc||!startPhoto)?"#1e1e38":t.accent,border:"none",borderRadius:14,color:(!startLoc||!startPhoto)?"#555":"#000",fontWeight:800,fontSize:16,cursor:(!startLoc||!startPhoto)?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            {!startLoc?"Select location first":!startPhoto?"Take start photo first":"▶ Start Work"}
          </button>
        </div>
      )}

      {/* ── TASK CONTENT (only after started) ─────────────────── */}
      {started&&<div style={{padding:"16px"}}>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {["pending","in_progress","done"].map(s=>{
            const a=task.status===s,c=SC[s];
            const blocked=s==="done"&&(hasReturnNote?!correctionPhotoDone:evidencePhotos.length===0)&&task.status!=="done";
            return(
              <button key={s} onClick={()=>!blocked&&save({status:s})}
                title={blocked?"Take a photo first":""}
                style={{flex:1,padding:"9px 4px",background:a?`${c}22`:"transparent",border:`1px solid ${a?c:blocked?"#333":t.border}`,borderRadius:10,cursor:blocked?"not-allowed":"pointer",color:a?c:blocked?"#333":t.sub,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.4,fontFamily:"'DM Sans',sans-serif",opacity:blocked?0.4:1}}>
                {s==="in_progress"?"In Prog.":s.charAt(0).toUpperCase()+s.slice(1)}
                {blocked&&" 📷"}
              </button>
            );
          })}
        </div>
        {/* Inspection feedback from management — shown prominently */}
        {task.inspectionNote&&(
          <div style={{background:"#f9731615",border:"2px solid #f9731644",borderRadius:14,padding:"14px 16px",marginBottom:12}}>
            <div style={{color:"#f97316",fontWeight:800,fontSize:14,marginBottom:6}}>⚠️ Management Feedback</div>
            <div style={{color:"#f97316",fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{task.inspectionNote}</div>
            <div style={{fontSize:10,color:"#f9731488",marginTop:8}}>Please address these issues and mark as complete when done</div>
          </div>
        )}
        {task.notes&&!task.inspectionNote&&<CC t={t} style={{marginBottom:12}}><div style={{fontSize:10,color:t.sub,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Instructions</div><div style={{color:t.text,fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{task.notes}</div></CC>}
        {task.checklist.length>0&&<CC t={t} style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:t.text}}>Checklist</div>
            <span style={{fontSize:11,color:t.accent,fontWeight:700}}>{done}/{total}</span>
          </div>
          <div style={{height:4,background:t.border,borderRadius:4,marginBottom:12,overflow:"hidden"}}><div style={{height:"100%",width:total?`${done/total*100}%`:"0",background:t.accent,transition:"width .3s",borderRadius:4}}/></div>
          {task.checklist.map((c,i)=>(
            <button key={i} onClick={()=>toggleCheck(i)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,background:"transparent",border:`1px solid ${c.done?t.accent+"33":t.border}`,borderRadius:10,padding:"10px 12px",marginBottom:5,cursor:"pointer",textAlign:"left"}}>
              <div style={{width:22,height:22,borderRadius:7,flexShrink:0,background:c.done?t.accent:"transparent",border:`2px solid ${c.done?t.accent:t.sub}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {c.done&&<Ic d={P.ok} s={12} c="#000" sw={2.5}/>}
              </div>
              <span style={{color:c.done?t.sub:t.text,fontSize:13,textDecoration:c.done?"line-through":"none",flex:1}}>{c.label}</span>
            </button>
          ))}
        </CC>}
        <CC t={t} style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:t.text}}>
              {hasReturnNote?"📷 Correction Photo":"Photo Evidence"} {photos.length>0&&<span style={{color:t.accent}}>({photos.length})</span>}
            </div>
            {evidencePhotos.length===0&&<span style={{fontSize:10,color:"#ef4444",fontWeight:700}}>Required ★</span>}
          </div>
          {hasReturnNote&&!correctionPhotoDone&&(
            <div style={{background:"#f9731615",border:"1px solid #f9731644",borderRadius:10,padding:"10px 12px",marginBottom:10}}>
              <div style={{fontSize:12,color:"#f97316",fontWeight:700,marginBottom:2}}>New photo required to confirm correction</div>
              <div style={{fontSize:11,color:"#f9731488"}}>Previous photos are not accepted — take a new photo showing the issue has been resolved</div>
            </div>
          )}
          {!hasReturnNote&&evidencePhotos.length===0&&(
            <div style={{background:"#ef444412",border:"1px solid #ef444433",borderRadius:10,padding:"10px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
              <Ic d={P.cam} s={16} c="#ef4444"/>
              <span style={{fontSize:12,color:"#ef4444"}}>A photo is required before marking as complete</span>
            </div>
          )}
          {evidencePhotos.length>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
            {evidencePhotos.map(ph=>(
              <div key={ph.id} style={{width:68,height:68,borderRadius:10,overflow:"hidden",position:"relative"}}>
                {ph.dataUrl?<img src={ph.dataUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",background:`${t.accent}15`,border:`1px solid ${t.accent}33`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={P.cam} s={20} c={t.accent}/></div>}
                <div style={{position:"absolute",bottom:0,left:0,right:0,background:"#000000aa",fontSize:7,color:"#fff",padding:"2px 4px",textAlign:"center"}}>{ph.time}</div>
              </div>
            ))}
          </div>}
          <button onClick={()=>setShowCam(true)} style={{width:"100%",padding:"11px",background:photos.length===0?`${t.accent}22`:"transparent",border:`2px dashed ${t.accent}${photos.length===0?"99":"44"}`,borderRadius:10,cursor:"pointer",color:t.accent,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"'DM Sans',sans-serif"}}>
            <Ic d={P.cam} s={16} c={t.accent}/>{photos.length===0?"📷 Take Photo (Required)":"Add Another Photo"}
          </button>
        </CC>
        <CC t={t} style={{marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:t.text,marginBottom:8}}>Add Note</div>
          <TA value={note} onChange={e=>setNote(e.target.value)} placeholder="Leave a note…"/>
          {note.trim()&&<button onClick={()=>{
  const updatedNotes=(task.notes&&!task.notes.includes(note.trim())?task.notes+"\n":"")+note.trim();
  save({notes:updatedNotes,photos,inspectionNote:task.inspectionNote,inspectionHistory:task.inspectionHistory});
  setNote("");
}} style={{marginTop:8,width:"100%",padding:"10px",background:t.accent,border:"none",borderRadius:10,color:"#000",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Save Note</button>}
        </CC>
        {/* Photo required before completing.
            For normal tasks: need at least one photo.
            For return tasks: need a NEW correction photo (correctionPhotoDone). */}
        {(hasReturnNote ? !correctionPhotoDone : evidencePhotos.length===0)&&task.status!=="done"?(
          <button onClick={()=>setShowCam(true)} style={{width:"100%",padding:"15px",background:"#ef444422",border:"2px solid #ef444466",borderRadius:14,color:"#ef4444",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Ic d={P.cam} s={18} c="#ef4444"/>
            {hasReturnNote?"📷 Take Correction Photo First":"Take Photo to Complete"}
          </button>
        ):(
          <button onClick={async()=>{
            if(task.status!=="done"){
              // Clear live location when task is completed
              if(user) await stor.del(SK.locPrefix+user.id);
              if(onClearLocation) onClearLocation();
              // If this was a returned task, archive the inspectionNote into history
              const resubmitEntry = task.inspectionNote ? {
                date: new Date().toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}),
                note: task.inspectionNote,
                by: user.name,
                type: "resolved",
                resolvedNote: note.trim()||"Correction completed",
              } : null;
              const updatedHistory = resubmitEntry
                ? [...(task.inspectionHistory||[]).slice(0,-1), // replace last entry
                   {...(task.inspectionHistory||[]).slice(-1)[0]||{}, resolved:true, resolvedBy:user.name, resolvedAt:new Date().toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}), resolvedNote:note.trim()||"Correction completed"}]
                : task.inspectionHistory;
              save({
                status:"done",
                inspectionNote:null,  // clear the note — issue resolved
                inspectionHistory:updatedHistory||task.inspectionHistory,
                photos,               // save new photos
              });
              setTimeout(()=>onBack(),400);
            }
          }} style={{width:"100%",padding:"15px",background:task.status==="done"?"#22c55e22":t.accent,border:`2px solid ${task.status==="done"?"#22c55e":t.accent}`,borderRadius:14,color:task.status==="done"?"#22c55e":"#000",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Ic d={P.ok} s={18} c={task.status==="done"?"#22c55e":"#000"} sw={2.5}/>
            {task.status==="done"?"✓ Completed":hasReturnNote?"✓ Submit Correction":"Mark as Complete"}
          </button>
        )}
      </div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// REPAIRS / ORDERS / INSPECTIONS (compact)
// ═══════════════════════════════════════════════════════════
function RepairsScreen({user,t,repairs,onAdd}){
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({title:"",location:LOCATIONS[0],description:"",urgency:"medium"});
  const mine=repairs.filter(r=>r.reportedBy===user.id);
  const submit=()=>{if(!form.title.trim())return;onAdd({...form,id:uid(),reportedBy:user.id,status:"open",date:tod()});setForm({title:"",location:LOCATIONS[0],description:"",urgency:"medium"});setShow(false);};
  return(
    <div style={{padding:"16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:18,fontWeight:800,color:t.text,fontFamily:"'DM Serif Display',serif"}}>Repair Reports</div>
        <button onClick={()=>setShow(true)} style={{padding:"8px 14px",background:t.accent,border:"none",borderRadius:10,color:"#000",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>+ Report</button>
      </div>
      {mine.length===0?<div style={{textAlign:"center",padding:"40px 0",color:t.sub}}>No repairs reported yet</div>
      :mine.map(r=><CC key={r.id} t={t} style={{marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div><div style={{fontSize:14,fontWeight:700,color:t.text}}>🔧 {r.title}</div><div style={{fontSize:11,color:t.sub,marginTop:2}}>📍 {r.location} · {df(r.date)}</div></div>
          <Chip label={r.status} color={r.status==="open"?"#f97316":r.status==="in_progress"?"#3b82f6":"#22c55e"} sm/>
        </div>
      </CC>)}
      {show&&<Modal title="Report a Repair" t={t} onClose={()=>setShow(false)}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><Lbl>Issue Title *</Lbl><Inp value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Broken door hinge"/></div>
          <div><Lbl>Location</Lbl><Sel value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}>{LOCATIONS.map(l=><option key={l}>{l}</option>)}</Sel></div>
          <div><Lbl>Urgency</Lbl><Sel value={form.urgency} onChange={e=>setForm(f=>({...f,urgency:e.target.value}))}>{["urgent","high","medium","low"].map(v=><option key={v}>{v}</option>)}</Sel></div>
          <div><Lbl>Description</Lbl><TA value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Describe the issue…"/></div>
          <button onClick={submit} style={{padding:"13px",background:t.accent,border:"none",borderRadius:12,color:"#000",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Submit Report</button>
        </div>
      </Modal>}
    </div>
  );
}

function OrdersScreen({user,t,orders,onAdd,customProducts=[]}){
  const [cart,setCart]=useState({});
  const [loc,setLoc]=useState(LOCATIONS[0]);
  const [done,setDone]=useState(false);
  const allProducts=[...CONSUMABLES,...customProducts];
  const setQ=(id,d)=>setCart(c=>{const n={...c},q=Math.max(0,(n[id]||0)+d);if(!q)delete n[id];else n[id]=q;return n;});
  const count=Object.values(cart).reduce((a,b)=>a+b,0);
  const submit=()=>{if(!count)return;onAdd({id:uid(),items:Object.entries(cart).map(([id,qty])=>({...allProducts.find(c=>c.id===id),qty})),location:loc,requestedBy:user.id,status:"pending",date:tod()});setCart({});setDone(true);setTimeout(()=>setDone(false),2500);};
  if(done)return <div style={{padding:"80px 20px",textAlign:"center"}}><div style={{fontSize:52}}>✅</div><div style={{fontSize:22,fontWeight:800,color:t.accent,fontFamily:"'DM Serif Display',serif",marginTop:12}}>Order Submitted!</div></div>;
  return(
    <div style={{padding:"16px"}}>
      <div style={{fontSize:18,fontWeight:800,color:t.text,fontFamily:"'DM Serif Display',serif",marginBottom:4}}>Order Supplies</div>
      <div style={{marginBottom:14}}><Lbl>Delivery Location</Lbl><Sel value={loc} onChange={e=>setLoc(e.target.value)}>{LOCATIONS.map(l=><option key={l}>{l}</option>)}</Sel></div>
      {allProducts.map(c=><CC key={c.id} t={t} style={{marginBottom:8,display:"flex",alignItems:"center",gap:12,padding:"12px 14px"}}>
        <div style={{fontSize:26,flexShrink:0}}>{c.icon}</div>
        <div style={{flex:1}}><div style={{color:t.text,fontSize:13,fontWeight:600}}>{c.name}</div></div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setQ(c.id,-1)} style={{width:28,height:28,borderRadius:8,background:t.border,border:"none",color:"#fff",cursor:"pointer",fontSize:18}}>−</button>
          <span style={{color:t.text,fontWeight:800,fontSize:16,minWidth:20,textAlign:"center"}}>{cart[c.id]||0}</span>
          <button onClick={()=>setQ(c.id,+1)} style={{width:28,height:28,borderRadius:8,background:t.accent,border:"none",color:"#000",cursor:"pointer",fontSize:18}}>+</button>
        </div>
      </CC>)}
      {count>0&&<div style={{position:"fixed",bottom:72,left:0,right:0,padding:"0 16px",maxWidth:480,margin:"0 auto",zIndex:50}}>
        <button onClick={submit} style={{width:"100%",padding:"15px",background:t.accent,border:"none",borderRadius:14,color:"#000",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 8px 32px #00000060"}}>
          🛒 Submit Order ({count} items)
        </button>
      </div>}
    </div>
  );
}

const AREAS=["Entrance / Lobby","Restrooms","Common Areas","Kitchen / Canteen","Offices"];
function InspectionsScreen({user,t,inspections,onAdd}){
  const [show,setShow]=useState(false);
  const [areas,setAreas]=useState(AREAS.map(a=>({area:a,rating:null,notes:""})));
  const [loc,setLoc]=useState(LOCATIONS[0]);
  const setR=(i,r)=>setAreas(a=>a.map((x,idx)=>idx===i?{...x,rating:r}:x));
  const setN=(i,n)=>setAreas(a=>a.map((x,idx)=>idx===i?{...x,notes:n}:x));
  const scored=areas.filter(a=>a.rating!==null);
  const avg=scored.length?Math.round(scored.reduce((s,a)=>s+a.rating,0)/scored.length*20):0;
  const sc=s=>s>=90?"#22c55e":s>=70?"#eab308":"#ef4444";
  const submit=()=>{if(!scored.length)return;onAdd({id:uid(),location:loc,inspector:user.id,areas,score:avg,date:tod()});setAreas(AREAS.map(a=>({area:a,rating:null,notes:""})));setShow(false);};
  return(
    <div style={{padding:"16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:18,fontWeight:800,color:t.text,fontFamily:"'DM Serif Display',serif"}}>Inspections</div>
        <button onClick={()=>setShow(true)} style={{padding:"8px 14px",background:t.accent,border:"none",borderRadius:10,color:"#000",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>+ New</button>
      </div>
      {inspections.length===0?<div style={{textAlign:"center",padding:"40px 0",color:t.sub}}>No inspections yet</div>
      :inspections.map(ins=><CC key={ins.id} t={t} style={{marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:t.text}}>📍 {ins.location}</div><div style={{fontSize:11,color:t.sub,marginTop:2}}>{df(ins.date)}</div></div>
          <div style={{textAlign:"center",minWidth:52}}><div style={{fontSize:28,fontWeight:900,color:sc(ins.score),fontFamily:"'DM Serif Display',serif"}}>{ins.score}</div><div style={{fontSize:9,color:t.sub,textTransform:"uppercase"}}>Score</div></div>
        </div>
      </CC>)}
      {show&&<Modal title="Site Inspection" t={t} onClose={()=>setShow(false)}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><Lbl>Location</Lbl><Sel value={loc} onChange={e=>setLoc(e.target.value)}>{LOCATIONS.map(l=><option key={l}>{l}</option>)}</Sel></div>
          {areas.map((a,i)=><div key={i}>
            <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:6}}>{a.area}</div>
            <div style={{display:"flex",gap:5,marginBottom:6}}>
              {[1,2,3,4,5].map(r=><button key={r} onClick={()=>setR(i,r)} style={{flex:1,padding:"8px 0",background:a.rating===r?t.accent:"transparent",border:`1px solid ${a.rating===r?t.accent:"#333"}`,borderRadius:8,cursor:"pointer",color:a.rating===r?"#000":"#888",fontSize:13,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{r}</button>)}
            </div>
            <Inp value={a.notes} onChange={e=>setN(i,e.target.value)} placeholder="Notes (optional)…"/>
          </div>)}
          {avg>0&&<div style={{textAlign:"center",padding:"10px",background:`${t.accent}15`,borderRadius:10}}><span style={{color:t.accent,fontWeight:800,fontSize:22}}>{avg}</span><span style={{color:"#666",fontSize:12}}>/100</span></div>}
          <button onClick={submit} style={{padding:"13px",background:t.accent,border:"none",borderRadius:12,color:"#000",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Submit Inspection</button>
        </div>
      </Modal>}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// NFC LOCK SCREEN — shown when no location is set
// Management role bypasses this
// ═══════════════════════════════════════════════════════════
function NfcLockScreen({t, onCheckin}){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",padding:"32px 24px",textAlign:"center"}}>
      <div style={{width:96,height:96,borderRadius:"50%",background:`${t.accent}18`,border:`2px solid ${t.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,marginBottom:24}}>
        📡
      </div>
      <div style={{fontSize:22,fontWeight:800,color:t.text,fontFamily:"'DM Serif Display',serif",marginBottom:8}}>
        Tap your NFC Tag first
      </div>
      <div style={{fontSize:14,color:t.sub,lineHeight:1.6,maxWidth:280,marginBottom:32}}>
        You must check in to a location before you can view tasks or submit requests.
        Tap the NFC tag at your work area to continue.
      </div>
      <button onClick={onCheckin} style={{padding:"14px 28px",background:t.accent,border:"none",borderRadius:14,color:"#000",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:20}}>📡</span> Select Location Manually
      </button>
      <div style={{marginTop:16,fontSize:11,color:t.sub}}>
        Or tap a physical NFC tag to auto-check in
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════
function Dashboard({user,tasks,location,t,onNav,onCheckin,onCheckout}){
  const mine=tasks.filter(x=>x.assigneeId===user.id);
  const pending=mine.filter(x=>["pending","in_progress"].includes(x.status));
  const doneT=mine.filter(x=>x.status==="done"&&x.dueDate===tod());
  const urgent=mine.filter(x=>x.priority==="urgent"&&x.status!=="done");
  const h=new Date().getHours();
  const gr=h<12?"Good morning":h<17?"Good afternoon":"Good evening";
  return(
    <div style={{padding:"16px"}}>
      <LocationBar location={location} t={t} onCheckin={onCheckin} onCheckout={onCheckout}/>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:22,fontFamily:"'DM Serif Display',serif",color:t.text,lineHeight:1.2}}>{gr},<br/><span style={{color:t.accent}}>{user.name.split(" ")[0]}</span> 👋</div>
        <div style={{fontSize:11,color:t.sub,marginTop:4}}>{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18}}>
        {[{l:"Pending",v:pending.length,c:"#f97316"},{l:"Done Today",v:doneT.length,c:"#22c55e"},{l:"Urgent",v:urgent.length,c:"#ef4444"}].map(s=>(
          <div key={s.l} style={{background:t.card,border:`1px solid ${s.c}33`,borderRadius:14,padding:"14px 8px",textAlign:"center"}}>
            <div style={{fontSize:28,fontWeight:900,color:s.c,fontFamily:"'DM Serif Display',serif"}}>{s.v}</div>
            <div style={{fontSize:9,color:t.sub,textTransform:"uppercase",letterSpacing:.8,marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:10,color:t.sub,textTransform:"uppercase",letterSpacing:2,marginBottom:10,fontWeight:700}}>Quick Actions</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[{l:"Report Repair",e:"🔧",s:"repairs"},{l:"Order Supplies",e:"🛒",s:"orders"},{l:"Site Inspection",e:"⭐",s:"inspections"},{l:"My Tasks",e:"✓",s:"tasks"}].map(a=>(
            <button key={a.l} onClick={()=>onNav(a.s)} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:"14px 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:7,cursor:"pointer"}}>
              <span style={{fontSize:22}}>{a.e}</span>
              <span style={{color:t.text,fontSize:11,fontWeight:600,textAlign:"center"}}>{a.l}</span>
            </button>
          ))}
        </div>
      </div>
      {urgent.length>0&&<div style={{marginBottom:16}}>
        <div style={{fontSize:10,color:"#ef4444",textTransform:"uppercase",letterSpacing:2,marginBottom:8,fontWeight:700}}>⚡ Urgent</div>
        {urgent.slice(0,2).map(tk=><TaskCard key={tk.id} task={tk} t={t} onClick={()=>onNav("taskDetail",tk)}/>)}
      </div>}
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:10,color:t.sub,textTransform:"uppercase",letterSpacing:2,fontWeight:700}}>My Tasks</div>
          <button onClick={()=>onNav("tasks")} style={{background:"transparent",border:"none",color:t.accent,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>See all →</button>
        </div>
        {pending.slice(0,4).map(tk=><TaskCard key={tk.id} task={tk} t={t} onClick={()=>onNav("taskDetail",tk)}/>)}
        {pending.length===0&&<div style={{textAlign:"center",padding:"28px 0",color:t.sub}}><div style={{fontSize:30,marginBottom:8}}>🎉</div>All caught up!</div>}
      </div>
    </div>
  );
}

function TasksList({user,tasks,t,onNav}){
  const [st,setSt]=useState("pending");
  const f=tasks.filter(tk=>{
    if(tk.assigneeId!==user.id)return false;
    if(st==="pending"&&!["pending","in_progress"].includes(tk.status))return false;
    if(st==="done"&&tk.status!=="done")return false;
    return true;
  });
  const sorted=[...f].sort((a,b)=>(!!b.inspectionNote)-(!!a.inspectionNote));
  return(
    <div style={{padding:"16px"}}>
      <div style={{fontSize:18,fontWeight:800,color:t.text,fontFamily:"'DM Serif Display',serif",marginBottom:12}}>My Tasks</div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["pending","Active"],["done","Done"],["all","All"]].map(([v,l])=>(
          <button key={v} onClick={()=>setSt(v)} style={{flex:1,padding:"9px 4px",borderRadius:10,background:st===v?`${SC[v]||t.accent}22`:"transparent",border:`1px solid ${st===v?(SC[v]||t.accent):t.border}`,color:st===v?(SC[v]||t.accent):t.sub,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{l}</button>
        ))}
      </div>
      {sorted.length===0?<div style={{textAlign:"center",padding:"48px 0",color:t.sub}}>No tasks found</div>:sorted.map(tk=><TaskCard key={tk.id} task={tk} t={t} onClick={()=>onNav("taskDetail",tk)}/>)}
    </div>
  );
}

function ProfileScreen({user,tasks,location,t,onLogout}){
  const mine=tasks.filter(x=>x.assigneeId===user.id);
  const done=mine.filter(x=>x.status==="done").length;
  const total=mine.length,rate=total?Math.round(done/total*100):0;
  return(
    <div style={{padding:"24px 16px"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <Av name={user.name} size={74} color={t.accent}/>
        <div style={{fontSize:22,fontWeight:800,color:t.text,marginTop:12,fontFamily:"'DM Serif Display',serif"}}>{user.name}</div>
        <div style={{marginTop:8}}><Chip label={RL[user.role]} color={t.accent}/></div>
        {location&&<div style={{marginTop:10,background:`${t.accent}15`,border:`1px solid ${t.accent}33`,borderRadius:10,padding:"8px 14px",display:"inline-flex",alignItems:"center",gap:6}}>
          <Ic d={P.nfc} s={14} c={t.accent}/><span style={{fontSize:12,color:t.accent,fontWeight:600}}>{location.name}</span>
        </div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        {[{l:"Total Tasks",v:total,c:t.accent},{l:"Completed",v:done,c:"#22c55e"},{l:"Completion",v:`${rate}%`,c:rate>=80?"#22c55e":rate>=50?"#eab308":"#ef4444"},{l:"Pending",v:total-done,c:"#f97316"}].map(s=>(
          <div key={s.l} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:"16px",textAlign:"center"}}>
            <div style={{fontSize:28,fontWeight:900,color:s.c,fontFamily:"'DM Serif Display',serif"}}>{s.v}</div>
            <div style={{fontSize:9,color:t.sub,textTransform:"uppercase",letterSpacing:.8,marginTop:3}}>{s.l}</div>
          </div>
        ))}
      </div>
      <button onClick={onLogout} style={{width:"100%",padding:"13px",background:"transparent",border:"2px solid #ef444444",borderRadius:14,color:"#ef4444",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        <Ic d={P.logout} s={16} c="#ef4444"/> Sign Out
      </button>
    </div>
  );
}

function BNav({active,setActive,t,badge,locked=false}){
  const items=[
    {id:"dashboard",icon:P.home,l:"Home"},
    {id:"tasks",icon:P.tasks,l:"Tasks",b:badge},
    {id:"repairs",icon:P.tool,l:"Repairs",lock:locked},
    {id:"orders",icon:P.cart,l:"Supplies",lock:locked},
    {id:"profile",icon:P.user,l:"Profile"},
  ];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,maxWidth:480,margin:"0 auto",background:t.primary,borderTop:`1px solid ${t.border}`,display:"flex",padding:"8px 0 20px",zIndex:100}}>
      {items.map(it=>(
        <button key={it.id} onClick={()=>setActive(it.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"transparent",border:"none",cursor:"pointer",position:"relative",opacity:it.lock?0.45:1}}>
          <Ic d={it.icon} s={22} c={active===it.id?t.accent:t.sub}/>
          <span style={{fontSize:9,color:active===it.id?t.accent:t.sub,letterSpacing:.3,fontFamily:"'DM Sans',sans-serif"}}>{it.l}</span>
          {it.lock&&<div style={{position:"absolute",top:-2,right:"18%",fontSize:9}}>🔒</div>}
          {!it.lock&&it.b>0&&<div style={{position:"absolute",top:0,right:"14%",background:"#ef4444",color:"#fff",width:15,height:15,borderRadius:"50%",fontSize:8,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>{it.b}</div>}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════
export default function App(){
  const [user,setUser]               = useState(null);
  const [extraProfiles,setExtraProfiles] = useState([]);
  const [tasks,setTasks]             = useState([]);
  const [repairs,setRepairs]         = useState([]);
  const [orders,setOrders]           = useState([]);
  const [inspections,setInspections] = useState([]);
  const [location,setLocation]       = useState(null); // {name, time}
  const [customProducts,setCustomProducts] = useState([]);
  const [tab,setTab]                 = useState("dashboard");
  const [nav,setNav]                 = useState({screen:"dashboard",data:null});
  const [showCheckin,setShowCheckin] = useState(false);
  const [showCheckout,setShowCheckout] = useState(false);
  const [loading,setLoading]         = useState(true);

  const loadData=useCallback(async()=>{
    const [tk,r,o,ins,ep,cp]=await Promise.all([
      stor.get(SK.tasks),stor.get(SK.repairs),stor.get(SK.orders),
      stor.get(SK.inspections),stor.get(SK.profiles),stor.get("sh5_custom_products"),
    ]);
    if(tk!==null)setTasks(tk);
    if(r!==null)setRepairs(r);
    if(o!==null)setOrders(o);
    if(ins!==null)setInspections(ins);
    if(ep!==null)setExtraProfiles(ep);
    if(cp!==null)setCustomProducts(cp);
  },[]);

  useEffect(()=>{
    (async()=>{
      await loadData();
      const cu=await stor.get(SK.cu);
      if(cu){
        setUser(cu);
        // restore location
        const loc=await stor.get(SK.locPrefix+cu.id);
        if(loc)setLocation(loc);
      }
      setLoading(false);
    })();
    const iv=setInterval(loadData,15000);
    return()=>clearInterval(iv);
  },[loadData]);

  // ── NFC TAG AUTO-DETECTION ───────────────────────────────────────────────
  // When staff taps a physical NFC tag, iPhone opens:
  // https://sfh-mobile.vercel.app/?nfc=NFC-LOC-GYM
  // We read the ?nfc= param and auto-set the location
  useEffect(()=>{
    if(!user) return; // wait until logged in
    const params = new URLSearchParams(window.location.search);
    const nfcCode = params.get("nfc");
    if(nfcCode && NFC_LOCATION_TAGS[nfcCode]){
      const locName = NFC_LOCATION_TAGS[nfcCode];
      handleCheckin(locName);
      // Clean URL so refresh doesn't re-trigger
      window.history.replaceState({}, "", window.location.pathname);
    }
  },[user]); // re-run when user logs in (tag may have been tapped before login)

  const saveTasks=async t=>{await stor.set(SK.tasks,t);setTasks(t);};
  const addRepair=async r=>{const n=[...repairs,r];await stor.set(SK.repairs,n);setRepairs(n);};
  const addOrder=async o=>{const n=[...orders,o];await stor.set(SK.orders,n);setOrders(n);};
  const addInspection=async i=>{const n=[...inspections,i];await stor.set(SK.inspections,n);setInspections(n);};

  // ── WEB PUSH SUBSCRIPTION ───────────────────────────────────────────────
  const VAPID_PUBLIC_KEY = "BPaDMfr8KzDaqVPbRXHB5j0uqh4eVHIJVD5BDNJNrwzZ_Z_odnjnY3DEeq2az0QgA21Q_ZSBaP_F8eFGnPsjhdU";

  const subscribeToPush = async (userId) => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      // Request permission
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return;
      // Subscribe
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY,
      });
      // Save subscription to Supabase so admin can send notifications
      const subJson = JSON.parse(JSON.stringify(sub));
      await stor.set('sh5_push_' + userId, subJson);
      console.log('Push subscription saved for', userId, 'endpoint:', subJson.endpoint?.slice(0,40));
    } catch(e) {
      console.log('Push subscription failed:', e.message);
    }
  };

  const login=async u=>{
    // Clear any previous location on new login — ensures only one active location
    await stor.del(SK.locPrefix+u.id);
    setLocation(null);
    setUser(u);
    await stor.set(SK.cu,{id:u.id,name:u.name,role:u.role,nfc:u.nfc});
    // Subscribe to push notifications
    subscribeToPush(u.id);
  };
  const logout=async()=>{
    if(user)await stor.del(SK.locPrefix+user.id);
    setUser(null);setLocation(null);await stor.set(SK.cu,null);
  };

  // Check in to location
  const handleCheckin=async locName=>{
    const loc={name:locName,time:tf(),date:tod()};
    setLocation(loc);
    if(user) await stor.set(SK.locPrefix+user.id,{...loc,userId:user.id,userName:user.name,role:user.role});
  };

  // Checkout — after photo confirmed
  const handleCheckoutComplete=async checkoutData=>{
    // Save checkout record with photo for admin/reports
    const record={...checkoutData,type:"checkout"};
    const existing=await stor.get("sh5_checkouts")||[];
    await stor.set("sh5_checkouts",[...existing,record]);
    // Clear location
    if(user) await stor.del(SK.locPrefix+user.id);
    setLocation(null);
    setShowCheckout(false);
  };

  const go=(screen,data=null)=>{setNav({screen,data});if(!["taskDetail"].includes(screen))setTab(screen);};
  const t=user?(TH[user.role]||TH.cleaner):TH.cleaner;
  const myBadge=tasks.filter(x=>x.assigneeId===user?.id&&["pending","in_progress"].includes(x.status)).length;
  const screen=nav.screen;

  if(loading)return <div style={{minHeight:"100vh",background:"#050508",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"#d4a843",fontFamily:"Georgia,serif",fontSize:22}}>Loading…</div></div>;
  if(!user)return <LoginScreen onLogin={login} extraProfiles={extraProfiles}/>;

  return(
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:t.bg,fontFamily:"'DM Sans',sans-serif",paddingBottom:80}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <div style={{background:t.primary,padding:"12px 16px",borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:t.accent}}>Soho House</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Chip label={RL[user.role]} color={t.accent} sm/>
          <Av name={user.name} size={28} color={t.accent}/>
        </div>
      </div>

      {/* ── GLOBAL INSPECTION FEEDBACK BANNER ─────────────────────────
           Shown below header whenever user has tasks sent back for correction */}
      {(()=>{
        const returnTasks=tasks.filter(x=>x.assigneeId===user.id&&x.inspectionNote&&x.status!=="done");
        if(!returnTasks.length)return null;
        return(
          <div style={{background:"#ef4444",padding:"10px 16px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}
            onClick={()=>{setTab("tasks");setNav({screen:"tasks",data:null});}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"#ffffff22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>⚠️</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:"#fff",fontWeight:900}}>
                {returnTasks.length === 1
                  ? "1 task returned for correction"
                  : `${returnTasks.length} tasks returned for correction`}
              </div>
              <div style={{fontSize:10,color:"#ffffff88",marginTop:1}}>Management feedback requires your attention — tap to view</div>
            </div>
            <div style={{fontSize:18,color:"#fff"}}>›</div>
          </div>
        );
      })()}

      {/* NFC check-in modal */}
      {showCheckin&&<NfcCheckinModal user={user} t={t} onCheckin={handleCheckin} onClose={()=>setShowCheckin(false)}/>}

      {/* Checkout photo modal */}
      {showCheckout&&<CheckoutPhotoModal location={location?.name||""} user={user} t={t} onComplete={handleCheckoutComplete} onCancel={()=>setShowCheckout(false)}/>}

      {(()=>{
        // Management can access everything without NFC check-in
        const needsNfc = user.role !== "management";
        const hasLocation = !!location;
        // Tasks tab is always accessible — NFC is enforced per-task when starting work
        // Repairs, orders, inspections still require location check-in
        const lockedScreens = ["repairs","orders","inspections"];
        const isLocked = needsNfc && !hasLocation && lockedScreens.includes(tab) && screen !== "taskDetail";

        if(screen==="taskDetail")
          return <TaskDetail task={tasks.find(x=>x.id===nav.data?.id)||nav.data} user={user} t={t} location={location} onBack={()=>go("tasks")} onSave={u=>saveTasks(tasks.map(x=>x.id===u.id?u:x))} onSetLocation={loc=>{setLocation(loc);}} onClearLocation={()=>{setLocation(null);stor.del(SK.locPrefix+user?.id);}}/>;
        if(isLocked)
          return <NfcLockScreen t={t} onCheckin={()=>setShowCheckin(true)}/>;
        if(tab==="dashboard")
          return <Dashboard user={user} tasks={tasks} location={location} t={t} onNav={go} onCheckin={()=>setShowCheckin(true)} onCheckout={()=>setShowCheckout(true)}/>;
        if(tab==="tasks")
          return <TasksList user={user} tasks={tasks} t={t} onNav={go}/>;
        if(tab==="repairs")
          return <RepairsScreen user={user} t={t} repairs={repairs} onAdd={addRepair}/>;
        if(tab==="orders")
          return <OrdersScreen user={user} t={t} orders={orders} onAdd={addOrder}/>;
        if(tab==="inspections")
          return <InspectionsScreen user={user} t={t} inspections={inspections} onAdd={addInspection}/>;
        return <ProfileScreen user={user} tasks={tasks} location={location} t={t} onLogout={logout}/>;
      })()}

      <BNav active={tab} setActive={t2=>{setTab(t2);setNav({screen:t2,data:null});}} t={t} badge={myBadge} locked={user.role!=="management"&&!location}/>
    </div>
  );
}
