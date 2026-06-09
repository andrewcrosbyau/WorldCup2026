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
window.SUPABASE_URL      = "https://cbabsnogruprypmvkuzv.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiYWJzbm9ncnVwcnlwbXZrdXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NzM0MDQsImV4cCI6MjA5NjQ0OTQwNH0.oalxO-F92xNGeM3ZFsRogSbY6w0PlUP0ael-1B-erXg";
