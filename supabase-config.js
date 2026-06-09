// WC2026 Trip Planner — Supabase configuration
// ─────────────────────────────────────────────
// 1. In Supabase dashboard → SQL Editor, run:
//
//    create table public.trips (
//      id    text primary key,
//      state jsonb not null default '{}'
//    );
//
//    alter table public.trips disable row level security;
//
//    alter publication supabase_realtime add table public.trips;
//
// 2. Project Settings → API → copy Project URL and anon/public key below.
// ─────────────────────────────────────────────
window.SUPABASE_URL      = "YOUR_PROJECT_URL";   // https://xxxx.supabase.co
window.SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
