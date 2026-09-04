# Last Man Standing — Premier League Tracker

## Summary
A React + Firebase web app for a commissioner to manage a private Premier League Last Man Standing pool. Players pick one PL team per gameweek; repeat picks are forbidden and a loss means elimination. The commissioner enters all picks and tracks everything; Firebase gives cross-device sync when logged in, browser local storage works without login.

## Goals
- Give the commissioner a clean UI to manage picks, results, and standings instead of a spreadsheet
- Enforce the "no repeat teams" rule automatically
- Auto-fetch PL fixtures and results from the FPL API
- Support cross-device access when logged in via Firebase

## Non-goals
- Player self-service logins or pick submission
- Multi-pool / public marketplace
- Buy-backs or multi-life variations (strict one-life elimination only)
- Mobile app (web responsive is enough)

## Users / stakeholders
- **Commissioner** — sole user; enters all picks, manages the pool, records payment status
- **Players** — offline participants; no app access (for now)

## Success criteria
- Commissioner can run a full season without touching a spreadsheet
- No incorrect pick accepted (team already used by that player is blocked)
- Pool works offline (local storage) and syncs when logged in

## Scope
**In:**
- Commissioner auth (Google/email login via Firebase)
- Guest mode with local storage fallback
- Player roster management (name, payment status, active/eliminated)
- Weekly pick entry per player (with repeat-team validation)
- Auto-fetch fixtures + results from FPL API
- Auto-evaluate picks each gameweek and mark eliminations
- Configurable prize structure (winner-take-all, or custom split percentages)
- Prize pot tracker (entry fees, running total)
- Pick history view per player
- Gameweek standings / survivor list

**Out:**
- Player-facing logins
- Buy-backs or second lives
- Push notifications / reminders
- Public pool discovery

## Constraints
- Tech stack: React + Vite + Firebase (Firestore + Auth)
- Linting & formatting: OXC (oxlint + oxc formatter)
- FPL API: `fantasy.premierleague.com/api/` — no key required, but CORS may require a proxy
- Data lives in local storage (guest) or Firestore (logged in); migration path between the two is needed

## Edge cases & failure modes
- **FPL API down or delayed** — commissioner can manually override a result
- **Postponed match** — pick should be voided for that week, not penalised
- **All players eliminated same week** — app should handle a shared-winner or rollover scenario
- **Guest → logged in migration** — local data should be importable into Firebase on first login

## Open questions
- Should there be a pick deadline (locked before kick-off), or does the commissioner control when picks close?
- If multiple players survive the full season, how is the winner determined?
- Is there a maximum number of players per pool?
- Will the commissioner want to export data (CSV, PDF) at season end?
