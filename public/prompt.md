# Session Prompts Log - SG Bus Arrival Application

This document collates all prompts used during the development session on **October 14–15, 2026**.

---

### Prompt 1: Initial Application Build (Frontend)

**Timestamp:** 2026-10-14 23:40:57 (Local)  
**Goal:** Build Singapore Bus Arrival Time & Live Location Tracking Frontend

```text
build a singapore based bus arrival time application that tracks real time bus locations and provides accurate wait time prediction for all LTA bus stops

build just the front end for now, I will include the backend connection later.
```

#### Outcome:
- Created Singapore bus arrival tracker matching LTA DataMall v2/v3 specifications.
- Implemented interactive Leaflet map centered on Singapore with stops and live animated buses.
- Built 3-tier arrival prediction cards (Next Bus, 2nd Bus, 3rd Bus) with crowd occupancy (`SEA`, `SDA`, `LSD`), vehicle deck type (`DD`, `SD`), and wheelchair accessibility (`WAB`).
- Integrated Stop Search, Nearby Stops with GPS distance, Bookmarks, and Service Route Explorer.
- Built Commuter Arrival Alarm and traffic delay simulation factors.

---

### Prompt 2: GitHub Repository Push

**Timestamp:** 2026-10-14 23:52:31 (Local)  
**Goal:** Initialize Git and Push Codebase to GitHub

```text
git push https://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https://github.com/demonsori-hub/LTA-BUS-ARRIVAL.git
```

#### Outcome:
- Initialized local Git repository on `main` branch.
- Added and committed all project files.
- Connected remote repository `https://github.com/demonsori-hub/LTA-BUS-ARRIVAL.git` and successfully pushed.
- Cleaned up local remote configuration for credential safety.

---

### Prompt 3: Serverless Backend Connection for LTA DataMall

**Timestamp:** 2026-10-15 00:06:51 (Local)  
**Goal:** Create Serverless API Endpoints in Root `/api` Directory for Live LTA Data

```text
add a serverless connection that pulls live data from LTA Datamall using the following endpoints:

- store this in /api folder (project root level) not the src folder
- include /health.ts and /busarrival.ts within that subfolder
- do not hardcode any key, I will include them later

GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=83139

# AccountKey: <LTA_ACCOUNT_KEY>

# accept: application/json
```

#### Outcome:
- Created `/api/busarrival.ts` at root level to forward live requests to LTA DataMall v3 (`https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival`).
- Created `/api/health.ts` for serverless API status and health checks.
- Handled `LTA_ACCOUNT_KEY` environment variable without hardcoding keys.
- Implemented `server.ts` Express entry point mounting `/api/*` handlers with Vite middlewares on port 3000.
- Updated `.env.example` with `LTA_ACCOUNT_KEY`.
- Verified endpoints via `curl` and pushed commit to GitHub.

---

### Prompt 4: Export Session Prompts

**Timestamp:** 2026-10-15 00:55:27 (Local)  
**Goal:** Collate and store all session prompts into a downloadable `prompt.md` file

```text
collate and store all the prompts i used today into a downloadable prompt.md file
```

#### Outcome:
- Generated comprehensive `prompt.md` file archiving all user prompts and delivery milestones.
- Enabled direct browser download from the UI navigation bar and API connector.
