/* Itinerary view — day-by-day plan */

function DayCard({ day, stop, match, driveIn, store, idx, onOpenIdea, onAssign, onUnassign, onSetNote, user, onPick }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(store.state.dayNotes[day.date] || day.note);
  React.useEffect(() => { if (!editing) setDraft(store.state.dayNotes[day.date] || day.note); }, [day.date, editing]);

  const items = allIdeas(store).map(i => mergeIdea(i, store)).filter(i => i.assigned === day.date);
  const noteText = store.state.dayNotes[day.date] !== undefined ? store.state.dayNotes[day.date] : day.note;

  const [addOpen, setAddOpen] = React.useState(false);
  const pool = allIdeas(store).map(i => mergeIdea(i, store))
    .filter(i => i.stop === stop.id && !i.assigned)
    .sort((a, b) => (b.pinned - a.pinned) || a.title.localeCompare(b.title));

  const todayDate = new Date().toISOString().slice(0,10);
  const isToday = day.date === todayDate;
  const isPast = day.date < todayDate;

  return (
    <article className="r-day-grid">
      {/* Date column */}
      <div style={{ position: "relative" }}>
        <div className="day-date-card" style={{
          width: 70, padding: "10px 6px", textAlign: "center",
          background: isToday ? "var(--rust)" : "var(--paper)",
          color: isToday ? "var(--cream-warm)" : "var(--ink)",
          border: "1.5px solid var(--ink)", boxShadow: "2.5px 2.5px 0 var(--ink)",
          borderRadius: 2, opacity: isPast ? 0.55 : 1,
        }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: 0.18 + "em", textTransform: "uppercase", opacity: 0.8 }}>{shortWeekday(day.date)}</div>
          <div className="display" style={{ fontSize: 30, lineHeight: 0.9, marginTop: 2 }}>{dayOfMonth(day.date)}</div>
          <div className="mono" style={{ fontSize: 9, opacity: 0.8, marginTop: 2 }}>{monthShort(day.date).toUpperCase()}</div>
        </div>
        {/* vertical thread */}
        <div style={{ position: "absolute", left: 35, top: 86, width: 2, bottom: -8, background: "repeating-linear-gradient(to bottom, var(--ink) 0 4px, transparent 4px 8px)", opacity: 0.6 }} />
      </div>

      {/* Day content */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span className="chip" style={{ background: "transparent", border: "1px solid var(--rule)", color: "var(--ink-soft)", cursor: "pointer" }} onClick={() => onPick(stop.id)}>
                <span className="mono" style={{ fontSize: 9, opacity: 0.6 }}>{String(stop.n).padStart(2,"0")}</span> {stop.name}
              </span>
              {isToday && <span className="chip rust">TODAY</span>}
              {driveIn && <span className="chip navy">{driveIn.duration_h}h drive in</span>}
              {match && <span className="chip rust">⚽ {match.home} v {match.away} · {match.time}</span>}
            </div>
            <h3 className="display" style={{ margin: "8px 0 0", fontSize: 26, lineHeight: 0.95, color: isPast ? "var(--ink-mute)" : "var(--ink)" }}>
              {day.title}
            </h3>
          </div>
          <button className="btn ghost tiny" onClick={() => setAddOpen(o => !o)}>{addOpen ? "Close" : "+ Add to day"}</button>
        </div>

        {/* Editable note */}
        {editing ? (
          <div style={{ marginTop: 8 }}>
            <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={2} style={inputStyle()} />
            <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "flex-end" }}>
              <button className="btn ghost tiny" onClick={() => { setEditing(false); setDraft(noteText); }}>Cancel</button>
              <button className="btn primary tiny" onClick={() => { onSetNote(day.date, draft, user); setEditing(false); }}>Save</button>
            </div>
          </div>
        ) : (
          <p onClick={() => setEditing(true)} style={{
            margin: "8px 0 12px", fontFamily: "var(--f-serif)", color: "var(--ink-soft)",
            cursor: "text", padding: "2px 4px",
            borderLeft: "2px solid var(--rule)",
            fontStyle: noteText ? "normal" : "italic",
          }} title="Click to edit">
            {noteText || "Add a note for this day…"}
          </p>
        )}

        {/* Match block */}
        {match && (
          <div style={{
            background: "color-mix(in oklab, var(--rust) 10%, var(--paper))",
            border: "1.5px solid var(--rust)", borderLeft: "6px solid var(--rust)",
            padding: "8px 12px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
          }}>
            <div>
              <div className="eyebrow" style={{ color: "var(--rust-deep)" }}>{match.label}</div>
              <div className="display" style={{ fontSize: 22, lineHeight: 0.95, color: "var(--rust-deep)" }}>
                {match.home} <span style={{ opacity: 0.6 }}>v</span> {match.away}
              </div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2 }}>
                {match.time} · {match.venue} · {match.city}
              </div>
            </div>
            <div style={{ maxWidth: 360, fontSize: 12, color: "var(--ink-soft)", fontFamily: "var(--f-serif)" }}>{match.note}</div>
          </div>
        )}

        {/* Add panel */}
        {addOpen && (
          <div style={{
            background: "var(--cream-warm)", border: "1.5px dashed var(--ink)", borderRadius: 2,
            padding: "10px 12px", marginBottom: 10,
          }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Add to {longWeekday(day.date)} · pool of unassigned ideas for {stop.name}</div>
            {pool.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>No unassigned ideas. Add one or assign already-assigned items via their card.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 6, maxHeight: 220, overflow: "auto" }}>
                {pool.slice(0, 60).map(i => (
                  <button key={i.id} onClick={() => onAssign(i, day.date)} style={{
                    textAlign: "left", padding: "6px 8px", border: "1px solid var(--rule)",
                    background: "var(--paper)", borderRadius: 2, cursor: "pointer",
                    display: "flex", gap: 6, alignItems: "center", fontFamily: "var(--f-body)",
                  }}>
                    {i.pinned && <span style={{ color: "var(--ochre)" }}>★</span>}
                    <CatIcon cat={i.cat} size={12} />
                    <span style={{ fontSize: 12, color: "var(--ink)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assigned ideas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {items.length === 0 ? (
            <div style={{ padding: "8px 10px", border: "1px dashed var(--rule)", borderRadius: 2, color: "var(--ink-mute)", fontSize: 12 }}>
              Nothing planned. Click <em>+ Add to day</em>.
            </div>
          ) : items.map(i => (
            <div key={i.id} onClick={() => onOpenIdea(i)} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
              padding: "8px 10px", border: "1px solid var(--rule)", borderRadius: 2,
              background: "var(--paper)", cursor: "pointer",
            }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}>
                <CategoryChip cat={i.cat} />
                <span style={{ fontFamily: "var(--f-display)", fontSize: 15, textTransform: "uppercase" }}>{i.title}</span>
                {i.must && <span className="chip rust">MUST</span>}
                {i.time && i.time !== "evening" && <span className="mono" style={{ fontSize: 10, color: "var(--ink-mute)" }}>· {i.time}</span>}
                {i.time === "evening" && <span className="mono" style={{ fontSize: 10, color: "var(--ink-mute)" }}>· eve</span>}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <StatusDot status={i.status} />
                <Avatar user={i.addedBy} size={18} />
                <button className="btn ghost tiny icon" onClick={(e) => { e.stopPropagation(); onUnassign(i); }} title="Remove from day">×</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function ItineraryView({ stops, days, drives, matches, store, onOpenIdea, onPick, user }) {
  const driveByDate = {};
  // map drives onto arrival days
  drives.forEach(d => {
    const toStop = stops.find(s => s.id === d.to);
    if (toStop) driveByDate[toStop.arrive] = d;
  });
  const matchByDate = {};
  matches.forEach(m => { matchByDate[m.date] = m; });

  const onAssign = (idea, date) => store.assignToDay(idea, date, user);
  const onUnassign = (idea) => store.assignToDay(idea, null, user);

  return (
    <div className="fade-up r-itin-grid">
      <div>
        <Section eyebrow="12 → 26 Jun · 15 days" title="Day by Day" decorate>
          <div>
            {days.map((d, idx) => {
              const stop = stops.find(s => s.id === d.stop);
              return (
                <DayCard
                  key={d.date}
                  day={d}
                  stop={stop}
                  match={matchByDate[d.date]}
                  driveIn={driveByDate[d.date]}
                  store={store}
                  idx={idx}
                  onOpenIdea={onOpenIdea}
                  onAssign={onAssign}
                  onUnassign={onUnassign}
                  onSetNote={store.setDayNote}
                  user={user}
                  onPick={onPick}
                />
              );
            })}
          </div>
        </Section>
      </div>

      <PinnedRail store={store} stops={stops} onOpen={onOpenIdea} />
    </div>
  );
}

function PinnedRail({ store, stops, onOpen }) {
  const pinned = allIdeas(store).map(i => mergeIdea(i, store)).filter(i => i.pinned && !i.assigned);
  return (
    <aside className="r-pinned-rail">
      <div style={{
        background: "var(--paper)", border: "1.5px solid var(--ink)",
        boxShadow: "4px 4px 0 var(--ink)", borderRadius: 4, padding: 16,
      }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>Pool</div>
        <h3 className="display" style={{ margin: "0 0 4px", fontSize: 22, lineHeight: 0.95 }}>Pinned, not yet planned</h3>
        <div className="mono" style={{ fontSize: 11, color: "var(--ink-mute)", marginBottom: 12 }}>
          {pinned.length} favorite{pinned.length === 1 ? "" : "s"} · use “+ Add to day” to slot them in
        </div>
        {pinned.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--ink-mute)", padding: "6px 0" }}>Pin your favorites in the Ideas tab — they'll appear here ready to drop onto days.</div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {pinned.map(i => {
              const s = stops.find(x => x.id === i.stop);
              return (
                <li key={i.id} onClick={() => onOpen(i)} style={{
                  display: "flex", flexDirection: "column", gap: 4,
                  padding: "8px 10px", border: "1px solid var(--rule)", borderRadius: 2,
                  background: "var(--cream-warm)", cursor: "pointer",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: "var(--f-display)", fontSize: 14, textTransform: "uppercase", letterSpacing: 0.005 + "em" }}>{i.title}</span>
                    <Avatar user={i.addedBy} size={16} />
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-mute)" }}>{s?.name} · {CAT_LABEL[i.cat]}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

Object.assign(window, { ItineraryView, DayCard, PinnedRail });
