/* Route view — stylized 70s park-poster map of the route */

function RouteMap({ stops, drives, matches, activeStop, onPick }) {
  // map viewBox: 100x100. Stops have map.x / map.y.
  // Draw a stylized coastline silhouette + topographic-ish lines + numbered pins + route polyline.
  const W = 100, H = 100;

  // Smooth Bezier path through stop points (for the route)
  const pts = stops.map(s => s.map);
  let routeD = "";
  pts.forEach((p, i) => {
    if (i === 0) routeD += `M ${p.x} ${p.y}`;
    else {
      const prev = pts[i-1];
      const midY = (prev.y + p.y) / 2;
      routeD += ` C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
    }
  });

  // Stylized coastline (decorative, not geographically accurate)
  const coastD = "M 10 4 Q 12 14, 10 20 Q 6 28, 14 34 Q 22 40, 16 48 Q 8 56, 16 64 Q 22 72, 18 80 Q 14 90, 24 96 L 24 100 L 0 100 L 0 4 Z";

  // Inland topo curves
  const topo = [
    "M 50 5 Q 60 30, 55 55 Q 50 80, 60 100",
    "M 65 10 Q 75 35, 70 60 Q 65 85, 72 100",
    "M 80 0 Q 88 30, 82 60 Q 78 90, 85 100",
  ];

  return (
    <div style={{
      background: "var(--cream-warm)", border: "1.5px solid var(--ink)",
      boxShadow: "6px 6px 0 var(--ink)", borderRadius: 4, padding: 18,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 12 }}>
        <div>
          <div className="eyebrow">A → B</div>
          <h2 className="display" style={{ margin: "4px 0 0", fontSize: 30, lineHeight: 0.95 }}>The Route</h2>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 2 }}>Vancouver → San Jose · 14 days · ≈2,000 km</div>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span className="chip" style={{ background: "transparent", border: "1px solid var(--rule)" }}><span style={{ display: "inline-block", width: 8, height: 8, background: "var(--rust)", borderRadius: 8, marginRight: 4 }}></span>Stop</span>
          <span className="chip" style={{ background: "transparent", border: "1px solid var(--rule)" }}><span style={{ display: "inline-block", width: 12, height: 2, background: "var(--ink)", marginRight: 4 }}></span>Drive</span>
          <span className="chip" style={{ background: "transparent", border: "1px solid var(--rule)" }}>⚽ Match</span>
        </div>
      </div>

      <div className="r-route-grid">
        {/* Map */}
        <div style={{ background: "var(--paper)", border: "1.5px solid var(--ink)", borderRadius: 2, padding: 10, position: "relative" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", aspectRatio: "1 / 1.05", display: "block" }} preserveAspectRatio="xMidYMid meet">
            {/* Sea/coast */}
            <rect x="0" y="0" width={W} height={H} fill="var(--paper)" />
            <path d={coastD} fill="color-mix(in oklab, var(--sky) 35%, var(--paper))" stroke="var(--ink)" strokeWidth="0.4" opacity="0.6" />
            {/* Topo lines */}
            {topo.map((d, i) => <path key={i} d={d} stroke="var(--rule)" strokeWidth="0.3" fill="none" strokeDasharray="0.5 1" opacity="0.6" />)}

            {/* Country border line (US/CA) */}
            <line x1="0" y1="11" x2={W} y2="11" stroke="var(--ink)" strokeWidth="0.25" strokeDasharray="1.5 1" opacity="0.45" />
            <text x="98" y="9.5" fontSize="2.2" textAnchor="end" fill="var(--ink-mute)" fontFamily="var(--f-mono)" letterSpacing="0.05em">CANADA</text>
            <text x="98" y="13.8" fontSize="2.2" textAnchor="end" fill="var(--ink-mute)" fontFamily="var(--f-mono)" letterSpacing="0.05em">USA</text>

            {/* OR/CA border */}
            <line x1="0" y1="65" x2={W} y2="65" stroke="var(--ink)" strokeWidth="0.2" strokeDasharray="1 1" opacity="0.3" />
            <text x="98" y="63.8" fontSize="2" textAnchor="end" fill="var(--ink-mute)" fontFamily="var(--f-mono)" letterSpacing="0.05em">OREGON</text>
            <text x="98" y="68" fontSize="2" textAnchor="end" fill="var(--ink-mute)" fontFamily="var(--f-mono)" letterSpacing="0.05em">CALIFORNIA</text>

            {/* Route line */}
            <path d={routeD} stroke="var(--ink)" strokeWidth="0.7" fill="none" strokeDasharray="0.6 0.7" strokeLinecap="round" />

            {/* Stops */}
            {stops.map((s) => {
              const hasMatch = matches.some(m => m.stop === s.id);
              const active = activeStop === s.id;
              return (
                <g key={s.id} style={{ cursor: "pointer" }} onClick={() => onPick(s.id)}>
                  <circle cx={s.map.x} cy={s.map.y} r={active ? 3.6 : 2.6}
                    fill={hasMatch ? "var(--rust)" : "var(--paper)"}
                    stroke="var(--ink)" strokeWidth="0.5" />
                  <text x={s.map.x} y={s.map.y + 0.9} fontSize="2.6" textAnchor="middle"
                    fill={hasMatch ? "var(--cream-warm)" : "var(--ink)"} fontFamily="var(--f-display)" fontWeight="800">
                    {s.n}
                  </text>
                  <text x={s.map.x + 4} y={s.map.y + 1.3} fontSize={active ? 3.2 : 2.8}
                    fill="var(--ink)" fontFamily="var(--f-display)" textTransform="uppercase" letterSpacing="0.02em">
                    {s.name.toUpperCase()}
                  </text>
                  <text x={s.map.x + 4} y={s.map.y + 4.4} fontSize="1.9"
                    fill="var(--ink-mute)" fontFamily="var(--f-mono)" letterSpacing="0.05em">
                    {s.dates}
                  </text>
                </g>
              );
            })}

            {/* Tournament badge */}
            <g transform="translate(78,87)">
              <circle r="6" fill="var(--rust)" stroke="var(--ink)" strokeWidth="0.4" />
              <text y="0.3" fontSize="1.6" textAnchor="middle" fill="var(--cream-warm)" fontFamily="var(--f-mono)" letterSpacing="0.1em">WC</text>
              <text y="3" fontSize="2.6" textAnchor="middle" fill="var(--cream-warm)" fontFamily="var(--f-display)" fontWeight="800">2026</text>
            </g>
          </svg>
        </div>

        {/* Right rail: drives */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Travel legs</div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
            {drives.map((d, i) => {
              const from = stops.find(s => s.id === d.from);
              const to = stops.find(s => s.id === d.to);
              return (
                <li key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px dashed var(--rule)" }}>
                  <div style={{ width: 28, textAlign: "center" }}>
                    <div className="display" style={{ fontSize: 14 }}>{from.n}<span style={{ color: "var(--ink-mute)" }}>·</span>{to.n}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 14, textTransform: "uppercase", letterSpacing: 0.005 + "em" }}>
                      {from.name} → {to.name}
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                      {d.mode === "drive" ? "🚙" : "🚌"} {d.duration_h}h · {d.distance_km} km
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4, fontFamily: "var(--f-serif)" }}>{d.note}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Stop strip — list of all 8 stops with key facts
function StopStrip({ stops, matches, store, onPick }) {
  return (
    <Section eyebrow="08 stops" title="The Itinerary Spine" decorate>
      <div className="r-cards-grid">
        {stops.map(s => {
          const sMatches = matches.filter(m => m.stop === s.id);
          const ideaCount = allIdeas(store).filter(i => i.stop === s.id).length;
          const pinned = allIdeas(store).map(i => mergeIdea(i, store)).filter(i => i.stop === s.id && i.pinned).length;
          return (
            <div key={s.id} onClick={() => onPick(s.id)} style={{
              padding: "16px 18px", background: "var(--paper)",
              border: "1.5px solid var(--ink)", boxShadow: "3px 3px 0 var(--ink)", borderRadius: 4,
              cursor: "pointer", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -12, right: -12, fontFamily: "var(--f-display)", fontSize: 120, color: "color-mix(in oklab, var(--ink) 4%, transparent)", fontWeight: 800, lineHeight: 1 }}>
                {String(s.n).padStart(2,"0")}
              </div>
              <div style={{ position: "relative" }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: 0.18 + "em" }}>{s.dates}</div>
                <div className="display" style={{ fontSize: 28, lineHeight: 0.95, margin: "4px 0 4px" }}>{s.name}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{s.region}</div>
                <p style={{ margin: "8px 0 10px", fontFamily: "var(--f-serif)", fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.4 }}>{s.tagline}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {sMatches.map(m => <span key={m.id} className="chip rust" title={`${m.home} v ${m.away}`}>⚽ {m.away === "Australia" ? `v ${m.home}` : `${m.home} v ${m.away}`}</span>)}
                  <span className="chip">{ideaCount} ideas</span>
                  {pinned > 0 && <span className="chip ochre">★ {pinned}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function RouteView({ stops, drives, matches, store, onOpenStop }) {
  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <RouteMap stops={stops} drives={drives} matches={matches} onPick={onOpenStop} />
      <StopStrip stops={stops} matches={matches} store={store} onPick={onOpenStop} />
    </div>
  );
}

Object.assign(window, { RouteView, RouteMap, StopStrip });
