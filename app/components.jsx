/* Shared components & utilities — WC2026 Trip Planner */

// ============================================================
// Date helpers
// ============================================================
const TRIP_TZ_OFFSET_MIN = -7 * 60;

function parseTripDateTime(dateStr, timeStr) {
  if (!dateStr) return null;
  let hh = 12, mm = 0;
  if (timeStr && /^\d{1,2}:\d{2}$/.test(timeStr)) { [hh, mm] = timeStr.split(":").map(Number); }
  else if (timeStr === "evening") { hh = 19; mm = 0; }
  const [Y, M, D] = dateStr.split("-").map(Number);
  const utcMs = Date.UTC(Y, M - 1, D, hh, mm) - TRIP_TZ_OFFSET_MIN * 60_000;
  return new Date(utcMs);
}
function shortWeekday(date) { return new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }); }
function longWeekday(date)  { return new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" }); }
function dayOfMonth(date)   { return Number(date.slice(8, 10)); }
function monthShort(date)   { return new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short" }); }
function diffToNow(target) {
  const now = new Date(); let ms = target.getTime() - now.getTime();
  const past = ms < 0; ms = Math.abs(ms);
  return { days: Math.floor(ms/86400000), hours: Math.floor((ms%86400000)/3600000), minutes: Math.floor((ms%3600000)/60000), seconds: Math.floor((ms%60000)/1000), past };
}

// ============================================================
// Google Maps link helper (iOS-friendly — opens app if installed)
// ============================================================
function mapsUrl(query) {
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

function MapsLink({ query, label, compact = false }) {
  const pinIcon = (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1C5.8 1 4 2.9 4 5.2c0 3.6 4 8.8 4 8.8s4-5.2 4-8.8C12 2.9 10.2 1 8 1z"/>
      <circle cx="8" cy="5.2" r="1.5"/>
    </svg>
  );
  if (compact) {
    return (
      <a href={mapsUrl(query)} target="_blank" rel="noopener noreferrer"
        className="maps-link maps-pin" title={label || query}
        onClick={e => e.stopPropagation()}>
        {pinIcon}
      </a>
    );
  }
  return (
    <a href={mapsUrl(query)} target="_blank" rel="noopener noreferrer"
      className="maps-link" onClick={e => e.stopPropagation()}>
      {pinIcon} {label || "Maps"}
    </a>
  );
}

// ============================================================
// Open-Meteo weather hook (free, no API key needed)
// ============================================================
const WMO_ICON = (c) => {
  if (c === 0) return "sun";
  if (c <= 3) return "cloud-sun";
  if (c <= 48) return "fog";
  if (c <= 67) return "cloud-rain";
  if (c <= 77) return "snow";
  if (c <= 82) return "cloud-rain";
  if (c <= 86) return "snow";
  return "cloud-rain";
};
const WMO_DESC = (c) => {
  if (c === 0) return "Clear";
  if (c <= 3) return c === 1 ? "Mostly clear" : c === 2 ? "Part cloudy" : "Overcast";
  if (c <= 48) return "Foggy";
  if (c <= 55) return "Drizzle";
  if (c <= 67) return "Rain";
  if (c <= 77) return "Snow";
  if (c <= 82) return "Showers";
  if (c <= 86) return "Snow showers";
  return "Storms";
};

// Cache weather fetches by key to avoid duplicate calls
const _weatherCache = {};

function useStopWeather(lat, lng, startDate, endDate) {
  const key = `${lat},${lng},${startDate},${endDate}`;
  const [state, setState] = React.useState(() => _weatherCache[key] || { loading: true, data: null, error: null });
  React.useEffect(() => {
    if (_weatherCache[key] && !_weatherCache[key].loading) { setState(_weatherCache[key]); return; }
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max&temperature_unit=celsius&timezone=America%2FLos_Angeles&start_date=${startDate}&end_date=${endDate}`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        const s = { loading: false, data: d.daily, error: null };
        _weatherCache[key] = s; setState(s);
      })
      .catch(e => {
        const s = { loading: false, data: null, error: e.message };
        _weatherCache[key] = s; setState(s);
      });
  }, [key]);
  return state;
}

// ============================================================
// Weather icon SVGs (inline, no external dependency)
// ============================================================
function WeatherIcon({ kind, size = 20, color = "currentColor" }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } };
  switch (kind) {
    case "sun": return (
      <svg {...p}>
        <circle cx="12" cy="12" r="4"/>
        {[0,45,90,135,180,225,270,315].map(a => {
          const rad = a * Math.PI / 180;
          return <line key={a} x1={12+Math.cos(rad)*7} y1={12+Math.sin(rad)*7} x2={12+Math.cos(rad)*9.5} y2={12+Math.sin(rad)*9.5}/>;
        })}
      </svg>
    );
    case "cloud-sun": return (
      <svg {...p}>
        <circle cx="7.5" cy="8" r="2.5"/>
        <line x1="7.5" y1="3" x2="7.5" y2="4.5"/><line x1="2" y1="8" x2="3.5" y2="8"/>
        <line x1="4.2" y1="4.2" x2="5.2" y2="5.2"/>
        <path d="M6 17a4 4 0 010-8c.3 0 .6 0 .9.1A5 5 0 0118 12.5 3 3 0 0118 18z"/>
      </svg>
    );
    case "cloud-rain": return (
      <svg {...p}>
        <path d="M4 14a4 4 0 010-8 5 5 0 019.5 1.5A3 3 0 0114 14z"/>
        <line x1="6" y1="17" x2="6" y2="20"/><line x1="10" y1="17" x2="10" y2="20"/><line x1="14" y1="17" x2="14" y2="20"/>
      </svg>
    );
    case "snow": return (
      <svg {...p}>
        <path d="M4 13a4 4 0 010-8 5 5 0 019.5 1.5A3 3 0 0114 13z"/>
        <line x1="6" y1="17" x2="6" y2="20"/><line x1="10" y1="17" x2="10" y2="20"/><line x1="14" y1="17" x2="14" y2="20"/>
        <circle cx="6" cy="18" r="0.8" fill={color}/><circle cx="10" cy="19" r="0.8" fill={color}/><circle cx="14" cy="18" r="0.8" fill={color}/>
      </svg>
    );
    case "fog": return (
      <svg {...p}>
        <path d="M3 10a4 4 0 014-4 5 5 0 019.5 1.5A3 3 0 0117 14H3"/><line x1="3" y1="17" x2="17" y2="17"/><line x1="5" y1="20" x2="15" y2="20"/>
      </svg>
    );
    default: return <svg {...p}><circle cx="12" cy="12" r="8"/></svg>;
  }
}

// Multi-day weather widget for a stop
function StopWeatherWidget({ stop }) {
  const { lat, lng } = stop.coords;
  const { loading, data, error } = useStopWeather(lat, lng, stop.arrive, stop.depart);
  const accentColor = "var(--sky)";

  if (loading) return (
    <div style={{ padding: "14px 16px", border: "1px solid var(--rule)", borderRadius: 2, background: "var(--cream-warm)", textAlign: "center" }}>
      <div className="mono" style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: "0.12em" }}>LOADING FORECAST…</div>
    </div>
  );

  if (error || !data) return (
    <div style={{ padding: "10px 12px", border: "1px solid var(--rule)", borderRadius: 2 }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>Typical June weather</div>
      <div className="mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>Forecast unavailable offline</div>
    </div>
  );

  const days = data.time || [];

  return (
    <div style={{ border: "1.5px solid var(--ink)", borderRadius: 2, overflow: "hidden", background: "var(--cream-warm)" }}>
      <div style={{ background: "var(--ink)", padding: "6px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="eyebrow" style={{ color: "var(--cream-warm)", fontSize: 9 }}>FORECAST · {stop.region}</span>
        <span className="mono" style={{ fontSize: 9, color: "color-mix(in oklab, var(--cream-warm) 60%, transparent)" }}>open-meteo.com</span>
      </div>
      <div style={{ display: "flex", overflow: "auto" }}>
        {days.map((date, i) => {
          const hi = Math.round(data.temperature_2m_max?.[i] ?? 0);
          const lo = Math.round(data.temperature_2m_min?.[i] ?? 0);
          const code = data.weathercode?.[i] ?? 0;
          const precip = data.precipitation_probability_max?.[i] ?? 0;
          const icon = WMO_ICON(code);
          const desc = WMO_DESC(code);
          return (
            <div key={date} style={{ flex: "1 0 72px", padding: "10px 8px 10px", textAlign: "center", borderRight: "1px solid var(--rule)", minWidth: 64 }}>
              <div className="mono" style={{ fontSize: 9, textTransform: "uppercase", color: "var(--ink-mute)", letterSpacing: "0.1em" }}>{shortWeekday(date)}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 4 }}>{dayOfMonth(date)}</div>
              <div style={{ display: "flex", justifyContent: "center", color: "var(--rust)", marginBottom: 4 }}>
                <WeatherIcon kind={icon} size={22} color="var(--rust)" />
              </div>
              <div style={{ fontSize: 9, color: "var(--ink-mute)", fontFamily: "var(--f-mono)", marginBottom: 4 }}>{desc}</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 15, lineHeight: 1, color: "var(--ink)" }}>{hi}°</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-mute)" }}>{lo}°</div>
              {precip > 20 && (
                <div className="mono" style={{ fontSize: 9, color: "var(--sky)", marginTop: 3 }}>💧{precip}%</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Users / attribution
// ============================================================
const USERS = {
  will:  { id: "will",  initials: "W", name: "Will",  color: "var(--rust)" },
  andy:  { id: "andy",  initials: "A", name: "Andy",  color: "var(--forest)" },
  seed:  { id: "seed",  initials: "★", name: "Guide", color: "var(--ochre)" },
};

function useActiveUser() {
  const [u, setU] = React.useState(() => localStorage.getItem("wc2026.user") || "will");
  React.useEffect(() => { localStorage.setItem("wc2026.user", u); }, [u]);
  return [u, setU];
}

function Avatar({ user, size = 24, ring = false }) {
  const U = USERS[user] || USERS.seed;
  const s = {
    width: size, height: size, lineHeight: size + "px",
    background: U.color, color: U.id === "seed" ? "var(--ink)" : "var(--cream-warm)",
    fontFamily: "var(--f-display)", fontSize: Math.floor(size * 0.5),
    textAlign: "center", borderRadius: "50%", display: "inline-block",
    border: ring ? "2px solid var(--ink)" : "1.5px solid var(--ink)",
    boxShadow: ring ? "1.5px 1.5px 0 var(--ink)" : "none",
    textTransform: "uppercase", fontWeight: 800, flexShrink: 0,
  };
  return <span title={U.name} style={s}>{U.initials}</span>;
}

// ============================================================
// Category icons
// ============================================================
const CAT_LABEL = {
  sport:"Sport", baseball:"Baseball", wnba:"WNBA", culture:"Culture", museum:"Museum",
  garden:"Garden", park:"Park", view:"View", run:"Run", food:"Food", bar:"Bar",
  drink:"Drink", market:"Market", dayout:"Day Trip", music:"Music",
};
const CAT_COLOR = {
  sport:"rust", baseball:"rust", wnba:"rust", culture:"navy", museum:"navy",
  garden:"forest", park:"forest", view:"forest", run:"ochre", food:"rust",
  bar:"navy", drink:"navy", market:"ochre", dayout:"forest", music:"navy",
};

function CatIcon({ cat, size = 14 }) {
  const props = { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (cat) {
    case "baseball": return <svg {...props}><circle cx="8" cy="8" r="6"/><path d="M4 5 q4 3 8 6"/><path d="M5 12 q1-2 0-4"/><path d="M11 4 q-1 2 0 4"/></svg>;
    case "sport":    return <svg {...props}><circle cx="8" cy="8" r="6"/><path d="M8 2v12M2 8h12"/></svg>;
    case "wnba":     return <svg {...props}><circle cx="8" cy="8" r="6"/><path d="M2 8h12"/><path d="M8 2c2.5 2 2.5 10 0 12"/><path d="M8 2c-2.5 2 -2.5 10 0 12"/></svg>;
    case "museum":   return <svg {...props}><path d="M2 13h12M3 13V7M6 13V7M10 13V7M13 13V7M2 7l6-4 6 4"/></svg>;
    case "culture":  return <svg {...props}><path d="M3 13V5l5-3 5 3v8"/><path d="M6 13V9h4v4"/></svg>;
    case "garden":   return <svg {...props}><path d="M8 14V8"/><path d="M8 8c-3 0-4-2-4-4 3 0 4 2 4 4z"/><path d="M8 8c3 0 4-2 4-4-3 0-4 2-4 4z"/></svg>;
    case "park":     return <svg {...props}><path d="M3 13h10M5 13l3-8 3 8M6 10h4"/></svg>;
    case "view":     return <svg {...props}><path d="M2 13l4-6 3 4 2-3 3 5"/><circle cx="12" cy="4" r="1.2"/></svg>;
    case "run":      return <svg {...props}><circle cx="11" cy="3.5" r="1.3"/><path d="M9 14l1.5-4 1.5 1 2 1"/><path d="M3 11l3-1 1.5-3 2 2"/></svg>;
    case "food":     return <svg {...props}><path d="M5 2v6a2 2 0 002 2v4M5 5h2M11 2c-1 1-1 5 0 6v6"/></svg>;
    case "bar":      return <svg {...props}><path d="M3 3h10l-5 6-5-6zM8 9v5M5 14h6"/></svg>;
    case "drink":    return <svg {...props}><path d="M5 2h6l-1 9a2 2 0 01-4 0L5 2zM5 5h6"/></svg>;
    case "market":   return <svg {...props}><path d="M2 5h12l-1 8H3L2 5zM5 5V3a3 3 0 016 0v2"/></svg>;
    case "dayout":   return <svg {...props}><path d="M2 11h12M3 11l1-3h8l1 3M5 8V5h6v3"/><circle cx="5" cy="13" r="1"/><circle cx="11" cy="13" r="1"/></svg>;
    case "music":    return <svg {...props}><path d="M6 11V3l6-1v8"/><circle cx="5" cy="12" r="1.5"/><circle cx="11" cy="10" r="1.5"/></svg>;
    default:         return <svg {...props}><circle cx="8" cy="8" r="6"/></svg>;
  }
}

// ============================================================
// Trip store (localStorage)
// ============================================================
const STORE_KEY = "wc2026.store.v1";

function loadStore() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch { return {}; } }
function saveStore(s) { localStorage.setItem(STORE_KEY, JSON.stringify(s)); }

function useTripStore() {
  const [state, setState] = React.useState(() => {
    const s = loadStore();
    return { items: s.items||{}, custom: s.custom||[], confirms: s.confirms||{}, activity: s.activity||[], dayNotes: s.dayNotes||{} };
  });
  React.useEffect(() => { saveStore(state); }, [state]);

  const log = (text, user) => setState(s => ({ ...s, activity: [{ t: Date.now(), text, user }, ...s.activity].slice(0, 80) }));
  const patchItem = (id, patch, user) => setState(s => {
    const next = { ...s.items[id]||{}, ...patch, modifiedBy: user, modifiedAt: Date.now() };
    return { ...s, items: { ...s.items, [id]: next } };
  });
  const togglePin = (idea, user) => {
    const wasPinned = (state.items[idea.id]?.pinned) ?? !!idea.pinned;
    patchItem(idea.id, { pinned: !wasPinned }, user);
    log(`${wasPinned?"Unpinned":"Pinned"} "${idea.title}"`, user);
  };
  const assignToDay = (idea, date, user) => {
    patchItem(idea.id, { assigned: date }, user);
    log(`${date?`Assigned "${idea.title}" to ${date}`:`Removed "${idea.title}" from day plan`}`, user);
  };
  const setStatus = (idea, status, user) => {
    patchItem(idea.id, { status }, user);
    log(`Marked "${idea.title}" ${status}`, user);
  };
  const addCustom = (idea, user) => {
    const id = `custom-${Date.now().toString(36)}`;
    const o = { id, ...idea, by: user, custom: true, maps: idea.maps || `${idea.title}, ${window.TRIP_DATA.STOPS.find(s=>s.id===idea.stop)?.name}` };
    setState(s => ({ ...s, custom: [o, ...s.custom] }));
    log(`Added new idea "${idea.title}"`, user);
    return o;
  };
  const removeCustom = (id, user) => {
    setState(s => ({ ...s, custom: s.custom.filter(x => x.id !== id) }));
    log(`Removed a custom idea`, user);
  };
  const toggleConfirm = (id, user) => setState(s => {
    const next = !s.confirms[id];
    log(`${next?"Confirmed":"Reopened"} a checklist item`, user);
    return { ...s, confirms: { ...s.confirms, [id]: next } };
  });
  const setDayNote = (date, text, user) => setState(s => ({ ...s, dayNotes: { ...s.dayNotes, [date]: text } }));

  return { state, patchItem, togglePin, assignToDay, setStatus, addCustom, removeCustom, toggleConfirm, setDayNote, log };
}

function mergeIdea(idea, store) {
  const s = store.state.items[idea.id] || {};
  return { ...idea, pinned: s.pinned!==undefined?s.pinned:!!idea.pinned, assigned: s.assigned||null, status: s.status||"idea", modifiedBy: s.modifiedBy||null, addedBy: idea.by||"seed" };
}
function allIdeas(store) { return [...window.TRIP_DATA.IDEAS, ...store.state.custom]; }

// ============================================================
// Shared UI primitives
// ============================================================
function CategoryChip({ cat }) {
  return (
    <span className={`chip ${CAT_COLOR[cat]||"navy"}`}>
      <CatIcon cat={cat} size={11}/> {CAT_LABEL[cat]||cat}
    </span>
  );
}

function StarPin({ on, onClick }) {
  return (
    <button className={`star-btn ${on?"on":""}`} onClick={onClick} title={on?"Unpin":"Pin"}>
      <svg viewBox="0 0 16 16" fill={on?"currentColor":"none"} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M8 1.5l1.9 4 4.4.6-3.2 3.1.8 4.4L8 11.5l-3.9 2.1.8-4.4L1.7 6.1l4.4-.6z"/>
      </svg>
    </button>
  );
}

function StatusDot({ status }) {
  const C = { idea:"var(--rule)", shortlist:"var(--ochre)", booked:"var(--forest)", done:"var(--rust)", skip:"transparent" };
  return <span style={{ display:"inline-block", width:9, height:9, borderRadius:9, background:C[status]||C.idea, border:`1.5px solid ${status==="skip"?"var(--ink-mute)":"var(--ink)"}` }}/>;
}

function IdeaCard({ idea, stop, onPin, onOpen, dense }) {
  const status = idea.status || "idea";
  return (
    <article className="idea-card fade-up" onClick={e => { if (e.target.closest("button,a")) return; onOpen?.(idea); }}
      style={{ padding: dense ? "10px 12px" : "12px 14px", cursor: "pointer", position: "relative" }}>
      <header style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:5, minWidth:0, flex:1 }}>
          <div style={{ display:"flex", gap:5, alignItems:"center", flexWrap:"wrap" }}>
            <CategoryChip cat={idea.cat}/>
            {stop && <span className="mono" style={{ fontSize:10, color:"var(--ink-mute)" }}>{String(stop.n).padStart(2,"0")} · {stop.name}</span>}
            {idea.must && <span className="chip rust">MUST</span>}
            {idea.confirm && <span className="chip ochre">CONFIRM</span>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            <h3 style={{ margin:0, fontFamily:"var(--f-display)", fontSize:dense?16:20, lineHeight:1.0, color:"var(--ink)", textTransform:"uppercase", letterSpacing:"0.005em" }}>
              {idea.title}
            </h3>
            {idea.maps && <MapsLink query={idea.maps} compact />}
          </div>
          {idea.desc && <p style={{ margin:0, fontSize:13, color:"var(--ink-soft)", lineHeight:1.42 }}>{idea.desc}</p>}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:2, flexWrap:"wrap" }}>
            <Avatar user={idea.addedBy} size={18}/>
            {idea.modifiedBy && idea.modifiedBy!==idea.addedBy && <Avatar user={idea.modifiedBy} size={18}/>}
            {idea.assigned && <span className="chip forest"><span className="mono">{shortWeekday(idea.assigned)} {dayOfMonth(idea.assigned)}</span></span>}
            {status!=="idea" && (
              <span className="chip" style={{ background:"transparent", border:"1px solid var(--rule)" }}>
                <StatusDot status={status}/> <span style={{ marginLeft:4 }}>{status}</span>
              </span>
            )}
          </div>
        </div>
        <StarPin on={idea.pinned} onClick={e => { e.stopPropagation(); onPin?.(idea); }}/>
      </header>
    </article>
  );
}

function Section({ eyebrow, title, accent, right, children, decorate, id }) {
  return (
    <section id={id} style={{ marginBottom:36 }}>
      <header style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", gap:12, marginBottom:12, flexWrap:"wrap" }}>
        <div>
          {eyebrow && <div className="eyebrow" style={{ marginBottom:4 }}>{eyebrow}</div>}
          <h2 className="display section-h2" style={{ margin:0, fontSize:36, color:accent||"var(--ink)", lineHeight:0.95 }}>{title}</h2>
        </div>
        {right}
      </header>
      {decorate && <span className="park-rule thin" style={{ marginBottom:16 }}></span>}
      {children}
    </section>
  );
}

function Modal({ open, onClose, children, width = 560 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"color-mix(in oklab, var(--ink) 55%, transparent)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:20, backdropFilter:"blur(2px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:width, background:"var(--paper)", border:"1.5px solid var(--ink)", boxShadow:"8px 8px 0 var(--ink)", borderRadius:4, maxHeight:"85vh", overflow:"auto" }}>
        {children}
      </div>
    </div>
  );
}

function IdeaDetails({ idea, stop, onClose, onPin, onAssign, onStatus, onDelete, dates }) {
  if (!idea) return null;
  return (
    <Modal open={!!idea} onClose={onClose} width={620}>
      <div style={{ padding:"20px 24px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:12 }}>
          <div>
            <div className="eyebrow">{stop?.name} · {stop?.dates}</div>
            <div style={{ display:"flex", alignItems:"center", gap:8, margin:"6px 0 8px" }}>
              <h2 className="display" style={{ margin:0, fontSize:28, lineHeight:0.95 }}>{idea.title}</h2>
              {idea.maps && <MapsLink query={idea.maps} label="Google Maps"/>}
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <CategoryChip cat={idea.cat}/>
              {idea.must && <span className="chip rust">MUST</span>}
              {idea.confirm && <span className="chip ochre">CONFIRM</span>}
              {idea.date && <span className="chip navy">{shortWeekday(idea.date)} {dayOfMonth(idea.date)}{idea.time&&" · "+idea.time}</span>}
            </div>
          </div>
          <button className="btn ghost icon" onClick={onClose}>✕</button>
        </div>
        {idea.desc && <p style={{ margin:"8px 0 16px", color:"var(--ink-soft)", fontFamily:"var(--f-serif)", fontSize:16, lineHeight:1.45 }}>{idea.desc}</p>}
        <span className="park-rule thin" style={{ marginBottom:16 }}></span>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom:6 }}>Status</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {["idea","shortlist","booked","done","skip"].map(s => (
                <button key={s} className={`btn tiny ${idea.status===s?"primary":""}`} onClick={() => onStatus(idea,s)}>
                  <StatusDot status={s}/> <span style={{ marginLeft:4 }}>{s}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom:6 }}>Assign to a day</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <button className={`btn tiny ${!idea.assigned?"primary":""}`} onClick={() => onAssign(idea,null)}>none</button>
              {dates.filter(d => d.stop===stop?.id).map(d => (
                <button key={d.date} className={`btn tiny ${idea.assigned===d.date?"primary":""}`} onClick={() => onAssign(idea,d.date)}>
                  {shortWeekday(d.date)} {dayOfMonth(d.date)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6, flexWrap:"wrap", gap:8 }}>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span className="eyebrow">Added by</span>
              <Avatar user={idea.addedBy} size={22}/>
              <span style={{ color:"var(--ink-soft)", fontSize:13 }}>{USERS[idea.addedBy]?.name}</span>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn ghost tiny" onClick={() => onPin(idea)}>{idea.pinned?"Unpin":"Pin"}</button>
              {idea.custom && <button className="btn ghost tiny" onClick={() => { onDelete(idea); onClose(); }}>Delete</button>}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function AddIdeaModal({ open, onClose, onAdd, stops, defaultStop }) {
  const [stop, setStop] = React.useState(defaultStop||stops[0].id);
  const [title, setTitle] = React.useState("");
  const [cat, setCat] = React.useState("food");
  const [desc, setDesc] = React.useState("");
  React.useEffect(() => { if(open){ setTitle(""); setDesc(""); setStop(defaultStop||stops[0].id); setCat("food"); } }, [open,defaultStop]);
  const cats = ["food","drink","bar","sport","baseball","wnba","culture","museum","garden","park","view","run","market","dayout","music"];
  const submit = () => { if(!title.trim()) return; onAdd({ stop, title:title.trim(), cat, desc:desc.trim() }); onClose(); };
  return (
    <Modal open={open} onClose={onClose} width={560}>
      <div style={{ padding:"20px 24px 24px" }}>
        <div className="eyebrow">New idea</div>
        <h2 className="display" style={{ margin:"4px 0 16px", fontSize:28, lineHeight:0.95 }}>Add to the trip</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <label>
            <div className="eyebrow" style={{ marginBottom:4 }}>Title</div>
            <input value={title} onChange={e=>setTitle(e.target.value)} autoFocus placeholder="e.g. The Falcon's Cocktail Bar" style={inputStyle()}/>
          </label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <label>
              <div className="eyebrow" style={{ marginBottom:4 }}>Stop</div>
              <select value={stop} onChange={e=>setStop(e.target.value)} style={inputStyle()}>
                {stops.map(s => <option key={s.id} value={s.id}>{String(s.n).padStart(2,"0")} · {s.name} · {s.dates}</option>)}
              </select>
            </label>
            <label>
              <div className="eyebrow" style={{ marginBottom:4 }}>Category</div>
              <select value={cat} onChange={e=>setCat(e.target.value)} style={inputStyle()}>
                {cats.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
              </select>
            </label>
          </div>
          <label>
            <div className="eyebrow" style={{ marginBottom:4 }}>Notes</div>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} placeholder="What is it, where, why?" style={inputStyle()}/>
          </label>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:4 }}>
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={submit}>Add idea</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function inputStyle() {
  return { width:"100%", border:"1.5px solid var(--ink)", background:"var(--cream-warm)", color:"var(--ink)", padding:"8px 10px", fontFamily:"var(--f-body)", fontSize:14, borderRadius:2, outline:"none", boxShadow:"2px 2px 0 var(--ink)" };
}

function PosterSun({ size=240, hue="ochre", style={} }) {
  const rays=18, r=size/2-6, cx=size/2, cy=size/2, arr=[];
  for(let i=0;i<rays;i++){
    const a=(i/rays)*Math.PI*2;
    arr.push(<line key={i} x1={cx+Math.cos(a)*(r-18)} y1={cy+Math.sin(a)*(r-18)} x2={cx+Math.cos(a)*r} y2={cy+Math.sin(a)*r} stroke={`var(--${hue})`} strokeWidth="2" strokeLinecap="round"/>);
  }
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={style}>
    <circle cx={cx} cy={cy} r={r-20} stroke={`var(--${hue})`} strokeWidth="2" fill="none"/>
    {arr}
  </svg>;
}

function PosterMountains({ width=800, height=200, hue="forest", style={} }) {
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={style}>
      <path d={`M0 ${height} L0 ${height*.6} L${width*.18} ${height*.25} L${width*.32} ${height*.55} L${width*.45} ${height*.15} L${width*.62} ${height*.5} L${width*.78} ${height*.32} L${width} ${height*.55} L${width} ${height} Z`} fill={`var(--${hue})`}/>
      <path d={`M0 ${height} L0 ${height*.78} L${width*.22} ${height*.5} L${width*.4} ${height*.7} L${width*.55} ${height*.45} L${width*.7} ${height*.62} L${width*.88} ${height*.5} L${width} ${height*.72} L${width} ${height} Z`} fill={`color-mix(in oklab, var(--${hue}) 70%, var(--ink))`} opacity="0.85"/>
    </svg>
  );
}

Object.assign(window, {
  USERS, parseTripDateTime, shortWeekday, longWeekday, dayOfMonth, monthShort, diffToNow,
  mapsUrl, MapsLink,
  useStopWeather, WeatherIcon, StopWeatherWidget,
  Avatar, CatIcon, CAT_LABEL, CAT_COLOR,
  useTripStore, mergeIdea, allIdeas, useActiveUser,
  CategoryChip, StarPin, StatusDot,
  IdeaCard, IdeaDetails, AddIdeaModal, Modal, Section,
  PosterSun, PosterMountains, inputStyle,
  STORE_KEY,
});
