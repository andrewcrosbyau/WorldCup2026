/* WC2026 Trip Planner — main app shell */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "ranger",         // ranger | crater | redwood | sunset
  "fontPair": "ranger",        // ranger | souvenir | editorial
  "cardStyle": "poster",       // poster | soft | stamp
}/*EDITMODE-END*/;

const TABS = [
  { id: "home", label: "Home", icon: "home" },
  { id: "route", label: "Route", icon: "route" },
  { id: "itinerary", label: "Itinerary", icon: "calendar" },
  { id: "ideas", label: "Ideas", icon: "spark" },
  { id: "logistics", label: "Logistics", icon: "gear" },
];

function NavIcon({ kind, size = 14 }) {
  const p = { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (kind) {
    case "home": return <svg {...p}><path d="M2 8l6-5 6 5M4 7v7h8V7" /></svg>;
    case "route": return <svg {...p}><path d="M3 13c0-3 3-3 5-5s-1-5 2-5 3 5 5 5" /><circle cx="3" cy="13" r="1.2" /><circle cx="13" cy="13" r="1.2" /></svg>;
    case "calendar": return <svg {...p}><rect x="2" y="3" width="12" height="11" rx="0.5" /><path d="M2 6h12M5 1.5v3M11 1.5v3" /></svg>;
    case "spark": return <svg {...p}><path d="M8 2v12M2 8h12M3.5 3.5l9 9M12.5 3.5l-9 9" /></svg>;
    case "gear": return <svg {...p}><circle cx="8" cy="8" r="2.2" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" /></svg>;
    default: return null;
  }
}

function UserSwitcher({ activeUser, onChange }) {
  return (
    <div style={{ display: "inline-flex", gap: 4, alignItems: "center", border: "1.5px solid var(--ink)", borderRadius: 999, padding: 3, background: "var(--paper)", boxShadow: "2px 2px 0 var(--ink)" }}>
      {["will", "andy"].map(u => (
        <button key={u} onClick={() => onChange(u)} title={`Sign in as ${USERS[u].name}`}
          style={{
            display: "inline-flex", gap: 6, alignItems: "center",
            padding: activeUser === u ? "4px 10px 4px 4px" : "4px",
            background: activeUser === u ? USERS[u].color : "transparent",
            color: activeUser === u ? "var(--cream-warm)" : "var(--ink-soft)",
            border: "none", borderRadius: 999, cursor: "pointer",
            fontFamily: "var(--f-display)", fontSize: 13, letterSpacing: 0.05 + "em", textTransform: "uppercase",
          }}>
          <Avatar user={u} size={22} ring={false} />
          {activeUser === u && USERS[u].name}
        </button>
      ))}
    </div>
  );
}

function Header({ tab, onTab, activeUser, onChangeUser }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "var(--bg)", backdropFilter: "blur(4px)",
      borderBottom: "1.5px solid var(--ink)",
    }}>
      <div className="r-app-header">
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 44, height: 44, background: "var(--rust)", color: "var(--cream-warm)",
            border: "1.5px solid var(--ink)", boxShadow: "2px 2px 0 var(--ink)",
            display: "grid", placeItems: "center", borderRadius: 4, position: "relative", overflow: "hidden",
          }}>
            <span style={{ fontFamily: "var(--f-display)", fontSize: 18, lineHeight: 1, fontWeight: 800 }}>WC</span>
            <span className="mono" style={{ position: "absolute", bottom: 2, right: 4, fontSize: 8, letterSpacing: 0.05 + "em", opacity: 0.85 }}>26</span>
          </div>
          <div>
            <div className="header-wordmark-text" style={{ fontFamily: "var(--f-display)", fontSize: 24, lineHeight: 0.95, letterSpacing: "0.005em", textTransform: "uppercase" }}>West Coast</div>
            <div className="mono header-sub" style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--ink-mute)", textTransform: "uppercase" }}>12–26 Jun 2026 · Will &amp; Andy</div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="r-tabs">
          {TABS.map(t => (
            <button key={t.id} onClick={() => onTab(t.id)}
              style={{
                background: tab === t.id ? "var(--ink)" : "transparent",
                color: tab === t.id ? "var(--cream-warm)" : "var(--ink-soft)",
              }}>
              <NavIcon kind={t.icon} size={14} />
              <span className="nav-label">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* User switcher */}
        <UserSwitcher activeUser={activeUser} onChange={onChangeUser} />
      </div>

      <span className="park-rule" style={{ display: "block" }}></span>
    </header>
  );
}

