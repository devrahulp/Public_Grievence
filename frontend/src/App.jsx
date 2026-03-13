import { useState, useEffect, useRef, useCallback } from "react";
import ComplaintForm from "./components/ComplaintForm";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./App.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const OFFICES = [
  { name:"BBMP Head Office",     pos:[12.9784,77.5911], zone:"HQ",    addr:"N R Square, Bengaluru" },
  { name:"Mahadevapura Zone",    pos:[12.9857,77.7024], zone:"East",  addr:"Mahadevapura, Bengaluru" },
  { name:"Bommanahalli Zone",    pos:[12.8997,77.6294], zone:"South", addr:"Bommanahalli, Bengaluru" },
  { name:"Dasarahalli Zone",     pos:[13.0452,77.5234], zone:"North", addr:"Dasarahalli, Bengaluru" },
  { name:"Byatarayanapura Zone", pos:[13.0691,77.5940], zone:"North", addr:"Byatarayanapura, Bengaluru" },
  { name:"RR Nagar Zone",        pos:[12.9264,77.5187], zone:"West",  addr:"Rajajinagar, Bengaluru" },
  { name:"Yelahanka Zone",       pos:[13.1014,77.5963], zone:"North", addr:"Yelahanka, Bengaluru" },
  { name:"West Zone Office",     pos:[12.9602,77.5365], zone:"West",  addr:"Rajajinagar, Bengaluru" },
];
const ZONE_COLORS = { HQ:"#f59e0b", East:"#10b981", South:"#34d399", North:"#fbbf24", West:"#6ee7b7" };

function makeIcon(zone) {
  const c = ZONE_COLORS[zone] || "#aaa";
  return L.divIcon({
    className:"",
    html:`<div style="width:13px;height:13px;border-radius:50%;background:${c};border:2.5px solid rgba(255,255,255,.85);box-shadow:0 0 0 3px ${c}55,0 2px 8px rgba(0,0,0,.5)"></div>`,
    iconSize:[13,13], iconAnchor:[6,6],
  });
}

/* ── Typewriter ── */
function useTypewriter(words, spd=65, pause=2000) {
  const [out,setOut]=useState(""); const [wi,setWi]=useState(0);
  const [ci,setCi]=useState(0);   const [del,setDel]=useState(false);
  useEffect(()=>{
    const w=words[wi]; let t;
    if(!del&&ci<w.length)   t=setTimeout(()=>setCi(c=>c+1),spd);
    else if(!del)           t=setTimeout(()=>setDel(true),pause);
    else if(del&&ci>0)      t=setTimeout(()=>setCi(c=>c-1),spd/2);
    else{ setDel(false); setWi(i=>(i+1)%words.length); }
    setOut(w.slice(0,ci)); return()=>clearTimeout(t);
  },[ci,del,wi,words,spd,pause]);
  return out;
}

