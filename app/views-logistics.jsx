/* Logistics view — drives, hotels (with addresses + maps), live weather, confirmations */

function HotelCard({ stop, drive }) {
  return (
    <article style={{
      background: "var(--paper)", border: "1.5px solid var(--ink)",
      boxShadow: "3px 3px 0 var(--ink)", borderRadius: 4, overflow: "hidden",
    }}>
      {/* Stop header */}
      <div style={{
        background: "var(--ink)", color: "var(--cream-warm)",
        padding: "12px 16px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -8, top: -12, fontFamily: "var(--f-display)", fontSize: 100, color: "color-mix(in oklab, var(--cream-warm) 7%, transparent)", fontWeight: 800, lineHeight: 1, pointerEvents: "none" }}>
          {String(stop.n).padStart(2, "0")}
        </div>
        <div style={{ position: "relative" }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.2em", opacity: 0.65, textTransform: "uppercase" }}>{stop.dates} · {stop.region}</div>
          <div className="display" style={{ fontSize: 30, lineHeight: 0.95, margin: "4px 0 2px" }}>{stop.name}</div>
          <div style={{ fontFamily: "var(--f-serif)", fontSize: 12, fontStyle: "italic", opacity: 0.8 }}>{stop.tagline}</div>
        </div>
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Hotel block */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 5 }}>Hotel</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 17, textTransform: "uppercase", letterSpacing: "0.005em", lineHeight: 1.1 }}>{stop.hotel}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "var(--ink-soft)", fontFamily: "var(--f-serif)" }}>{stop.hotel_address}</span>
                <MapsLink query={stop.hotel_maps} label="Open in Maps" />
              </div>
              {stop.hotel_note && (
                <div style={{ marginTop: 6, padding: "6px 8px", background: "var(--bg-deep)", borderRadius: 2, fontSize: 12, color: "var(--ink-soft)", fontStyle: "italic", fontFamily: "var(--f-serif)" }}>
                  {stop.hotel_note}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drive in */}
        {drive && (
          <div style={{ borderTop: "1px dashed var(--rule)", paddingTop: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 5 }}>Getting there</div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>{drive.mode === "drive" ? "🚙" : "🚌"}</span>
              <div>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.01em" }}>
                  {drive.mode === "drive" ? "Drive" : "Bus"} · {drive.duration_h}h · {drive.distance_km} km
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)", fontFamily: "var(--f-serif)", fontStyle: "italic", marginTop: 2 }}>{drive.note}</div>
              </div>
            </div>
          </div>
        )}

        {/* Live weather forecast */}
        <div style={{ borderTop: "1px dashed var(--rule)", paddingTop: 12 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Forecast</div>
          <StopWeatherWidget stop={stop} />
        </div>
      </div>
    </article>
  );
}