function FloatingAddButton({ onClick }) {
  return (
    <button onClick={onClick} title="Add a new idea" style={{
      position: "fixed", right: 24, bottom: 24, zIndex: 40,
      background: "var(--rust)", color: "var(--cream-warm)",
      border: "1.5px solid var(--ink)", boxShadow: "4px 4px 0 var(--ink)",
      width: 56, height: 56, borderRadius: 999, fontSize: 28, cursor: "pointer",
      display: "grid", placeItems: "center", padding: 0, fontFamily: "var(--f-display)",
      transition: "transform .1s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translate(-2px,-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "none"}
    >
      <span style={{ marginTop: -4 }}>+</span>
    </button>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "32px 28px 60px", maxWidth: 1320, margin: "0 auto", color: "var(--ink-mute)" }}>
      <span className="park-rule double" style={{ margin: "16px 0 18px", display: "block" }}></span>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 0.15 + "em", textTransform: "uppercase" }}>WC2026 · West Coast Trip Planner · Made for Will & Andy</div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 0.15 + "em" }}>Vancouver → Seattle → Olympic → Portland → Crater Lake → Napa → SF</div>
      </div>
    </footer>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [activeUser, setActiveUser] = useActiveUser();
  const [tab, setTab] = React.useState(() => {
    const h = (location.hash || "").replace("#", "");
    return TABS.some(x => x.id === h) ? h : "home";
  });
  React.useEffect(() => { location.hash = "#" + tab; }, [tab]);

  const store = useTripStore();

  const stops = window.TRIP_DATA.STOPS;
  const matches = window.TRIP_DATA.MATCHES;
  const drives = window.TRIP_DATA.DRIVES;
  const days = window.TRIP_DATA.DAYS;

  const [openIdea, setOpenIdea] = React.useState(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [addStop, setAddStop] = React.useState(null);

  const onOpenIdea = (idea) => setOpenIdea(idea);
  const onAddCustomFor = (stopId) => { setAddStop(stopId); setAddOpen(true); };

  const onGoto = (newTab) => { setTab(newTab); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // Compute live merged idea for the modal so it reflects state
  const openIdeaLive = openIdea ? mergeIdea(allIdeas(store).find(i => i.id === openIdea.id) || openIdea, store) : null;
  const openStop = openIdeaLive ? stops.find(s => s.id === openIdeaLive.stop) : null;

  // Apply palette and pair classes on root
  const rootClass = [
    `palette-${t.palette}`,
    `pair-${t.fontPair}`,
    `cards-${t.cardStyle}`,
  ].join(" ");

  return (
    <div className={rootClass}>
      <Header tab={tab} onTab={onGoto} activeUser={activeUser} onChangeUser={setActiveUser} />

      <main className="r-main-pad">
        {tab === "home" && (
          <HomeView store={store} stops={stops} matches={matches} onOpenIdea={onOpenIdea}
            onGoto={onGoto} activeUser={activeUser} />
        )}
        {tab === "route" && (
          <RouteView stops={stops} drives={drives} matches={matches} store={store}
            onOpenStop={(id) => { setTab("ideas"); setTimeout(() => {
              const el = document.getElementById(`stop-${id}`);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 60); }} />
        )}
        {tab === "itinerary" && (
          <ItineraryView stops={stops} days={days} drives={drives} matches={matches}
            store={store} onOpenIdea={onOpenIdea}
            onPick={(id) => { setTab("ideas"); setTimeout(() => {
              const el = document.getElementById(`stop-${id}`);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 60); }}
            user={activeUser} />
        )}
        {tab === "ideas" && (
          <IdeasView stops={stops} store={store}
            onOpenIdea={onOpenIdea} onAddCustom={onAddCustomFor}
            user={activeUser} />
        )}
        {tab === "logistics" && (
          <LogisticsView stops={stops} drives={drives} store={store} user={activeUser} />
        )}
      </main>

      <Footer />

      <FloatingAddButton onClick={() => { setAddStop(null); setAddOpen(true); }} />

      {/* Modals */}
      <IdeaDetails
        idea={openIdeaLive} stop={openStop}
        onClose={() => setOpenIdea(null)}
        onPin={(i) => store.togglePin(i, activeUser)}
        onAssign={(i, d) => store.assignToDay(i, d, activeUser)}
        onStatus={(i, s) => store.setStatus(i, s, activeUser)}
        onDelete={(i) => store.removeCustom(i.id, activeUser)}
        dates={days}
      />

      <AddIdeaModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(idea) => store.addCustom(idea, activeUser)}
        stops={stops}
        defaultStop={addStop}
      />

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Color theme" />
        <TweakRadio label="Palette" value={t.palette}
          options={[
            { label: "Ranger", value: "ranger" },
            { label: "Crater", value: "crater" },
            { label: "Redwood", value: "redwood" },
            { label: "Sunset", value: "sunset" },
          ]}
          onChange={(v) => setTweak('palette', v)} />

        <TweakSection label="Typography" />
        <TweakRadio label="Font pair" value={t.fontPair}
          options={[
            { label: "Ranger", value: "ranger" },
            { label: "Souvenir", value: "souvenir" },
            { label: "Editorial", value: "editorial" },
          ]}
          onChange={(v) => setTweak('fontPair', v)} />

        <TweakSection label="Idea card style" />
        <TweakRadio label="Card" value={t.cardStyle}
          options={[
            { label: "Poster", value: "poster" },
            { label: "Soft", value: "soft" },
            { label: "Stamp", value: "stamp" },
          ]}
          onChange={(v) => setTweak('cardStyle', v)} />

        <TweakSection label="Trip controls" />
        <TweakButton label="Reset trip data" onClick={() => {
          if (confirm("Reset everything? Pins, day assignments, custom ideas, confirmations & notes will be cleared.")) {
            localStorage.removeItem(STORE_KEY); location.reload();
          }
        }} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