/* ── 3D Tilt wrapper ── */
function Tilt3D({ children, className="", intensity=15, scale=1.04 }) {
  const ref=useRef(); const raf=useRef();
  const onMove=useCallback(e=>{
    cancelAnimationFrame(raf.current);
    raf.current=requestAnimationFrame(()=>{
      const el=ref.current; if(!el) return;
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      el.style.transform=`perspective(1000px) rotateY(${x*intensity}deg) rotateX(${-y*(intensity*.75)}deg) scale3d(${scale},${scale},${scale})`;
      el.style.setProperty("--gx",`${(x+.5)*100}%`);
      el.style.setProperty("--gy",`${(y+.5)*100}%`);
    });
  },[intensity,scale]);
  const onLeave=useCallback(()=>{
    cancelAnimationFrame(raf.current);
    if(ref.current) ref.current.style.transform=`perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)`;
  },[]);
  return <div ref={ref} className={`tilt3d ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>{children}</div>;
}

/* ── Animated 3D background canvas ── */
function Scene3D() {
  const ref=useRef();
  useEffect(()=>{
    const canvas=ref.current;
    const ctx=canvas.getContext("2d");
    let raf, t=0;
    const resize=()=>{ canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight; };
    resize(); window.addEventListener("resize",resize);

    // Rotating 3D wireframe cubes projected onto 2D
    const project=([x,y,z],cx,cy,fov=320)=>{
      const s=fov/(fov+z); return [cx+x*s, cy+y*s, s];
    };
    const cubeEdges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];

    const makeCube=(cx,cy,size)=>{
      const v=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
      return { cx, cy, size, verts:v, rx:Math.random()*Math.PI*2, ry:Math.random()*Math.PI*2, rz:Math.random()*Math.PI*2,
        drx:(Math.random()-.5)*.008, dry:(Math.random()-.5)*.012, drz:(Math.random()-.5)*.006 };
    };

    const rotate=([x,y,z],rx,ry,rz)=>{
      let [a,b,c]=[x,y,z];
      [b,c]=[b*Math.cos(rx)-c*Math.sin(rx), b*Math.sin(rx)+c*Math.cos(rx)];
      [a,c]=[a*Math.cos(ry)+c*Math.sin(ry),-a*Math.sin(ry)+c*Math.cos(ry)];
      [a,b]=[a*Math.cos(rz)-b*Math.sin(rz), a*Math.sin(rz)+b*Math.cos(rz)];
      return [a,b,c];
    };

    const cubes=[
      makeCube(.15,.2, 55),makeCube(.85,.15,40),makeCube(.08,.7,35),
      makeCube(.9,.75,50),makeCube(.5,.85,30),makeCube(.75,.45,25),
    ];

    // Floating gold particles
    const particles=Array.from({length:50},()=>({
      x:Math.random(), y:Math.random(),
      dx:(Math.random()-.5)*.0003, dy:(Math.random()-.5)*.0003,
      r:Math.random()*1.5+.4, o:Math.random()*.6+.1,
      gold:Math.random()>.5,
    }));

    const draw=()=>{
      t+=.005;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const W=canvas.width, H=canvas.height;

      // particles
      particles.forEach(p=>{
        p.x+=p.dx; p.y+=p.dy;
        if(p.x<0)p.x=1; if(p.x>1)p.x=0;
        if(p.y<0)p.y=1; if(p.y>1)p.y=0;
        ctx.beginPath(); ctx.arc(p.x*W,p.y*H,p.r,0,Math.PI*2);
        ctx.fillStyle=p.gold?`rgba(251,191,36,${p.o})`:`rgba(52,211,153,${p.o*.7})`;
        ctx.fill();
      });

      // wireframe cubes
      cubes.forEach(cube=>{
        cube.rx+=cube.drx; cube.ry+=cube.dry; cube.rz+=cube.drz;
        const cx=cube.cx*W, cy=cube.cy*H;
        const pts=cube.verts.map(v=>{
          const rv=rotate([v[0]*cube.size,v[1]*cube.size,v[2]*cube.size],cube.rx,cube.ry,cube.rz);
          return project(rv,cx,cy,280);
        });
        // sort edges by avg z
        cubeEdges.forEach(([a,b])=>{
          const za=pts[a][2], zb=pts[b][2];
          const alpha=Math.min(za,zb)*.35;
          ctx.beginPath();
          ctx.moveTo(pts[a][0],pts[a][1]);
          ctx.lineTo(pts[b][0],pts[b][1]);
          ctx.strokeStyle=`rgba(251,191,36,${alpha})`;
          ctx.lineWidth=.8;
          ctx.stroke();
        });
        // vertices
        pts.forEach(([px,py,s])=>{
          ctx.beginPath(); ctx.arc(px,py,s*2,0,Math.PI*2);
          ctx.fillStyle=`rgba(52,211,153,${s*.4})`;
          ctx.fill();
        });
      });

      // connecting lines between nearby particles
      for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
          const dx=(particles[i].x-particles[j].x)*W;
          const dy=(particles[i].y-particles[j].y)*H;
          const d=Math.sqrt(dx*dx+dy*dy);
          if(d<90){
            ctx.beginPath();
            ctx.strokeStyle=`rgba(251,191,36,${.08*(1-d/90)})`;
            ctx.lineWidth=.5;
            ctx.moveTo(particles[i].x*W,particles[i].y*H);
            ctx.lineTo(particles[j].x*W,particles[j].y*H);
            ctx.stroke();
          }
        }
      }
      raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  },[]);
  return <canvas ref={ref} className="scene3d-canvas"/>;
}

/* ── Stat card ── */
function StatCard({ n, label, icon, delay, color }) {
  return (
    <Tilt3D className="stat3d" intensity={22} scale={1.1}>
      <div className="stat3d-inner" style={{"--ac":color,"--d":`${delay}ms`}}>
        <span className="stat3d-icon">{icon}</span>
        <span className="stat3d-n">{n}</span>
        <span className="stat3d-l">{label}</span>
        <div className="stat3d-shine"/>
      </div>
    </Tilt3D>
  );
}

/* ── Step card ── */
function StepCard({ icon, num, title, desc, delay, color }) {
  return (
    <Tilt3D className="step-wrap" intensity={14} scale={1.05}>
      <div className="step-card" style={{"--ac":color,"--d":`${delay}ms`}}>
        <div className="step-num">{num}</div>
        <div className="step-icon">{icon}</div>
        <h3 className="step-title">{title}</h3>
        <p  className="step-desc">{desc}</p>
        <div className="step-glow"/>
        <div className="step-shine"/>
      </div>
    </Tilt3D>
  );
}

export default function App() {
  const [page,setPage]           = useState("home");
  const [adminAuth,setAdminAuth] = useState(localStorage.getItem("adminAuth")==="true");
  const [scrolled,setScrolled]   = useState(false);
  const [mounted,setMounted]     = useState(false);

  const typed = useTypewriter([
    "pothole on your street?","broken streetlight?",
    "garbage overflow?","flooding in your ward?","encroachment issue?",
  ]);

  useEffect(()=>{
    setMounted(true);
    const fn=()=>setScrolled(window.scrollY>50);
    window.addEventListener("scroll",fn); return()=>window.removeEventListener("scroll",fn);
  },[]);

  return (
    <div className="root">

      {/* NAV */}
      <nav className={`nav ${scrolled?"nav-solid":""}`}>
        <div className="nav-logo" onClick={()=>setPage("home")}>
          <span className="logo-gem">◈</span>
          <span className="logo-text">CivicBridge</span>
        </div>
        <div className="nav-links">
          {[["home","Home"],["citizen","File Complaint"],["admin","Admin"]].map(([id,lbl])=>(
            <button key={id} className={`nb ${page===id?"nb-on":""}`} onClick={()=>setPage(id)}>{lbl}</button>
          ))}
        </div>
      </nav>

      {page==="home" && <>
        {/* HERO */}
        <section className="hero">
          <Scene3D/>

          {/* deep emerald aurora blobs */}
          <div className="aurora">
            <div className="blob b1"/><div className="blob b2"/>
            <div className="blob b3"/><div className="blob b4"/>
          </div>

          {/* LEFT */}
          <div className={`hero-left ${mounted?"hl-in":""}`}>
            <Tilt3D intensity={5} scale={1.01}>
              <div className="glass-badge">
                <span className="live-dot"/>
                Live · BBMP Smart Civic Portal · Bengaluru
              </div>
            </Tilt3D>

            <h1 className="hero-h1">
              Spotted a<br/>
              <span className="tw-wrap">
                <span className="tw-text">{typed}</span>
                <span className="tw-cur">|</span>
              </span><br/>
              <span className="h1-gold">Report it <em>instantly.</em></span>
            </h1>

            <p className="hero-para">
              File complaints directly with your BBMP zonal office —
              tracked, transparent, and resolved fast.
            </p>

            <div className="stat-row">
              <StatCard n="8"        label="Zones"    icon="🗺️" delay={0}   color="#f59e0b"/>
              <StatCard n="198"      label="Wards"    icon="📍" delay={80}  color="#10b981"/>
              <StatCard n="1.3k km²" label="Area"     icon="📐" delay={160} color="#fbbf24"/>
              <StatCard n="~24h"     label="Response" icon="⚡" delay={240} color="#34d399"/>
            </div>

            <div className="hero-btns">
              <Tilt3D intensity={12} scale={1.06}>
                <button className="btn-gold" onClick={()=>setPage("citizen")}>
                  📋&nbsp; File a Complaint &nbsp;<span className="arr">→</span>
                </button>
              </Tilt3D>
              <Tilt3D intensity={10} scale={1.04}>
                <button className="btn-ghost" onClick={()=>document.getElementById("how").scrollIntoView({behavior:"smooth"})}>
                  How it works ↓
                </button>
              </Tilt3D>
            </div>
          </div>

          {/* RIGHT — 3D map */}
          <div className={`hero-right ${mounted?"hr-in":""}`}>
            <p className="map-eyebrow">📍 BBMP Zonal Offices — Bengaluru</p>
            <Tilt3D className="map-tilt" intensity={20} scale={1.03}>
              <div className="glass-map">
                <div className="map-glare"/>
                <div className="map-top-edge"/>
                <MapContainer center={[12.9716,77.5946]} zoom={11} className="leaflet-map" scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; OSM &copy; CARTO"/>
                  {OFFICES.map(o=>(
                    <Marker key={o.name} position={o.pos} icon={makeIcon(o.zone)}>
                      <Popup>
                        <strong>{o.name}</strong><br/>
                        <span style={{fontSize:12,color:"#aaa"}}>{o.addr}</span><br/>
                        <span style={{display:"inline-block",marginTop:4,background:ZONE_COLORS[o.zone],color:"#000",borderRadius:4,padding:"1px 8px",fontSize:11,fontWeight:700}}>{o.zone}</span>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
                <div className="map-legend">
                  {Object.entries(ZONE_COLORS).map(([z,c])=>(
                    <span key={z} className="leg"><span className="leg-dot" style={{background:c}}/>{z}</span>
                  ))}
                </div>
              </div>
            </Tilt3D>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how" id="how">
          <div className="how-head">
            <span className="sec-tag">Simple Process</span>
            <h2 className="sec-h2">From complaint to <span className="gold-text">resolution</span></h2>
          </div>
          <div className="steps-grid">
            {[
              {icon:"📋",num:"01",title:"Describe the Issue",  desc:"Fill out the form with location, category, and a clear description.",delay:0,   color:"#f59e0b"},
              {icon:"📎",num:"02",title:"Attach Evidence",     desc:"Upload photos or documents to support and speed up your complaint.",delay:90,  color:"#10b981"},
              {icon:"📡",num:"03",title:"Auto-routed to BBMP", desc:"Sent directly to the relevant zonal office within seconds.",        delay:180, color:"#fbbf24"},
              {icon:"✅",num:"04",title:"Get Resolution",      desc:"Track real-time status updates until the issue is resolved.",       delay:270, color:"#34d399"},
            ].map(s=><StepCard key={s.num} {...s}/>)}
          </div>
        </section>

        {/* NUMBERS */}
        <section className="numbers">
          {[
            {n:"12,400+",l:"Complaints Resolved",c:"#f59e0b"},
            {n:"8",      l:"BBMP Zones",         c:"#10b981"},
            {n:"98%",    l:"Satisfaction Rate",  c:"#fbbf24"},
            {n:"~48h",   l:"Avg. Resolution",    c:"#34d399"},
          ].map(({n,l,c})=>(
            <Tilt3D key={l} className="num-tilt" intensity={14} scale={1.07}>
              <div className="num-item" style={{"--ac":c}}>
                <span className="num-n">{n}</span>
                <span className="num-l">{l}</span>
                <div className="num-bar"/>
              </div>
            </Tilt3D>
          ))}
        </section>
      </>}

      {page==="citizen" && (
        <section className="inner">
          <button className="back-btn" onClick={()=>setPage("home")}>← Back</button>
          <h2 className="inner-h">File a Complaint</h2>
          <p className="inner-sub">Your report is forwarded to the appropriate BBMP zonal office.</p>
          <div className="glass-form"><ComplaintForm/></div>
        </section>
      )}

      {page==="admin" && (
        <section className="inner">
          <button className="back-btn" onClick={()=>setPage("home")}>← Back</button>
          <h2 className="inner-h">Admin Dashboard</h2>
          {!adminAuth
            ? <div className="glass-form"><AdminLogin setAdminAuth={setAdminAuth}/></div>
            : <AdminDashboard/>}
        </section>
      )}

      <footer className="footer">
        <div className="footer-logo"><span className="logo-gem">◈</span> CivicBridge</div>
        <span>© 2025 BBMP Digital Services · Bengaluru</span>
      </footer>
    </div>
  );
}