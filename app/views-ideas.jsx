/* Ideas view — by stop, filterable */

function CatFilter({ active, counts, onPick }) {
  const order = ["all","food","drink","bar","sport","baseball","wnba","culture","museum","garden","park","view","run","market","dayout","music"];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
      {order.filter(c => c === "all" || counts[c]).map(c => (
        <button key={c} className={`btn tiny ${active === c ? "primary" : "ghost"}`} onClick={() => onPick(c)}>
          {c === "all" ? "All" : (<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><CatIcon cat={c} size={12} /> {CAT_LABEL[c]}</span>)}
          <span className="mono" style={{ marginLeft: 6, opacity: 0.7, fontSize: 10 }}>{c === "all" ? counts.total : (counts[c] || 0)}</span>
        </button>
      ))}
    </div>
  );
}

function StopJump({ stops, activeStop, onPick }) {
  return (
    <div className="r-stop-jump">
      <div style={{
        background: "var(--paper)", border: "1.5px solid var(--ink)",
        boxShadow: "4px 4px 0 var(--ink)", borderRadius: 4, padding: 14,
      }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Jump to stop</div>
        <ul className="jump-list" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {stops.map(s => (
            <li key={s.id}>
              <button onClick={() => onPick(s.id)} style={{
                width: "100%", textAlign: "left", padding: "6px 8px",
                background: activeStop === s.id ? "var(--ink)" : "transparent",
                color: activeStop === s.id ? "var(--cream-warm)" : "var(--ink)",
                border: "1px solid transparent",
                cursor: "pointer", borderRadius: 2,
                display: "flex", gap: 8, alignItems: "center",
              }}>
                <span className="mono" style={{ fontSize: 10, opacity: 0.7, width: 18 }}>{String(s.n).padStart(2,"0")}</span>
                <span style={{ fontFamily: "var(--f-display)", fontSize: 16, textTransform: "uppercase" }}>{s.name}</span>
                <span className="mono" style={{ fontSize: 10, opacity: 0.6, marginLeft: "auto" }}>{s.dates.split("–")[0]}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StopSection({ stop, ideas, store, onOpenIdea, onPin, onAdd, filter, query }) {
  const filtered = ideas
    .filter(i => filter === "all" || i.cat === filter)
    .filter(i => !query || (i.title + " " + (i.desc || "")).toLowerCase().includes(query.toLowerCase()));

  // Sort: pinned first, then must, then by category
  filtered.sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned - a.pinned;
    if (a.must !== b.must) return (b.must ? 1 : 0) - (a.must ? 1 : 0);
    return (a.cat || "").localeCompare(b.cat || "");
  });

  return (
    <section id={`stop-${stop.id}`} style={{ marginBottom: 40, scrollMarginTop: 100 }}>
      <header style={{
        background: "var(--ink)", color: "var(--cream-warm)",
        border: "1.5px solid var(--ink)", boxShadow: "4px 4px 0 var(--ochre)",
        padding: "14px 18px", borderRadius: 2,
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", left: -10, bottom: -22, fontFamily: "var(--f-display)", fontSize: 140, color: "color-mix(in oklab, var(--cream-warm) 8%, transparent)", fontWeight: 800, lineHeight: 1 }}>
          {String(stop.n).padStart(2,"0")}
        </div>
        <div style={{ position: "relative" }}>
          <div className="mono" style={{ fontSize: 10, opacity: 0.7, letterSpacing: 0.2 + "em" }}>{stop.dates} · {stop.region}</div>
          <h2 className="display" style={{ margin: "4px 0 0", fontSize: 36, lineHeight: 0.95 }}>{stop.name}</h2>
          <div className="serif" style={{ fontSize: 13, marginTop: 4, fontStyle: "italic", opacity: 0.85 }}>{stop.tagline}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
          <div className="mono" style={{ fontSize: 11, opacity: 0.7, textAlign: "right" }}>
            {filtered.length} idea{filtered.length === 1 ? "" : "s"}
          </div>
          <button className="btn tiny" style={{ background: "var(--ochre)", color: "var(--ink)" }} onClick={() => onAdd(stop.id)}>+ Add</button>
        </div>
      </header>

      <div style={{ background: "color-mix(in oklab, var(--paper) 70%, transparent)", border: "1px solid var(--rule)", padding: "10px 14px", marginBottom: 14, borderRadius: 2, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span className="eyebrow">Hotel</span>
        <span style={{ fontFamily: "var(--f-serif)", fontSize: 14, color: "var(--ink)" }}>{stop.hotel}</span>
        <span style={{ fontSize: 12, color: "var(--ink-mute)", flex: 1, minWidth: 200 }}>· {stop.hotel_note}</span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: "16px 14px", border: "1px dashed var(--rule)", borderRadius: 2, color: "var(--ink-mute)", fontSize: 13 }}>
          No matching ideas at this stop. Try a different filter or add one with <strong>+ Add</strong>.
        </div>
      ) : (
        <div className="r-cards-grid">
          {filtered.map(i => {
            return <IdeaCard key={i.id} idea={i} stop={stop} onPin={onPin} onOpen={onOpenIdea} />;
          })}
        </div>
      )}
    </section>
  );
}

function IdeasView({ stops, store, onOpenIdea, onAddCustom, user }) {
  const [filter, setFilter] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [activeStop, setActiveStop] = React.useState(null);

  const ideas = allIdeas(store).map(i => mergeIdea(i, store));

  // Counts for filter
  const counts = { total: ideas.length };
  ideas.forEach(i => { counts[i.cat] = (counts[i.cat] || 0) + 1; });

  // Build group by stop
  const groupedByStop = stops.map(s => ({
    stop: s,
    ideas: ideas.filter(i => i.stop === s.id),
  }));

  const onPin = (idea) => store.togglePin(idea, user);

  const jumpTo = (id) => {
    setActiveStop(id);
    const el = document.getElementById(`stop-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="fade-up r-ideas-grid">
      <StopJump stops={stops} activeStop={activeStop} onPick={jumpTo} />
      <div>
        <Section eyebrow={`${ideas.length} ideas across ${stops.length} stops`} title="Ideas" decorate
          right={(
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search ideas…"
                style={{ ...inputStyle(), width: 220, boxShadow: "1.5px 1.5px 0 var(--ink)" }}
              />
            </div>
          )}>
          <CatFilter active={filter} counts={counts} onPick={setFilter} />
        </Section>

        {groupedByStop.map(g => (
          <StopSection
            key={g.stop.id} stop={g.stop} ideas={g.ideas}
            store={store} onOpenIdea={onOpenIdea} onPin={onPin}
            onAdd={onAddCustom} filter={filter} query={query}
          />
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { IdeasView, StopSection, StopJump, CatFilter });
