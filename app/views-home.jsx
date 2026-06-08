/* Home view: countdown + today's plan + dashboard */

function Countdown({ target, label, sub }) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const d = diffToNow(target);
  const segs = [
    { v: d.days, l: "Days" },
    { v: d.hours, l: "Hours" },
    { v: d.minutes, l: "Mins" },
    { v: d.seconds, l: "Secs" },
  ];
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 6 }}>{d.past ? "Kicked off" : "Kickoff in"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
        {segs.map(s => (
          <div key={s.l} style={{
            border: "1.5px solid var(--ink)", background: "var(--paper)",
            boxShadow: "3px 3px 0 var(--ink)", padding: "10px 6px 6px",
            textAlign: "center", borderRadius: 2,
          }}>
            <div className="display countdown-num" style={{ fontSize: 44, lineHeight: 0.9, color: "var(--ink)", fontWeight: 800 }}>{String(s.v).padStart(2, "0")}</div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 0.18 + "em", color: "var(--ink-mute)", marginTop: 4, textTransform: "uppercase" }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", fontFamily: "var(--f-serif)" }}>{label} <em>· {sub}</em></div>
    </div>
  );
}

function nextMatch(matches) {
  const now = Date.now();
  const sorted = matches.map(m => ({ ...m, _at: parseTripDateTime(m.date, m.time) }))
    .sort((a, b) => a._at - b._at);
  return sorted.find(m => m._at.getTime() > now) || sorted[sorted.length - 1];
}

function todayInTrip() {
  // For this prototype: if current date is before trip, "today" is undefined; otherwise return the trip day matching current PT date.
  const days = window.TRIP_DATA.DAYS;
  const tripStart = parseTripDateTime(days[0].date, "00:00");
  const tripEnd   = parseTripDateTime(days[days.length-1].date, "23:59");
  const now = new Date();
  if (now < tripStart) return { mode: "pre", target: days[0] };
  if (now > tripEnd) return { mode: "post", target: days[days.length-1] };
  // figure out which trip day matches today's PT date
  const ptStr = new Date(now.getTime() + (TRIP_TZ_OFFSET_MIN + now.getTimezoneOffset()) * 60_000).toISOString().slice(0,10);
  const today = days.find(d => d.date === ptStr) || days[0];
  return { mode: "live", target: today };
}

function HeroBlock({ match }) {
  if (!match) return null;
  const stop = window.TRIP_DATA.STOPS.find(s => s.id === match.stop);
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      background: "linear-gradient(180deg, var(--rust) 0%, var(--rust-deep) 100%)",
      color: "var(--cream-warm)",
      border: "1.5px solid var(--ink)", boxShadow: "6px 6px 0 var(--ink)",
      borderRadius: 4, padding: "28px 28px 24px",
    }}>
      {/* Decorative sun */}
      <div style={{ position: "absolute", top: -60, right: -60, opacity: 0.2, color: "var(--cream-warm)", pointerEvents: "none" }}>
        <PosterSun size={280} hue="ochre" />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
          <span className="chip solid" style={{ background: "var(--cream-warm)", color: "var(--ink)" }}>NEXT MATCH</span>
          {match.socceroos && <span className="chip" style={{ background: "var(--ochre)", color: "var(--ink)" }}>⚽ SOCCEROOS</span>}
          <span className="mono" style={{ fontSize: 11, opacity: 0.85, letterSpacing: 0.12 + "em" }}>{match.label}</span>
        </div>

        <div className="display hero-h1" style={{ fontSize: 72, lineHeight: 0.88, color: "var(--cream-warm)", margin: "8px 0 14px", textShadow: "2px 2px 0 var(--rust-deep)" }}>
          {match.home} <span style={{ opacity: 0.6, fontSize: 50 }}>v</span> {match.away}
        </div>

        <div className="r-hero-grid">
          <Countdown target={parseTripDateTime(match.date, match.time)}
            label={`${longWeekday(match.date)} ${dayOfMonth(match.date)} ${monthShort(match.date)}, ${match.time}`}
            sub={`${match.venue} · ${match.city}`} />
          <div>
            <div className="eyebrow" style={{ color: "color-mix(in oklab, var(--cream-warm) 80%, var(--ochre))", marginBottom: 6 }}>Match notes</div>
            <p style={{ margin: 0, fontFamily: "var(--f-serif)", fontSize: 14, lineHeight: 1.45, color: "var(--cream-warm)", opacity: 0.95 }}>
              {match.note}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TodayBlock({ today, store, onOpen, onGoto }) {
  const stop = window.TRIP_DATA.STOPS.find(s => s.id === today.target.stop);
  const ideas = allIdeas(store).map(i => mergeIdea(i, store))
    .filter(i => i.assigned === today.target.date);

  return (
    <div style={{
      background: "var(--paper)", border: "1.5px solid var(--ink)", boxShadow: "4px 4px 0 var(--ink)",
      borderRadius: 4, padding: "20px 22px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div className="eyebrow">
            {today.mode === "pre" && "Trip starts"}
            {today.mode === "live" && "Today"}
            {today.mode === "post" && "Trip wrap"}
          </div>
          <h3 className="display" style={{ margin: "4px 0 4px", fontSize: 32, lineHeight: 0.95 }}>
            {longWeekday(today.target.date)} {dayOfMonth(today.target.date)} {monthShort(today.target.date)}
          </h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span className="chip forest"><span className="mono">{String(stop.n).padStart(2,"0")}</span> {stop.name}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{stop.dates}</span>
          </div>
        </div>
        <button className="btn ghost tiny" onClick={() => onGoto("itinerary")}>Open itinerary →</button>
      </div>

      <p style={{ margin: "6px 0 14px", fontFamily: "var(--f-serif)", color: "var(--ink-soft)" }}>{today.target.title} — <em>{today.target.note}</em></p>

      <div className="eyebrow" style={{ marginBottom: 8 }}>On the plan</div>
      {ideas.length === 0 ? (
        <div style={{ padding: "10px 12px", border: "1px dashed var(--rule)", borderRadius: 2, color: "var(--ink-mute)", fontSize: 13 }}>
          No ideas assigned to this day yet. Drag favorites onto the day in the Itinerary.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ideas.map(i => (
            <div key={i.id} onClick={() => onOpen(i)} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
              padding: "8px 10px", border: "1px solid var(--rule)", borderRadius: 2, cursor: "pointer",
              background: "var(--cream-warm)",
            }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}>
                <CategoryChip cat={i.cat} />
                <span style={{ fontFamily: "var(--f-display)", fontSize: 16, textTransform: "uppercase", letterSpacing: 0.005 + "em" }}>{i.title}</span>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {i.must && <span className="chip rust">MUST</span>}
                <Avatar user={i.addedBy} size={18} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FavoritesStrip({ store, onOpen, stops, onGoto }) {
  const favs = allIdeas(store).map(i => mergeIdea(i, store)).filter(i => i.pinned).slice(0, 8);
  if (!favs.length) return null;
  return (
    <Section eyebrow="On the shortlist" title="Pinned favorites" decorate right={
      <button className="btn ghost tiny" onClick={() => onGoto("ideas")}>All ideas →</button>
    }>
      <div className="r-cards-grid dense">
        {favs.map(i => {
          const s = stops.find(x => x.id === i.stop);
          return <IdeaCard key={i.id} idea={i} stop={s} onOpen={onOpen} onPin={() => {}} dense />;
        })}
      </div>
    </Section>
  );
}

function ActivityBlock({ store }) {
  const items = store.state.activity.slice(0, 8);
  return (
    <div style={{ background: "var(--paper)", border: "1.5px solid var(--ink)", boxShadow: "4px 4px 0 var(--ink)", borderRadius: 4, padding: "16px 18px" }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>Recent activity</div>
      {items.length === 0 ? (
        <div style={{ color: "var(--ink-mute)", fontSize: 13, padding: "4px 0" }}>No changes yet. Pin a few favorites to get started.</div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((a, i) => (
            <li key={i} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13 }}>
              <Avatar user={a.user} size={20} />
              <span style={{ color: "var(--ink-soft)", flex: 1 }}>{a.text}</span>
              <span className="mono" style={{ fontSize: 10, color: "var(--ink-mute)" }}>{timeAgo(a.t)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function timeAgo(t) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return s + "s";
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  return Math.floor(s / 86400) + "d";
}

function MatchListMini({ matches, onOpenStop }) {
  return (
    <div style={{ background: "var(--paper)", border: "1.5px solid var(--ink)", boxShadow: "4px 4px 0 var(--ink)", borderRadius: 4, padding: "16px 18px" }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>All matches & fan days</div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {matches.map(m => {
          const at = parseTripDateTime(m.date, m.time);
          const past = at.getTime() < Date.now();
          return (
            <li key={m.id} style={{ display: "flex", gap: 12, alignItems: "center", opacity: past ? 0.5 : 1 }}>
              <div style={{ width: 44, textAlign: "center", borderRight: "1px solid var(--rule)", paddingRight: 10 }}>
                <div className="mono" style={{ fontSize: 9, color: "var(--ink-mute)", textTransform: "uppercase" }}>{shortWeekday(m.date)}</div>
                <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>{dayOfMonth(m.date)}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 16, textTransform: "uppercase", letterSpacing: 0.005 + "em" }}>
                  {m.home} <span style={{ color: "var(--ink-mute)" }}>v</span> {m.away}
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{m.time} · {m.venue}</div>
              </div>
              {m.socceroos && <span className="chip rust">SOCCEROOS</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StatStrip({ store, stops, matches }) {
  const ideas = allIdeas(store).map(i => mergeIdea(i, store));
  const total = ideas.length;
  const pinned = ideas.filter(i => i.pinned).length;
  const booked = ideas.filter(i => i.status === "booked").length;
  const confirms = window.TRIP_DATA.CONFIRMATIONS.length;
  const done = Object.values(store.state.confirms).filter(Boolean).length;

  const Stat = ({ k, v, hint }) => (
    <div style={{ flex: 1, minWidth: 0, padding: "12px 14px", borderRight: "1px solid var(--rule)" }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{k}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div className="display" style={{ fontSize: 32, lineHeight: 0.9 }}>{v}</div>
        {hint && <span className="mono" style={{ fontSize: 10, color: "var(--ink-mute)" }}>{hint}</span>}
      </div>
    </div>
  );

  return (
    <div className="r-stats-strip" style={{
      background: "var(--paper)", border: "1.5px solid var(--ink)", boxShadow: "4px 4px 0 var(--ink)",
      borderRadius: 4, overflow: "hidden",
    }}>
      <Stat k="Stops" v={stops.length} hint="8 cities" />
      <Stat k="Matches" v={matches.length} hint="3 ⚽ + 1 fan" />
      <Stat k="Ideas" v={total} hint="seeded + custom" />
      <Stat k="Pinned" v={pinned} />
      <Stat k="Bookings" v={`${done}/${confirms}`} hint="confirmed" />
    </div>
  );
}

function HomeView({ store, stops, matches, onOpenIdea, onGoto, activeUser }) {
  const next = nextMatch(matches);
  const today = todayInTrip();

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Hero: next match countdown */}
      <HeroBlock match={next} />

      {/* Stats strip */}
      <StatStrip store={store} stops={stops} matches={matches} />

      {/* Today + activity */}
      <div className="r-home-2col">
        <TodayBlock today={today} store={store} onOpen={onOpenIdea} onGoto={onGoto} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ActivityBlock store={store} />
          <MatchListMini matches={matches} />
        </div>
      </div>

      {/* Favorites */}
      <FavoritesStrip store={store} onOpen={onOpenIdea} stops={stops} onGoto={onGoto} />
    </div>
  );
}

Object.assign(window, { HomeView, Countdown, nextMatch, todayInTrip });