function ConfirmationsList({ store, user }) {
  const all = window.TRIP_DATA.CONFIRMATIONS;
  const done = all.filter(c => store.state.confirms[c.id]).length;
  return (
    <div style={{
      background: "var(--paper)", border: "1.5px solid var(--ink)",
      boxShadow: "4px 4px 0 var(--ink)", borderRadius: 4, padding: 18,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <div>
          <div className="eyebrow">Confirm before you go</div>
          <h3 className="display" style={{ margin: "4px 0 0", fontSize: 26, lineHeight: 0.95 }}>Bookings &amp; Confirms</h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>{done}</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-mute)", lineHeight: 1.3 }}>of {all.length}<br/>done</div>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ height: 4, background: "var(--rule)", borderRadius: 2, margin: "10px 0 14px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(done/all.length)*100}%`, background: "var(--forest)", transition: "width .3s ease", borderRadius: 2 }}></div>
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
        {all.map(c => {
          const checked = !!store.state.confirms[c.id];
          return (
            <li key={c.id} onClick={() => store.toggleConfirm(c.id, user)} style={{
              display: "flex", gap: 10, alignItems: "center",
              padding: "10px 6px", borderBottom: "1px dashed var(--rule)",
              cursor: "pointer", opacity: checked ? 0.5 : 1,
              transition: "opacity .15s",
            }}>
              <div style={{
                width: 22, height: 22, border: "1.5px solid var(--ink)", flexShrink: 0,
                background: checked ? "var(--forest)" : "var(--paper)", color: "var(--cream-warm)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {checked && <svg width="13" height="13" viewBox="0 0 16 16"><path d="M3 8.5L7 12L13 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontFamily: "var(--f-serif)", color: "var(--ink)", textDecoration: checked ? "line-through" : "none" }}>{c.text}</div>
                <a href={`https://${c.where}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                  className="mono" style={{ fontSize: 10, color: "var(--sky)", textDecoration: "none" }}>
                  {c.where}
                </a>
              </div>
              <Avatar user={user} size={16} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FlightsBlock() {
  return (
    <div style={{
      background: "color-mix(in oklab, var(--navy) 8%, var(--paper))",
      border: "1.5px solid var(--navy)", borderLeft: "5px solid var(--navy)",
      padding: "14px 16px", borderRadius: 2,
    }}>
      <div className="eyebrow" style={{ color: "var(--navy)" }}>Transfers</div>
      <div className="display" style={{ fontSize: 22, lineHeight: 0.95, color: "var(--navy)", margin: "4px 0 12px" }}>Flights, buses &amp; car</div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, fontFamily: "var(--f-serif)", fontSize: 13, color: "var(--ink-soft)", display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          ["FRI 12 JUN", "Arrive Vancouver YVR · taxi/SkyTrain to OPUS in Yaletown", "YVR International Airport, Vancouver BC"],
          ["SUN 14 JUN", "Cross-border bus to Seattle · ~3.5 h · passports out", "Pacific Coach Lines Vancouver to Seattle"],
          ["TUE 16 JUN", "Pick up rental car (Seattle area) · keep through 25 Jun", null],
          ["THU 25 JUN", "Drop rental in San Jose · check Levi's traffic buffer", "Levi's Stadium, Santa Clara CA"],
          ["FRI 26 JUN", "Will: SJC 22:00 departure · Andy: TBD", "San Jose International Airport, CA"],
        ].map(([date, text, maps]) => (
          <li key={date} style={{ display: "flex", gap: 8, alignItems: "flex-start", paddingBottom: 8, borderBottom: "1px dashed color-mix(in oklab, var(--navy) 15%, transparent)" }}>
            <span className="display" style={{ fontSize: 12, lineHeight: 1.3, color: "var(--navy)", flexShrink: 0, width: 82 }}>{date}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ color: date.includes("26 JUN") ? "var(--rust-deep)" : "var(--ink-soft)" }}>{text}</span>
              {maps && <span style={{ marginLeft: 6 }}><MapsLink query={maps} compact /></span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PracticalNotesBlock() {
  return (
    <div style={{
      background: "var(--paper)", border: "1.5px solid var(--ink)",
      boxShadow: "4px 4px 0 var(--ink)", borderRadius: 4, padding: 16,
    }}>
      <div className="eyebrow">Heads-up</div>
      <h3 className="display" style={{ margin: "4px 0 12px", fontSize: 22, lineHeight: 0.95 }}>Don't forget</h3>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, fontFamily: "var(--f-serif)", fontSize: 13, color: "var(--ink-soft)", display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          "🛂 Passports + ESTA / Canada eTA for cross-border bus on 14 Jun",
          "⚽ Vancouver match day: Stadium–Chinatown SkyTrain CLOSED. Use Main Street–Science World.",
          "🏨 SeaTac + San Jose hotels — bland locations. Uber out for food & drink.",
          "🏔️ Crater Lake at ~7,100 ft. Hydrate, go easy on runs. Snow on trail edges.",
          "🗺️ Olympic NP & Crater Lake — patchy signal. Download offline maps.",
          "🎟️ MLS is paused 25 May–16 Jul. No Timbers/Sounders/Whitecaps home games.",
        ].map(t => (
          <li key={t} style={{ paddingBottom: 6, borderBottom: "1px dashed var(--rule)" }}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

function LogisticsView({ stops, drives, store, user }) {
  const driveByStop = {};
  drives.forEach(d => { driveByStop[d.to] = d; });

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Section eyebrow="Operations &amp; details" title="Logistics" decorate />

      {/* Hotel cards: 2-up on desktop, 1-up on mobile */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 20 }}>
        {stops.map(s => <HotelCard key={s.id} stop={s} drive={driveByStop[s.id]} />)}
      </div>

      {/* Flights & transfers */}
      <div style={{ maxWidth: 680 }}>
        <FlightsBlock />
      </div>
    </div>
  );
}

Object.assign(window, { LogisticsView, HotelCard, ConfirmationsList, FlightsBlock });
